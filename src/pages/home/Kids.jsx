import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useContent } from '../../context/ContentContext';
import { useRouter } from '../../context/RouterContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useToast } from '../../context/ToastContext';
import MovieCard from '../../components/cards/MovieCard';
import SeriesCard from '../../components/cards/SeriesCard';
import Badge from '../../components/common/Badge';
import { Play, ChevronLeft, ChevronRight, Volume2, VolumeX, Plus, Check, Info, SlidersHorizontal } from 'lucide-react';

export default function Kids() {
  const { movies, series } = useContent();
  const { navigate } = useRouter();
  const { toggleMyList, isInMyList } = usePlayback();
  const { addToast } = useToast();

  // Filter kids friendly items (marked isKids)
  const kidsMovies = movies.filter(m => m.isKids);
  const kidsSeries = series.filter(s => s.isKids);

  // Filters State
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [filtersDropdownOpen, setFiltersDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setFiltersDropdownOpen(false);
        setSortDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const formats = ['All', 'Movies', 'Series'];
  const genres = useMemo(() => {
    const all = [...kidsMovies.flatMap(m => m.genres || []), ...kidsSeries.flatMap(s => s.genres || [])];
    return ['All', ...new Set(all)];
  }, [kidsMovies, kidsSeries]);

  const isFiltered = selectedGenre !== 'All' || selectedFormat !== 'All';

  const processedKidsContent = useMemo(() => {
    let list = [];
    if (selectedFormat === 'All' || selectedFormat === 'Movies') {
      list = [...list, ...kidsMovies.map(m => ({ ...m, type: 'movie' }))];
    }
    if (selectedFormat === 'All' || selectedFormat === 'Series') {
      list = [...list, ...kidsSeries.map(s => ({ ...s, type: 'series' }))];
    }

    // Genre filter
    if (selectedGenre !== 'All') {
      list = list.filter(item => item.genres?.includes(selectedGenre));
    }

    // Sorting
    if (sortBy === 'newest') {
      list.sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [kidsMovies, kidsSeries, selectedGenre, selectedFormat, sortBy]);

  // Fallback default kids spotlight slide
  const defaultKidsSpotlight = {
    id: "welcome-kids-slide",
    title: "KIDS CARTOONS & MOVIES",
    description: "Safe, kid-friendly entertainment. Explore amazing animated movies, cartoons, and family stories uploaded to SCF STUDIOS.",
    coverImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop",
    posterImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop",
    year: 2026,
    duration: "Collection",
    rating: "G",
    language: "All Languages",
    quality: "UHD"
  };

  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [muted, setMuted] = useState(true);

  // Slides: all kids friendly movies and series combined (fallback to defaultKidsSpotlight if empty)
  const featuredSlides = useMemo(() => {
    const list = [...kidsMovies, ...kidsSeries];
    const sourceList = list.length > 0 ? list : [defaultKidsSpotlight];
    return sourceList.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      coverImage: item.coverImageUrl || item.coverImage,
      posterImage: item.posterUrl || item.poster,
      year: item.year || 2026,
      duration: item.seasons ? `${item.seasons?.length || 0} Season(s)` : item.duration,
      rating: item.rating || 'G',
      language: item.language || 'English',
      quality: item.quality || '4K UHD',
      type: item.seasons ? 'series' : (item.id === "welcome-kids-slide" ? "welcome" : "movie")
    }));
  }, [kidsMovies, kidsSeries]);

  // Rotate hero slides
  useEffect(() => {
    if (featuredSlides.length <= 1) return;
    const slideInterval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % featuredSlides.length);
    }, 10000);
    return () => clearInterval(slideInterval);
  }, [featuredSlides.length]);

  const handlePrevSlide = () => {
    setFeaturedIndex(prev => (prev - 1 + featuredSlides.length) % featuredSlides.length);
  };

  const handleNextSlide = () => {
    setFeaturedIndex(prev => (prev + 1) % featuredSlides.length);
  };

  const featured = featuredSlides[featuredIndex];
  const isAdded = featured && featured.id !== 'welcome-kids-slide' && isInMyList(featured.id);

  const handleHeroPlay = () => {
    if (!featured) return;
    if (featured.id === 'welcome-kids-slide') return;
    navigate(`/watch/${featured.id}`);
  };

  const handleHeroToggleList = () => {
    if (!featured || featured.id === 'welcome-kids-slide') return;
    toggleMyList(featured.id);
    addToast(isAdded ? "Removed from My List" : "Added to My List", "success");
  };

  const handleHeroInfo = () => {
    if (!featured || featured.id === 'welcome-kids-slide') return;
    navigate(featured.type === 'series' ? `/series/${featured.id}` : `/movie/${featured.id}`);
  };

  const railRefs = useRef({});
  const scrollRail = (railId, direction) => {
    const el = railRefs.current[railId];
    if (el) {
      const scrollAmt = direction === 'left' ? -400 : 400;
      el.scrollBy({ left: scrollAmt, behavior: 'smooth' });
    }
  };

  const kidsContent = useMemo(() => [...kidsMovies, ...kidsSeries], [kidsMovies, kidsSeries]);

  const kidsRails = [
    { id: 'kids-trending', title: 'Trending Kids Content', filter: (list) => [...list].sort((a, b) => b.year - a.year) },
    { id: 'kids-comedy', title: 'Kids Comedy', filter: (list) => list.filter(item => item.genre === 'Comedy') },
    { id: 'kids-romance', title: 'Kids Romance', filter: (list) => list.filter(item => item.genre === 'Romance') },
    { id: 'kids-horror', title: 'Kids Spooky Spooky (Horror)', filter: (list) => list.filter(item => item.genre === 'Horror') },
    { id: 'kids-drama', title: 'Kids Drama', filter: (list) => list.filter(item => item.genre === 'Drama') },
    { id: 'kids-sci-fi', title: 'Kids Sci-Fi & Adventure', filter: (list) => list.filter(item => item.genre === 'Sci-Fi') },
    { id: 'kids-family', title: 'Family Movies', filter: (list) => list.filter(item => item.genre === 'Family') },
  ];

  return (
    <div className="pb-16 min-h-screen bg-background">
      {/* Kids Spotlight Hero */}
      {featured && (
        <section className="relative w-full min-h-[50vh] sm:h-[65vh] md:h-[80vh] pt-24 pb-6 sm:pb-8 md:pb-10 overflow-hidden flex items-end group/hero">
          {/* Widescreen cover image on desktop / Poster image on mobile */}
          <div className="absolute inset-0 z-0">
            <img
              src={featured.posterImage || featured.coverImage}
              alt={featured.title}
              className="block sm:hidden w-full h-full object-cover opacity-85 scale-102 animate-fade-in transition-all duration-1000"
            />
            <img
              src={featured.coverImage}
              alt={featured.title}
              className="hidden sm:block w-full h-full object-cover opacity-80 scale-105 animate-fade-in transition-all duration-1000"
            />
            {/* Gradients to blend cover image into black background */}
            <div className="absolute bottom-0 left-0 w-full h-[20%] bg-gradient-to-t from-background/90 to-transparent pointer-events-none"></div>
            {/* Bottom-left dark gradient vignette to enhance text readability - covers 80% of banner height */}
            <div className="absolute bottom-0 left-0 w-full h-[80%] bg-gradient-to-t from-black/90 via-black/60 via-black/25 to-transparent pointer-events-none"></div>
          </div>

          {/* Hero Content Overlay */}
          <div className="relative z-10 w-full px-4 md:px-12 select-text">
            <div className="max-w-4xl">
              {/* Brand Signature Watermark Logo */}
              <div className="flex items-center gap-2 mb-4 opacity-90 select-none">
                <img src="/logo-square.jpg" className="h-8 object-contain invert brightness-125 rounded-md" alt="SCF STUDIOS" />
                <span className="text-[10px] font-bold tracking-widest text-text-secondary uppercase">SCF STUDIOS Presents</span>
              </div>

              {/* Metadata badges row */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3.5">
                <Badge variant="original" className="bg-yellow-500 text-black border-transparent font-extrabold">KIDS SPACE</Badge>
                {featured.type === 'series' && <Badge variant="default" className="bg-white/10 text-white font-bold">Series</Badge>}
                <span className="text-xs font-semibold text-text-secondary">{featured.year}</span>
                <span className="text-text-muted">&middot;</span>
                <span className="text-xs font-semibold text-text-secondary">{featured.duration}</span>
                <span className="text-text-muted">&middot;</span>
                <span className="text-[10px] font-bold border border-white/20 px-1 rounded text-text-secondary">{featured.rating}</span>
                <span className="text-text-muted">&middot;</span>
                <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">{featured.quality}</span>
                
                {/* Language & Sound inline beside 4K */}
                <span className="text-text-muted">&middot;</span>
                <span className="text-xs font-semibold text-text-muted">
                  Language: <span className="text-text-secondary">{featured.language}</span>
                </span>
                <span className="text-text-muted">&middot;</span>
                <button
                  onClick={() => setMuted(!muted)}
                  className="w-6 h-6 rounded-full bg-white/10 border border-white/10 text-white flex items-center justify-center hover:bg-white/15 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title={muted ? "Unmute" : "Mute"}
                >
                  {muted ? <VolumeX className="w-3 h-3 text-text-secondary" /> : <Volume2 className="w-3 h-3" />}
                </button>
              </div>

              {/* Heading */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2.5 uppercase leading-none drop-shadow-lg">
                {featured.title}
              </h1>

              {/* Tagline / Description */}
              <p className="text-xs md:text-sm text-text-secondary font-medium leading-tight max-w-xl mb-5 line-clamp-3 md:line-clamp-4 drop-shadow-md">
                {featured.description}
              </p>
            </div>

            <div className="relative flex flex-col md:flex-row md:items-center w-full mb-2 gap-6 md:gap-0 mt-6">
              <div className="flex flex-row items-center gap-2 sm:gap-3">
                {featured.id !== "welcome-kids-slide" && (
                  <>
                    <button
                      onClick={handleHeroPlay}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold rounded-lg shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 active:scale-95 text-[11px] sm:text-xs md:text-sm whitespace-nowrap"
                    >
                      <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black" />
                      Watch Now
                    </button>

                    <button
                      onClick={handleHeroToggleList}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold rounded-lg transition-all hover:scale-105 active:scale-95 text-[11px] sm:text-xs md:text-sm whitespace-nowrap"
                    >
                      {isAdded ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> : <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      My List
                    </button>

                    <button
                      onClick={handleHeroInfo}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold rounded-lg transition-all hover:scale-105 active:scale-95 text-[11px] sm:text-xs md:text-sm whitespace-nowrap"
                    >
                      <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      More Info
                    </button>
                  </>
                )}
              </div>

              {/* Scroller Dots (Centered horizontally on desktop relative to parent, centered below on mobile) */}
              <div className="flex justify-center items-center md:absolute md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 z-20">
                <div className="flex gap-1.5">
                  {featuredSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFeaturedIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        featuredIndex === idx ? 'w-6 bg-yellow-500' : 'w-1.5 bg-white/20 hover:bg-white/40'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    ></button>
                  ))}
                </div>
              </div>

              {/* Filter & Sort Controls (Right-aligned on the same line) */}
              <div className="flex items-center justify-center gap-2.5 md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 z-30 mt-4 md:mt-0">
                {/* Filter Dropdown Container */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => {
                      setFiltersDropdownOpen(!filtersDropdownOpen);
                      setSortDropdownOpen(false);
                    }}
                    className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      isFiltered 
                        ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Filter</span>
                    {isFiltered && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>}
                  </button>

                  {/* Filters Dropdown Menu */}
                  {filtersDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-72 bg-card-bg/95 border border-white/10 rounded-xl p-4 shadow-xl z-50 backdrop-blur-lg flex flex-col gap-3.5">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Filters</span>
                        {isFiltered && (
                          <button
                            onClick={() => {
                              setSelectedGenre('All');
                              setSelectedFormat('All');
                            }}
                            className="text-[10px] text-yellow-500 hover:underline font-bold animate-fade-in"
                          >
                            Reset All
                          </button>
                        )}
                      </div>
                      {/* Genre */}
                      <div className="flex flex-col gap-1.5 text-xs">
                        <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Genre</span>
                        <select
                          value={selectedGenre}
                          onChange={(e) => setSelectedGenre(e.target.value)}
                          className="bg-background border border-white/10 rounded-lg px-2.5 py-1.5 outline-none focus:border-yellow-500 text-white"
                        >
                          {genres.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      {/* Format */}
                      <div className="flex flex-col gap-1.5 text-xs">
                        <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Format</span>
                        <select
                          value={selectedFormat}
                          onChange={(e) => setSelectedFormat(e.target.value)}
                          className="bg-background border border-white/10 rounded-lg px-2.5 py-1.5 outline-none focus:border-yellow-500 text-white"
                        >
                          {formats.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sort Dropdown Container */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => {
                      setSortDropdownOpen(!sortDropdownOpen);
                      setFiltersDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3 h-3 rotate-90" />
                    <span>Sort By</span>
                  </button>

                  {/* Sort Dropdown Menu */}
                  {sortDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card-bg/95 border border-white/10 rounded-xl p-3 shadow-xl z-50 backdrop-blur-lg flex flex-col gap-1">
                      <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold mb-1 px-1">Sort Options</span>
                      <button
                        onClick={() => { setSortBy('newest'); setSortDropdownOpen(false); }}
                        className={`text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${sortBy === 'newest' ? 'bg-yellow-500/20 text-yellow-500' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}
                      >
                        Release: Newest
                      </button>
                      <button
                        onClick={() => { setSortBy('title'); setSortDropdownOpen(false); }}
                        className={`text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${sortBy === 'title' ? 'bg-yellow-500/20 text-yellow-500' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}
                      >
                        Title: A-Z
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Left/Right Arrow Buttons (Scrollers) - Always visible on sides */}
          {featuredSlides.length > 1 && (
            <>
              <button
                onClick={handlePrevSlide}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/45 border border-white/10 text-white flex items-center justify-center hover:bg-black/85 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              </button>
              <button
                onClick={handleNextSlide}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/45 border border-white/10 text-white flex items-center justify-center hover:bg-black/85 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              </button>
            </>
          )}
        </section>
      )}

      {/* Content Area */}
      <section className={`relative z-10 bg-background pb-12 ${featured && !isFiltered ? '-mt-8 pt-2' : 'pt-6'}`}>
        {isFiltered ? (
          <div className="w-full px-0">
            <h2 className="text-xl md:text-2xl font-extrabold text-white mb-6 px-4 md:px-12">
              {selectedGenre === 'All' ? 'Kids Favorites' : `${selectedGenre} Kids Content`}
              <span className="ml-2 text-xs font-semibold text-text-muted">({processedKidsContent.length} results)</span>
            </h2>

            {processedKidsContent.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center px-4 md:px-12 animate-fade-in">
                <p className="text-text-secondary text-sm font-semibold">No matches found for the selected criteria.</p>
                <button
                  onClick={() => {
                    setSelectedGenre('All');
                    setSelectedFormat('All');
                  }}
                  className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg text-xs tracking-wider transition-all active:scale-95 cursor-pointer"
                >
                  CLEAR FILTERS
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5 px-0 animate-fade-in">
                {processedKidsContent.map(item => item.type === 'series' ? (
                  <SeriesCard key={item.id} series={item} />
                ) : (
                  <MovieCard key={item.id} movie={item} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Rails Content List */
          <div className="w-full px-0 space-y-6">
            {kidsRails.map(rail => {
              const railItems = rail.filter(kidsContent);
              if (railItems.length === 0) return null;

              return (
                <div key={rail.id} className="relative group/rail py-4 px-0">
                  <h3 className="text-base md:text-lg font-extrabold tracking-wide text-text-primary mb-3 px-4 md:px-12">
                    {rail.title}
                  </h3>

                  {/* Scroll Left Button */}
                  <button
                    onClick={() => scrollRail(rail.id, 'left')}
                    className="absolute left-2 top-[calc(50%-10px)] z-30 w-10 h-10 rounded-full bg-background/80 border border-white/5 text-white flex items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-opacity duration-300 hover:bg-card-bg hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Horizontal Container */}
                  <div
                    ref={el => railRefs.current[rail.id] = el}
                    className="flex items-center gap-4 md:gap-5 overflow-x-auto no-scrollbar py-2 px-0"
                  >
                    {railItems.map(item => item.seasons ? (
                      <SeriesCard key={item.id} series={item} />
                    ) : (
                      <MovieCard key={item.id} movie={item} />
                    ))}
                  </div>

                  {/* Scroll Right Button */}
                  <button
                    onClick={() => scrollRail(rail.id, 'right')}
                    className="absolute right-2 top-[calc(50%-10px)] z-30 w-10 h-10 rounded-full bg-background/80 border border-white/5 text-white flex items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-opacity duration-300 hover:bg-card-bg hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
