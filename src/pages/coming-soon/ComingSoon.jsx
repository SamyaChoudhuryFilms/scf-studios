import React, { useState, useEffect, useMemo } from 'react';
import { useContent } from '../../context/ContentContext';
import { useRouter } from '../../context/RouterContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useToast } from '../../context/ToastContext';
import MovieCard from '../../components/cards/MovieCard';
import SeriesCard from '../../components/cards/SeriesCard';
import Badge from '../../components/common/Badge';
import { Clock, ChevronLeft, ChevronRight, Volume2, VolumeX, Plus, Check, Info, SlidersHorizontal } from 'lucide-react';

export default function ComingSoon() {
  const { movies, series } = useContent();
  const { navigate } = useRouter();
  const { toggleMyList, isInMyList } = usePlayback();
  const { addToast } = useToast();

  const [activeCategory, setActiveCategory] = useState('All'); // 'All', 'Movies', 'Series'
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

  // Filter coming soon items
  const comingSoonMovies = movies.filter(m => m.isComingSoon).map(m => ({ ...m, type: 'movie' }));
  const comingSoonSeries = series.filter(s => s.isComingSoon).map(s => ({ ...s, type: 'series' }));

  const allComingSoon = [...comingSoonMovies, ...comingSoonSeries];

  const filteredItems = allComingSoon.filter(item => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Movies') return item.type === 'movie';
    if (activeCategory === 'Series') return item.type === 'series';
    return false;
  });

  const categories = ['All', 'Movies', 'Series'];

  const filteredAndSortedItems = useMemo(() => {
    let list = [...filteredItems];

    if (sortBy === 'newest') {
      list.sort((a, b) => {
        const dateA = a.releaseDate ? new Date(a.releaseDate) : new Date(a.year || 2026, 0, 1);
        const dateB = b.releaseDate ? new Date(b.releaseDate) : new Date(b.year || 2026, 0, 1);
        return dateB - dateA;
      });
    } else if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [filteredItems, sortBy]);

  const defaultComingSoonSlide = {
    id: "welcome-coming-soon-slide",
    title: "Coming Soon Premieres",
    description: "Exclusive new blockbusters and original series are releasing soon. Check the list below to see what is coming next!",
    coverImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop",
    posterImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop",
    year: 2026,
    duration: "Collection",
    rating: "G",
    language: "All Languages",
    quality: "UHD"
  };

  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [muted, setMuted] = useState(true);

  // Slides: all coming soon releases (movies + series combined, fallback to default if empty)
  const featuredSlides = useMemo(() => {
    const list = allComingSoon.length > 0 ? allComingSoon : [defaultComingSoonSlide];
    return list.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      coverImage: item.coverImageUrl || item.coverImage,
      posterImage: item.posterUrl || item.poster,
      year: item.year || 2026,
      duration: item.seasons ? `${item.seasons?.length || 0} Season(s)` : (item.duration || 'Feature'),
      rating: item.rating || 'PG',
      language: item.language || 'English',
      quality: item.quality || '4K UHD',
      type: item.seasons ? 'series' : (item.id === "welcome-coming-soon-slide" ? "welcome" : "movie"),
      releaseDate: item.releaseDate
    }));
  }, [allComingSoon]);

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
  const isAdded = featured && featured.id !== 'welcome-coming-soon-slide' && isInMyList(featured.id);

  const handleHeroToggleList = () => {
    if (!featured || featured.id === 'welcome-coming-soon-slide') return;
    toggleMyList(featured.id);
    addToast(isAdded ? "Removed from My List" : "Added to My List", "success");
  };

  const handleHeroInfo = () => {
    if (!featured || featured.id === 'welcome-coming-soon-slide') return;
    navigate(featured.type === 'series' ? `/series/${featured.id}` : `/movie/${featured.id}`);
  };

  return (
    <div className="pb-16 min-h-screen bg-background select-text">
      {/* Coming Soon Spotlight Hero Scroller */}
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
                  <span className="text-[11px] font-black text-brand-accent">SAMYA CHOUDHURY FILMS</span>
                  <span className="text-[9px] font-semibold text-white/95">PRESENTS</span>
                </div>
              </div>

              {/* Metadata badges row */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3.5">
                <span className="text-[10px] font-bold bg-amber-500/20 border border-amber-500/30 text-amber-500 px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                  <Clock className="w-3 h-3" />
                  Coming Soon
                </span>
                {featured.releaseDate && (
                  <Badge variant="default" className="bg-white/10 text-white font-bold">Premiering {featured.releaseDate}</Badge>
                )}
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
                {featured.id !== "welcome-coming-soon-slide" && (
                  <>
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
                      activeCategory !== 'All' 
                        ? 'bg-brand-accent/20 border-brand-accent/40 text-brand-accent'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Format: {activeCategory}</span>
                    {activeCategory !== 'All' && <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"></span>}
                  </button>

                  {/* Category Dropdown Menu */}
                  {filtersDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-48 bg-card-bg/95 border border-white/10 rounded-xl p-3 shadow-xl z-50 backdrop-blur-lg flex flex-col gap-1">
                      <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold mb-1 px-1">Choose Format</span>
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => {
                            setActiveCategory(cat);
                            setFiltersDropdownOpen(false);
                          }}
                          className={`text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${activeCategory === cat ? 'bg-brand-accent/20 text-brand-accent' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}
                        >
                          {cat}
                        </button>
                      ))}
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
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 rotate-90" />
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
                        Release Date
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

      <div className={`relative z-10 bg-background pb-12 ${featured ? '-mt-8 pt-2' : 'pt-6'} w-full px-0`}>
        
        {/* Page Header */}
        <div className="border-b border-white/5 pb-4 mb-6 px-4 md:px-12">
          <h1 className="text-xl font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-accent" />
            Coming Soon
          </h1>
          <p className="text-[10px] text-text-muted mt-1 uppercase font-semibold">Exclusive premieres and coming soon content on SCF STUDIOS.</p>
        </div>

        {/* Content Grid */}
        {filteredAndSortedItems.length === 0 ? (
          <div className="py-24 text-center max-w-sm mx-auto px-4 animate-fade-in">
            <Clock className="w-12 h-12 mx-auto mb-4 text-text-muted opacity-40 animate-pulse" />
            <h3 className="text-base font-bold text-white mb-1">No coming soon releases</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              We are finalizing our schedules. Check back soon for announcements of coming soon blockbusters!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-5 px-0 animate-fade-in">
            {filteredAndSortedItems.map(item => (
              item.type === 'movie' ? (
                <MovieCard key={item.id} movie={item} fullWidth />
              ) : (
                <SeriesCard key={item.id} series={item} fullWidth />
              )
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
