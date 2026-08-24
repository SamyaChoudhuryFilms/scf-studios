import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useContent } from '../../context/ContentContext';
import { useRouter } from '../../context/RouterContext';
import MovieCard from '../../components/cards/MovieCard';
import Badge from '../../components/common/Badge';
import { Play, Info, ChevronLeft, ChevronRight, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

export default function Movies() {
  const { movies } = useContent();
  const { navigate } = useRouter();

  // Filters State
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Slides: all movies (excluding coming soon, fallback to all if empty)
  const featuredSlides = useMemo(() => {
    const activeMovies = movies.filter(m => !m.isComingSoon);
    return activeMovies.length > 0 ? activeMovies : movies;
  }, [movies]);

  // Rotate hero slides
  useEffect(() => {
    if (featuredSlides.length <= 1) return;
    const slideInterval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % featuredSlides.length);
    }, 9000);
    return () => clearInterval(slideInterval);
  }, [featuredSlides.length]);

  const handlePrevSlide = () => {
    setFeaturedIndex(prev => (prev - 1 + featuredSlides.length) % featuredSlides.length);
  };

  const handleNextSlide = () => {
    setFeaturedIndex(prev => (prev + 1) % featuredSlides.length);
  };

  const featured = featuredSlides[featuredIndex];

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
        <section className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden flex items-end pb-12 group/hero">
          <div className="absolute inset-0 z-0">
            <img
              src={featured.coverImageUrl || featured.coverImage}
              alt={featured.title}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/20 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-3xl px-4 md:px-12 select-text">
            <div className="flex items-center gap-2 mb-2.5">
              <Badge variant="premium">Featured Movie</Badge>
              <span className="text-xs font-semibold text-text-secondary">{featured.year}</span>
              <span className="text-text-muted">&middot;</span>
              <span className="text-xs font-semibold text-text-secondary">{featured.duration}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 uppercase leading-none drop-shadow-md">
              {featured.title}
            </h1>

            <p className="text-xs md:text-sm text-text-secondary font-medium leading-relaxed max-w-xl mb-5 line-clamp-2 md:line-clamp-3">
              {featured.description}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/watch/${featured.id}`)}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-lg transition-transform hover:scale-105 text-xs"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Play Now
              </button>
              <button
                onClick={() => navigate(`/movie/${featured.id}`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold rounded-lg transition-transform hover:scale-105 text-xs"
              >
                <Info className="w-3.5 h-3.5" />
                More Info
              </button>
            </div>
          </div>

          {/* Left/Right Arrow Buttons (Scrollers) */}
          {featuredSlides.length > 1 && (
            <>
              <button
                onClick={handlePrevSlide}
                className="absolute left-4 md:left-6 top-[calc(50%-20px)] z-20 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/hero:opacity-100 hover:bg-black/80 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNextSlide}
                className="absolute right-4 md:right-6 top-[calc(50%-20px)] z-20 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/hero:opacity-100 hover:bg-black/80 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {featuredSlides.length > 1 && (
            <div className="absolute bottom-6 right-4 md:right-12 z-10 flex gap-1.5">
              {featuredSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setFeaturedIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    featuredIndex === idx ? 'w-6 bg-brand-accent' : 'w-1.5 bg-white/20 hover:bg-white/40'
                  }`}
                ></button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Advanced Filter Bar */}
      <section className="relative z-10 px-4 md:px-12 py-4 md:py-6 bg-bg-secondary/80 border-y border-white/10 backdrop-blur-[5px]">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Filter Toggle Button */}
          <div className="md:hidden flex justify-start">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-card-bg/60 border border-white/10 text-white rounded-lg text-[11px] font-bold uppercase transition-all active:scale-95 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-accent" />
              <span>FILTER</span>
              {mobileFiltersOpen ? (
                <ChevronUp className="w-3.5 h-3.5 ml-0.5 text-text-secondary" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-text-secondary" />
              )}
            </button>
          </div>

          {/* Filters content: hidden on mobile unless open, always flex on desktop */}
          <div className={`${mobileFiltersOpen ? 'flex animate-fade-in' : 'hidden'} md:flex flex-col md:flex-row md:items-center justify-between gap-6 mt-4 md:mt-0`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-text-secondary w-full md:w-auto">
              {/* Genre Filter */}
              <div className="flex flex-col gap-1.5 w-full">
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Genre</span>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="bg-card-bg border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-brand-accent text-white w-full"
                >
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* Language Filter */}
              <div className="flex flex-col gap-1.5 w-full">
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Language</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-card-bg border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-brand-accent text-white w-full"
                >
                  {languages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {/* Year Filter */}
              <div className="flex flex-col gap-1.5 w-full">
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Year</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-card-bg border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-brand-accent text-white w-full"
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              {/* Rating Filter */}
              <div className="flex flex-col gap-1.5 w-full">
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Age Rating</span>
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="bg-card-bg border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-brand-accent text-white w-full"
                >
                  {ratings.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* Sorting selector */}
            <div className="flex flex-col gap-1.5 text-xs w-full md:w-48">
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Sort By</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-card-bg border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-brand-accent text-white w-full"
              >
                <option value="newest">Release: Newest</option>
                <option value="oldest">Release: Oldest</option>
                <option value="title">Title: A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Movie Grid / Rails Section */}
      <section className="px-4 md:px-12 py-10">
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
                  <h3 className="text-base md:text-lg font-extrabold tracking-wide text-text-primary mb-3">
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
