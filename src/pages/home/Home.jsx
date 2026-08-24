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
      <section key={section.id} className="relative group/rail py-6 px-4 md:px-12">
        <h3 className="text-lg md:text-xl font-extrabold tracking-wide text-text-primary mb-4 flex items-center gap-2">
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
      <section className="relative w-full min-h-[50vh] sm:h-[65vh] md:h-[80vh] py-16 sm:py-24 overflow-hidden flex items-center group/hero">
        {/* Widescreen cover image with transitions */}
        <div className="absolute inset-0 z-0">
          <img
            src={featured.coverImageUrl || featured.coverImage}
            alt={featured.title}
            className="w-full h-full object-cover opacity-80 scale-105 animate-fade-in transition-all duration-1000"
          />
          {/* Gradients to blend cover image into black background */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/20 to-transparent"></div>
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-10 max-w-4xl px-4 md:px-12 mt-16 md:mt-24 select-text">
          {/* Brand Signature Watermark Logo */}
          <div className="flex items-center gap-2 mb-4 opacity-90 select-none">
            <img src="/logo-square.jpg" className="h-8 object-contain invert brightness-125 rounded-md" alt="SCF STUDIOS" />
            <span className="text-[10px] font-bold tracking-widest text-text-secondary uppercase">SCF STUDIOS Presents</span>
          </div>

          {/* Metadata badges row */}
          <div className="flex items-center gap-2 mb-3.5">
            {featured.type === 'series' && <Badge variant="default" className="bg-brand-accent/20 text-brand-accent border-brand-accent/30 font-bold">Series</Badge>}
            <Badge variant="original">Original</Badge>
            <span className="text-xs font-semibold text-text-secondary">{featured.year}</span>
            <span className="text-text-muted">&middot;</span>
            <span className="text-xs font-semibold text-text-secondary">{featured.duration}</span>
            <span className="text-text-muted">&middot;</span>
            <span className="text-[10px] font-bold border border-white/20 px-1 rounded text-text-secondary">{featured.rating}</span>
            <span className="text-text-muted">&middot;</span>
            <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">{featured.quality}</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4 uppercase leading-none drop-shadow-lg">
            {featured.title}
          </h1>

          {/* Tagline / Description */}
          <p className="text-sm md:text-base text-text-secondary font-medium leading-relaxed max-w-2xl mb-7 line-clamp-3 md:line-clamp-4 drop-shadow-md">
            {featured.description}
          </p>

          {/* Languages */}
          <div className="text-xs font-semibold text-text-muted mb-6">
            Language: <span className="text-text-secondary">{featured.language}</span>
          </div>

          {/* Interactive Hero Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleHeroPlay}
              className="flex items-center gap-2 px-6 py-3 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-lg shadow-lg shadow-brand-accent/20 transition-all hover:scale-105 active:scale-95 text-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              Watch Now
            </button>

            <button
              onClick={handleHeroToggleList}
              className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold rounded-lg transition-all hover:scale-105 active:scale-95 text-sm"
            >
              {isAdded ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
              My List
            </button>

            <button
              onClick={handleHeroInfo}
              className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold rounded-lg transition-all hover:scale-105 active:scale-95 text-sm"
            >
              <Info className="w-4 h-4" />
              More Info
            </button>
          </div>
        </div>

        {/* Indicators at bottom right */}
        <div className="absolute bottom-10 right-4 md:right-12 z-10 flex items-center gap-3">
          {/* Mute/Unmute toggle (aesthetic details) */}
          <button
            onClick={() => setMuted(!muted)}
            className="w-9 h-9 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center hover:bg-black/80 hover:scale-105 active:scale-95 transition-all"
          >
            {muted ? <VolumeX className="w-4 h-4 text-text-secondary" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          <div className="flex gap-1.5">
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
        </div>

        {/* Left/Right Arrow Buttons (Scrollers) */}
        {featuredSlides.length > 1 && (
          <>
            <button
              onClick={handlePrevSlide}
              className="absolute left-4 md:left-6 z-20 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/hero:opacity-100 hover:bg-black/80 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-4 md:right-6 z-20 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/hero:opacity-100 hover:bg-black/80 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
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
