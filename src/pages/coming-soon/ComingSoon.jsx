import React, { useState, useEffect, useMemo } from 'react';
import { useContent } from '../../context/ContentContext';
import MovieCard from '../../components/cards/MovieCard';
import SeriesCard from '../../components/cards/SeriesCard';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ComingSoon() {
  const { movies, series } = useContent();

  const [activeCategory, setActiveCategory] = useState('All'); // 'All', 'Movies', 'Series'

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

  const defaultComingSoonSlide = {
    id: "welcome-upcoming-slide",
    title: "Upcoming Premieres",
    description: "Exclusive new blockbusters and original series are releasing soon. Check the list below to see what is coming next!",
    coverImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop",
  };

  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Slides: all upcoming releases (movies + series combined, fallback to default if empty)
  const featuredSlides = useMemo(() => {
    return allComingSoon.length > 0 ? allComingSoon : [defaultComingSoonSlide];
  }, [allComingSoon]);

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

  return (
    <div className="pb-16 min-h-screen bg-background select-text">
      {/* Upcoming Spotlight Hero Scroller */}
      {featured && (
        <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden flex items-end pb-12 group/hero">
          <div className="absolute inset-0 z-0">
            <img
              src={featured.coverImageUrl || featured.coverImage}
              alt={featured.title}
              className="w-full h-full object-cover opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/40 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-3xl px-4 md:px-12 select-text animate-fade-in">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[10px] font-bold bg-amber-500/20 border border-amber-500/30 text-amber-500 px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                <Clock className="w-3 h-3" />
                Coming Soon
              </span>
              {featured.releaseDate && (
                <span className="text-xs font-semibold text-text-secondary">Premiering {featured.releaseDate}</span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 uppercase leading-none drop-shadow-md">
              {featured.title}
            </h1>

            <p className="text-xs md:text-sm text-text-secondary font-medium leading-relaxed max-w-lg mb-5 line-clamp-2">
              {featured.description}
            </p>
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

      <div className="max-w-7xl mx-auto px-4 md:px-12 py-10">
        
        {/* Page Header */}
        <div className="border-b border-white/5 pb-4 mb-6">
          <h1 className="text-xl font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-accent" />
            Coming Soon
          </h1>
          <p className="text-[10px] text-text-muted mt-1 uppercase font-semibold">Exclusive premieres and upcoming content releasing soon on SCF STUDIOS.</p>
        </div>

        {/* Categories selector */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-brand-accent text-white shadow-lg'
                  : 'bg-card-bg/50 border border-white/5 text-text-secondary hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        {filteredItems.length === 0 ? (
          <div className="py-24 text-center max-w-sm mx-auto">
            <Clock className="w-12 h-12 mx-auto mb-4 text-text-muted opacity-40 animate-pulse" />
            <h3 className="text-base font-bold text-white mb-1">No upcoming releases</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              We are finalizing our schedules. Check back soon for announcements of upcoming blockbusters!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-5">
            {filteredItems.map(item => (
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
