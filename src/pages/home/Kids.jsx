import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useContent } from '../../context/ContentContext';
import { useRouter } from '../../context/RouterContext';
import MovieCard from '../../components/cards/MovieCard';
import SeriesCard from '../../components/cards/SeriesCard';
import Badge from '../../components/common/Badge';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Kids() {
  const { movies, series } = useContent();
  const { navigate } = useRouter();

  // Filter kids friendly items (marked isKids)
  const kidsMovies = movies.filter(m => m.isKids);
  const kidsSeries = series.filter(s => s.isKids);

  // Fallback default kids spotlight slide
  const defaultKidsSpotlight = {
    id: "welcome-kids-slide",
    title: "KIDS CARTOONS & MOVIES",
    description: "Safe, kid-friendly entertainment. Explore amazing animated movies, cartoons, and family stories uploaded to SCF STUDIOS.",
    coverImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop",
    rating: "G"
  };

  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Slides: all kids friendly movies and series combined (fallback to defaultKidsSpotlight if empty)
  const featuredSlides = useMemo(() => {
    const list = [...kidsMovies, ...kidsSeries];
    return list.length > 0 ? list : [defaultKidsSpotlight];
  }, [kidsMovies, kidsSeries]);

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

          <div className="relative z-10 max-w-3xl px-4 md:px-12 select-text">
            <div className="flex items-center gap-2 mb-2.5">
              <Badge variant="original" className="bg-yellow-500 text-black border-transparent font-extrabold">KIDS SPACE</Badge>
              <Badge variant="default" className="bg-white/10 text-white font-bold">{featured.rating || 'G'}</Badge>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 uppercase leading-none drop-shadow-md">
              {featured.title}
            </h1>

            <p className="text-xs md:text-sm text-text-secondary font-medium leading-relaxed max-w-lg mb-5 line-clamp-2">
              {featured.description}
            </p>

            {featured.id !== "welcome-kids-slide" && (
              <button
                onClick={() => navigate(`/watch/${featured.id}`)}
                className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold rounded-lg shadow-lg shadow-yellow-500/10 transition-transform hover:scale-105 text-xs"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                Watch Now
              </button>
            )}
          </div>

          {/* Left/Right Arrow Buttons (Scrollers) */}
          {featuredSlides.length > 1 && (
            <>
              <button
                onClick={handlePrevSlide}
                className="absolute left-4 md:left-6 top-[calc(50%-20px)] z-20 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/hero:opacity-100 hover:bg-black/80 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6 text-yellow-500" />
              </button>
              <button
                onClick={handleNextSlide}
                className="absolute right-4 md:right-6 top-[calc(50%-20px)] z-20 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/hero:opacity-100 hover:bg-black/80 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6 text-yellow-500" />
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
                    featuredIndex === idx ? 'w-6 bg-yellow-500' : 'w-1.5 bg-white/20 hover:bg-white/40'
                  }`}
                ></button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Rails Content List */}
      <section className="px-4 md:px-12 py-10 space-y-6">
        {kidsRails.map(rail => {
          const railItems = rail.filter(kidsContent);
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
      </section>
    </div>
  );
}
