import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useToast } from '../../context/ToastContext';
import { Play, Plus, Check, Info, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import MovieCard from '../../components/cards/MovieCard';
import SeriesCard from '../../components/cards/SeriesCard';
import ContinueWatchingCard from '../../components/cards/ContinueWatchingCard';
import Badge from '../../components/common/Badge';

export default function Home() {
  const { navigate } = useRouter();
  const { activeProfile } = useAuth();
  const { movies, series, homepageSections } = useContent();
  const { continueWatching, toggleMyList, isInMyList } = usePlayback();
  const { addToast } = useToast();

  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [muted, setMuted] = useState(true);

  // Dynamically load featured slides from Firestore
  const dbFeaturedMovies = useMemo(() => {
    const list = movies.filter(m => !m.isComingSoon);
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

  const dbFeaturedSeries = useMemo(() => {
    const list = series.filter(s => !s.isComingSoon);
    return list.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description,
      coverImage: s.coverImageUrl || s.coverImage,
      posterImage: s.posterUrl || s.poster,
      year: s.year || 2026,
      duration: `${s.seasons?.length || 0} Season(s)`,
      rating: s.rating || 'G',
      language: s.language,
      quality: s.quality || '4K UHD',
      type: 'series'
    }));
  }, [series]);

  const featuredSlides = useMemo(() => {
    return [...dbFeaturedMovies, ...dbFeaturedSeries];
  }, [dbFeaturedMovies, dbFeaturedSeries]);

  // Welcome slide fallback when database is empty
  const defaultSlide = {
    id: "welcome-slide",
    title: "Welcome to SCF STUDIOS",
    description: "Start uploading movies, series, and cover artwork in the console to populate your streaming platform.",
    coverImage: "https://images.unsplash.com/photo-1574267431629-2e570b062c5f?q=80&w=1600&auto=format&fit=crop",
    posterImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop",
    year: 2026,
    duration: "Platform",
    rating: "G",
    language: "All Languages",
    quality: "UHD",
    type: "welcome"
  };

  if (featuredSlides.length === 0) {
    featuredSlides.push(defaultSlide);
  }

  // Rotate hero slides
  useEffect(() => {
    if (featuredSlides.length <= 1) return;
    const slideInterval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % featuredSlides.length);
    }, 10000);
    return () => clearInterval(slideInterval);
  }, [featuredSlides.length]);

  const featured = featuredSlides[featuredIndex] || defaultSlide;
  const isAdded = featured.id !== 'welcome-slide' && isInMyList(featured.id);

  const handleHeroPlay = () => {
    if (featured.id === 'welcome-slide') {
      addToast("Add content in your studio console to watch videos.", "info");
      return;
    }
    if (featured.type === 'movie') {
      navigate(`/watch/${featured.id}`);
    } else {
      // Find first episode
      const firstEp = series.find(s => s.id === featured.id)?.seasons?.[0]?.episodes?.[0];
      if (firstEp) {
        navigate(`/watch/${firstEp.id}`);
      } else {
        navigate(`/series/${featured.id}`);
      }
    }
  };

  const handleHeroToggleList = () => {
    if (featured.id === 'welcome-slide') return;
    toggleMyList(featured.id);
    addToast(isAdded ? "Removed from My List" : "Added to My List", "success");
  };

  const handleHeroInfo = () => {
    if (featured.id === 'welcome-slide') return;
    navigate(featured.type === 'movie' ? `/movie/${featured.id}` : `/series/${featured.id}`);
  };

  const handlePrevSlide = () => {
    setFeaturedIndex(prev => (prev - 1 + featuredSlides.length) % featuredSlides.length);
  };

  const handleNextSlide = () => {
    setFeaturedIndex(prev => (prev + 1) % featuredSlides.length);
  };

  // horizontal scroll helper
  const railRefs = useRef({});

  const scrollRail = (railId, direction) => {
    const el = railRefs.current[railId];
    if (el) {
      const scrollAmt = direction === 'left' ? -400 : 400;
      el.scrollBy({ left: scrollAmt, behavior: 'smooth' });
    }
  };

  // Render Horizontal Rails dynamically based on config
  const renderRail = (section) => {
    if (!section.visible) return null;

    // Filter contents based on kids mode
    const isKidsMode = activeProfile?.kidsMode;
    const filterKids = (list) => isKidsMode ? list.filter(item => item.isKids) : list;
    const filterOutKids = (list) => isKidsMode ? list.filter(item => item.isKids) : list.filter(item => !item.isKids);

    let cards = [];

    switch (section.type) {
      case "trending":
        cards = [...filterOutKids(movies), ...filterOutKids(series)]
          .sort((a, b) => b.year - a.year)
          .map(item => item.seasons ? (
            <SeriesCard key={item.id} series={item} />
          ) : (
            <MovieCard key={item.id} movie={item} />
          ));
        break;

      case "continue_watching":
        if (continueWatching.length === 0) return null;
        cards = continueWatching.map(item => (
          <ContinueWatchingCard key={item.contentId} progressItem={item} />
        ));
        break;

      case "originals":
        cards = [...movies, ...series]
          .filter(item => item.isOriginal)
          .map(item => item.seasons ? (
            <SeriesCard key={item.id} series={item} />
          ) : (
            <MovieCard key={item.id} movie={item} />
          ));
        if (isKidsMode) return null; // Originals generally adult/teen for this mock
        break;

      case "movies":
        cards = filterOutKids(movies).map(m => <MovieCard key={m.id} movie={m} />);
        break;

      case "series":
        cards = filterOutKids(series).map(s => <SeriesCard key={s.id} series={s} />);
        break;



      case "kids":
        cards = [...movies, ...series]
          .filter(item => item.isKids)
          .map(item => item.seasons ? (
            <SeriesCard key={item.id} series={item} />
          ) : (
            <MovieCard key={item.id} movie={item} />
          ));
        break;

      case "bengali":
        cards = [...movies, ...series]
          .filter(item => item.language === "Bengali")
          .map(item => item.seasons ? (
            <SeriesCard key={item.id} series={item} />
          ) : (
            <MovieCard key={item.id} movie={item} />
          ));
        break;

      default:
        return null;
    }

    if (cards.length === 0) return null;

    return (
      <section key={section.id} className="relative group/rail py-6 ">
        <h3 className="text-lg md:text-xl font-extrabold tracking-wide text-text-primary mb-4 flex items-center gap-2 px-4 md:px-12">
          {section.title}
          {section.type === 'originals' && <span className="text-[10px] bg-brand-accent text-white font-bold px-1.5 py-0.5 rounded tracking-widest uppercase">Premium</span>}
        </h3>

        {/* Scroll Left Button */}
        <button
          onClick={() => scrollRail(section.id, 'left')}
          className="absolute left-10 top-[calc(50%-20px)] z-30 w-10 h-10 rounded-full bg-background/80 border border-white/5 text-white flex items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-opacity duration-300 hover:bg-card-bg hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Horizontal Container */}
        <div
          ref={el => railRefs.current[section.id] = el}
          className="flex items-center gap-4 md:gap-5 overflow-x-auto no-scrollbar py-2"
        >
          {cards}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => scrollRail(section.id, 'right')}
          className="absolute right-10 top-[calc(50%-20px)] z-30 w-10 h-10 rounded-full bg-background/80 border border-white/5 text-white flex items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-opacity duration-300 hover:bg-card-bg hover:scale-105 active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </section>
    );
  };

  return (
    <div className="pb-16 min-h-screen bg-background">
      {/* Cinematic Hero Section */}
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
              {featured.type === 'series' && <Badge variant="default" className="bg-brand-accent/20 text-brand-accent border-brand-accent/30 font-bold">Series</Badge>}
              <Badge variant="original">Original</Badge>
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

          {/* Interactive Hero Controls & Scroller Dots */}
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

      {/* Content Rails Container */}
      <div className="relative z-10 -mt-8 bg-background flex flex-col gap-2">
        {homepageSections.map(section => renderRail(section))}
      </div>
    </div>
  );
}
