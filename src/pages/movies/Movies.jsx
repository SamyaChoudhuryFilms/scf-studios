import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useContent } from '../../context/ContentContext';
import { useRouter } from '../../context/RouterContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useToast } from '../../context/ToastContext';
import MovieCard from '../../components/cards/MovieCard';
import Badge from '../../components/common/Badge';
import { Play, Info, ChevronLeft, ChevronRight, SlidersHorizontal, Volume2, VolumeX, Plus, Check } from 'lucide-react';

export default function Movies() {
  const { movies } = useContent();
  const { navigate } = useRouter();
  const { toggleMyList, isInMyList } = usePlayback();
  const { addToast } = useToast();

  // Filters State
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
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

  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [muted, setMuted] = useState(true);

  // Slides: all movies (excluding coming soon, fallback to all if empty)
  const featuredSlides = useMemo(() => {
    const activeMovies = movies.filter(m => !m.isComingSoon);
    const list = activeMovies.length > 0 ? activeMovies : movies;
    return list.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      coverImage: m.coverImageUrl || m.coverImage,
      posterImage: m.posterUrl || m.poster,
      year: m.year,
      duration: m.duration,
      rating: m.rating || 'G',
      language: m.language,
      quality: m.quality || '4K UHD',
      type: 'movie'
    }));
  }, [movies]);

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
  const isAdded = featured && featured.id !== 'welcome-slide' && isInMyList(featured.id);

  const handleHeroPlay = () => {
    if (!featured) return;
    if (featured.id === 'welcome-slide') {
      addToast("Add content in your studio console to watch videos.", "info");
      return;
    }
    navigate(`/watch/${featured.id}`);
  };

  const handleHeroToggleList = () => {
    if (!featured || featured.id === 'welcome-slide') return;
    toggleMyList(featured.id);
    addToast(isAdded ? "Removed from My List" : "Added to My List", "success");
  };

  const handleHeroInfo = () => {
    if (!featured || featured.id === 'welcome-slide') return;
    navigate(`/movie/${featured.id}`);
  };

  // Extract unique genres, languages, years, ratings for filters
  const genres = ['All', 'Sci-Fi', 'Thriller', 'Drama', 'Action', 'Romance', 'Comedy', 'Horror', 'Family'];
  const languages = ['All', 'English', 'Bengali', 'Hindi'];
  const years = ['All', '2026', '2025', '2024'];
  const ratings = ['All', 'G', 'PG', '13+', '16+'];

  // Filtered and Sorted Movies list
  const processedMovies = useMemo(() => {
    let list = [...movies];

    if (selectedGenre !== 'All') {
      list = list.filter(m => m.genre === selectedGenre);
    }
    if (selectedLanguage !== 'All') {
      list = list.filter(m => m.language === selectedLanguage);
    }
    if (selectedYear !== 'All') {
      list = list.filter(m => {
        const y = m.year ? m.year.toString() : (m.releaseDate ? m.releaseDate.substring(0, 4) : '2026');
        return y === selectedYear;
      });
    }
    if (selectedRating !== 'All') {
      list = list.filter(m => m.rating === selectedRating);
    }

    // Sort
    if (sortBy === 'newest') {
      list.sort((a, b) => {
        const yA = a.year || (a.releaseDate ? parseInt(a.releaseDate.substring(0, 4)) : 2026);
        const yB = b.year || (b.releaseDate ? parseInt(b.releaseDate.substring(0, 4)) : 2026);
        return yB - yA;
      });
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => {
        const yA = a.year || (a.releaseDate ? parseInt(a.releaseDate.substring(0, 4)) : 2026);
        const yB = b.year || (b.releaseDate ? parseInt(b.releaseDate.substring(0, 4)) : 2026);
        return yA - yB;
      });
    } else if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [movies, selectedGenre, selectedLanguage, selectedYear, selectedRating, sortBy]);

  const isFiltered = selectedGenre !== 'All' || selectedLanguage !== 'All' || selectedYear !== 'All' || selectedRating !== 'All';

  const railRefs = useRef({});
  const scrollRail = (railId, direction) => {
    const el = railRefs.current[railId];
    if (el) {
      const scrollAmt = direction === 'left' ? -400 : 400;
      el.scrollBy({ left: scrollAmt, behavior: 'smooth' });
    }
  };

  const movieRails = [
    { id: 'trending', title: 'Trending Movies', filter: (list) => [...list].sort((a, b) => b.year - a.year) },
    { id: 'sci-fi', title: 'Sci-Fi Movies', filter: (list) => list.filter(m => m.genre === 'Sci-Fi') },
    { id: 'thriller', title: 'Thriller Movies', filter: (list) => list.filter(m => m.genre === 'Thriller') },
    { id: 'drama', title: 'Drama Movies', filter: (list) => list.filter(m => m.genre === 'Drama') },
    { id: 'action', title: 'Action Movies', filter: (list) => list.filter(m => m.genre === 'Action') },
    { id: 'romance', title: 'Romance Movies', filter: (list) => list.filter(m => m.genre === 'Romance') },
    { id: 'comedy', title: 'Comedy Movies', filter: (list) => list.filter(m => m.genre === 'Comedy') },
    { id: 'horror', title: 'Horror Movies', filter: (list) => list.filter(m => m.genre === 'Horror') },
    { id: 'family', title: 'Family Movies', filter: (list) => list.filter(m => m.genre === 'Family') },
  ];

  return (
    <div className={`pb-12 min-h-screen bg-background ${!featured ? 'pt-24' : ''}`}>
      {/* Featured Movie Hero Banner */}
      {featured && (
        <section className="relative w-full min-h-[50vh] sm:h-[65vh] md:h-[80vh] pt-24 pb-6 sm:pb-8 md:pb-10 overflow-hidden flex items-end group/hero">
          {/* Widescreen cover image on desktop / Poster image on mobile */}
          <div className="absolute inset-0 z-0">
            <img
              src={featured.posterImage || featured.coverImage}
              alt={featured.title}
              className="block sm:hidden w-full h-full object-cover opacity-100 scale-102 animate-fade-in transition-all duration-1000"
            />
            <img
              src={featured.coverImage}
              alt={featured.title}
              className="hidden sm:block w-full h-full object-cover opacity-100 scale-105 animate-fade-in transition-all duration-1000"
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
              <div className="flex items-center gap-2 mb-4 opacity-90 select-none uppercase tracking-widest">
                <img src="/logo-square.jpg" className="h-8 object-contain invert brightness-125 rounded-md" alt="SCF Logo" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[11px] font-black text-white">SAMYA CHOUDHURY FILMS</span>
                  <span className="text-[9px] font-semibold text-white/60">PRESENTS</span>
                </div>
              </div>

              {/* Metadata badges row */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3.5">
                <Badge variant="premium">Featured Movie</Badge>
                <span className="text-xs font-semibold text-text-secondary">{featured.year}</span>
                <span className="text-text-muted">&middot;</span>
                <span className="text-xs font-semibold text-text-secondary">{featured.duration}</span>
                <span className="text-text-muted">&middot;</span>
                <span className="text-[10px] font-bold border border-white/20 px-1 rounded text-text-secondary">{featured.rating}</span>
                <span className="text-text-muted">&middot;</span>
                <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">{featured.quality}</span>
                
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
                <button
                  onClick={handleHeroPlay}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-lg shadow-lg shadow-brand-accent/20 transition-all hover:scale-105 active:scale-95 text-[11px] sm:text-xs md:text-sm whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
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
              </div>

              {/* Scroller Dots (Centered horizontally on desktop relative to parent, centered below on mobile) */}
              <div className="flex justify-center items-center md:absolute md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 z-20">
                <div className="flex gap-1.5">
                  {featuredSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFeaturedIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        featuredIndex === idx ? 'w-6 bg-brand-accent' : 'w-1.5 bg-white/20 hover:bg-white/40'
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
                        ? 'bg-brand-accent/20 border-brand-accent/40 text-brand-accent'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Filter</span>
                    {isFiltered && <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"></span>}
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
                              setSelectedLanguage('All');
                              setSelectedYear('All');
                              setSelectedRating('All');
                            }}
                            className="text-[10px] text-brand-accent hover:underline font-bold"
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
                          className="bg-background border border-white/10 rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-accent text-white"
                        >
                          {genres.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      {/* Language */}
                      <div className="flex flex-col gap-1.5 text-xs">
                        <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Language</span>
                        <select
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                          className="bg-background border border-white/10 rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-accent text-white"
                        >
                          {languages.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                      {/* Year */}
                      <div className="flex flex-col gap-1.5 text-xs">
                        <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Year</span>
                        <select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                          className="bg-background border border-white/10 rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-accent text-white"
                        >
                          {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                      {/* Rating */}
                      <div className="flex flex-col gap-1.5 text-xs">
                        <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Age Rating</span>
                        <select
                          value={selectedRating}
                          onChange={(e) => setSelectedRating(e.target.value)}
                          className="bg-background border border-white/10 rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-accent text-white"
                        >
                          {ratings.map(r => <option key={r} value={r}>{r}</option>)}
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
                        className={`text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${sortBy === 'newest' ? 'bg-brand-accent/20 text-brand-accent' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}
                      >
                        Release: Newest
                      </button>
                      <button
                        onClick={() => { setSortBy('oldest'); setSortDropdownOpen(false); }}
                        className={`text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${sortBy === 'oldest' ? 'bg-brand-accent/20 text-brand-accent' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}
                      >
                        Release: Oldest
                      </button>
                      <button
                        onClick={() => { setSortBy('title'); setSortDropdownOpen(false); }}
                        className={`text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${sortBy === 'title' ? 'bg-brand-accent/20 text-brand-accent' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}
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
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={handleNextSlide}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/45 border border-white/10 text-white flex items-center justify-center hover:bg-black/85 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}
        </section>
      )}

      {/* Movie Grid / Rails Section */}
      <section className={`relative z-10 bg-background pb-12 ${featured && !isFiltered ? '-mt-8 pt-2' : 'pt-6'}`}>
        {isFiltered ? (
          <>
            <h2 className="text-xl md:text-2xl font-extrabold text-white mb-6">
              {selectedGenre === 'All' ? 'All Movies' : `${selectedGenre} Movies`}
              <span className="ml-2 text-xs font-semibold text-text-muted">({processedMovies.length} results)</span>
            </h2>

            {processedMovies.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <p className="text-sm font-semibold text-text-secondary mb-2">No movies match your selected filters.</p>
                <button
                  onClick={() => {
                    setSelectedGenre('All');
                    setSelectedLanguage('All');
                    setSelectedYear('All');
                    setSelectedRating('All');
                    setSortBy('newest');
                  }}
                  className="text-xs text-brand-accent hover:underline font-bold"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-5">
                {processedMovies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} fullWidth />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            {movieRails.map(rail => {
              const railItems = rail.filter(movies);
              if (railItems.length === 0) return null;

              return (
                <div key={rail.id} className="relative group/rail py-4">
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
                    className="flex items-center gap-4 md:gap-5 overflow-x-auto no-scrollbar py-2"
                  >
                    {railItems.map(movie => (
                      <MovieCard key={movie.id} movie={movie} />
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
