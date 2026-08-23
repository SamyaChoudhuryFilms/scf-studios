import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../context/RouterContext';
import { 
  Shield, Film, Tv, Settings, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, 
  LayoutGrid, Users, Plus, ShieldAlert, LogOut, Terminal, Lock, Activity, Server, Edit,
  Smile, Calendar
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import { storeMedia } from '../../utils/db';
import ImageUploader from '../../components/admin/ImageUploader';
import VideoUploader from '../../components/admin/VideoUploader';

export default function StudioConsole() {
  const { currentPath, navigate } = useRouter();
  const { 
    currentUser, 
    login, 
    logout, 
    isAdmin, 
    isAdminLoading, 
    authLoading 
  } = useAuth();

  const {
    movies,
    series,
    homepageSections,
    setHomepageSections,
    addMovie,
    updateMovie,
    deleteMovie,
    addSeries,
    updateSeries,
    deleteSeries
  } = useContent();

  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Modals & CRUD Form States
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [showAddSeriesModal, setShowAddSeriesModal] = useState(false);
  const [showEditMovieModal, setShowEditMovieModal] = useState(false);
  const [showEditSeriesModal, setShowEditSeriesModal] = useState(false);

  // Add/Edit Movie Form State
  const [movieTitle, setMovieTitle] = useState('');
  const [movieDesc, setMovieDesc] = useState('');
  const [movieGenre, setMovieGenre] = useState('Sci-Fi');
  const [movieLang, setMovieLang] = useState('English');
  const [movieYear, setMovieYear] = useState('2026');
  const [movieDur, setMovieDur] = useState('2h 00m');
  const [movieRat, setMovieRat] = useState('16+');
  const [movieOriginal, setMovieOriginal] = useState(false);
  const [moviePremium, setMoviePremium] = useState(false);
  const [movieKids, setMovieKids] = useState(false);
  const [movieComingSoon, setMovieComingSoon] = useState(false);
  const [moviePoster, setMoviePoster] = useState('');
  const [movieCoverImage, setMovieCoverImage] = useState('');
  const [movieVideo, setMovieVideo] = useState('');
  const [movieTrailer, setMovieTrailer] = useState('');
  
  // Extra movie fields
  const [movieYoutubeId, setMovieYoutubeId] = useState('');
  const [movieReleaseDate, setMovieReleaseDate] = useState('');
  const [movieFeatured, setMovieFeatured] = useState(false);
  const [moviePublished, setMoviePublished] = useState(true);
  const [movieDirector, setMovieDirector] = useState('');
  const [movieCast, setMovieCast] = useState('');
  const [movieQuality, setMovieQuality] = useState('4K');
  const [movieAudio, setMovieAudio] = useState('Dolby Atmos');
  const [movieCustomCategory, setMovieCustomCategory] = useState('');
 
  // Editing movie reference
  const [editingMovie, setEditingMovie] = useState(null);

  // Add/Edit Series Form State
  const [seriesTitle, setSeriesTitle] = useState('');
  const [seriesDesc, setSeriesDesc] = useState('');
  const [seriesGenre, setSeriesGenre] = useState('Sci-Fi');
  const [seriesLang, setSeriesLang] = useState('English');
  const [seriesOriginal, setSeriesOriginal] = useState(false);
  const [seriesPremium, setSeriesPremium] = useState(false);
  const [seriesPoster, setSeriesPoster] = useState('');
  const [seriesCoverImage, setSeriesCoverImage] = useState('');
  const [seriesYear, setSeriesYear] = useState('2026');
  const [seriesDur, setSeriesDur] = useState('1 Season');
  const [seriesRat, setSeriesRat] = useState('16+');
  const [seriesKids, setSeriesKids] = useState(false);
  const [seriesComingSoon, setSeriesComingSoon] = useState(false);
  const [seriesFeatured, setSeriesFeatured] = useState(false);
  const [seriesPublished, setSeriesPublished] = useState(true);
  const [seriesYoutubeId, setSeriesYoutubeId] = useState('');
  const [seriesReleaseDate, setSeriesReleaseDate] = useState('');
  const [seriesVideo, setSeriesVideo] = useState('');
  const [seriesTrailer, setSeriesTrailer] = useState('');
  const [seriesDirector, setSeriesDirector] = useState('');
  const [seriesCast, setSeriesCast] = useState('');
  const [seriesQuality, setSeriesQuality] = useState('4K');
  const [seriesAudio, setSeriesAudio] = useState('Dolby Atmos');
  const [seriesCustomCategory, setSeriesCustomCategory] = useState('');

  // Seasons & Episodes Builder State
  const [seriesSeasons, setSeriesSeasons] = useState([{ seasonNumber: 1, name: "Season 1", episodes: [] }]);
  const [activeSeasonTab, setActiveSeasonTab] = useState(1);

  // New Episode Input fields
  const [newEpTitle, setNewEpTitle] = useState('');
  const [newEpThumbnail, setNewEpThumbnail] = useState('');
  const [newEpDescription, setNewEpDescription] = useState('');
  const [newEpVideo, setNewEpVideo] = useState('');
  const [newEpDuration, setNewEpDuration] = useState('');
 
  // Editing series reference
  const [editingSeries, setEditingSeries] = useState(null);

  // 1. Dynamic SEO/noindex logic on mount/navigate
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow';
      document.head.appendChild(meta);
    } else {
      meta.content = 'noindex, nofollow';
    }
    return () => {
      if (meta) meta.remove();
    };
  }, []);

  // 2. Redirect to dashboard if logged in admin at entry
  useEffect(() => {
    if (!authLoading && !isAdminLoading && currentUser && isAdmin && currentPath === '/studio-console') {
      navigate('/studio-console/dashboard');
    }
  }, [currentUser, isAdmin, authLoading, isAdminLoading, currentPath, navigate]);



  // Login handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast("Please fill in email and password.", "error");
      return;
    }
    setSigningIn(true);
    try {
      await login(email, password);
      addToast("Credentials verified. Checking administrative role...", "info");
      // Let onAuthStateChanged handle redirect
    } catch (err) {
      console.error(err);
      addToast("Authentication failed. Invalid credentials.", "error");
      setSigningIn(false);
    }
  };

  const clearMovieForm = () => {
    setMovieTitle('');
    setMovieDesc('');
    setMoviePoster('');
    setMovieCoverImage('');
    setMovieVideo('');
    setMovieTrailer('');
    setMovieYoutubeId('');
    setMovieReleaseDate('');
    setMovieFeatured(false);
    setMoviePublished(true);
    setMovieComingSoon(false);
    setMovieKids(false);
    setMovieDirector('');
    setMovieCast('');
    setMovieQuality('4K');
    setMovieAudio('Dolby Atmos');
    setMovieCustomCategory('');
  };

  const clearSeriesForm = () => {
    setSeriesTitle('');
    setSeriesDesc('');
    setSeriesPoster('');
    setSeriesCoverImage('');
    setSeriesYear('2026');
    setSeriesDur('1 Season');
    setSeriesRat('16+');
    setSeriesKids(false);
    setSeriesComingSoon(false);
    setSeriesFeatured(false);
    setSeriesPublished(true);
    setSeriesYoutubeId('');
    setSeriesReleaseDate('');
    setSeriesVideo('');
    setSeriesTrailer('');
    setSeriesDirector('');
    setSeriesCast('');
    setSeriesQuality('4K');
    setSeriesAudio('Dolby Atmos');
    setSeriesCustomCategory('');
    setSeriesSeasons([{ seasonNumber: 1, name: "Season 1", episodes: [] }]);
    setActiveSeasonTab(1);
    setNewEpTitle('');
    setNewEpThumbnail('');
    setNewEpDescription('');
    setNewEpVideo('');
    setNewEpDuration('');
  };

  // Movie CRUD
  const handleAddMovie = async (e) => {
    e.preventDefault();
    if (!movieTitle.trim()) {
      addToast("Please provide a title", "error");
      return;
    }
    const generatedId = `m-${Date.now()}`;

    try {
      await addMovie({
        id: generatedId,
        title: movieTitle,
        description: movieDesc,
        genre: movieGenre,
        language: movieLang,
        year: movieYear,
        duration: movieDur,
        rating: movieRat,
        isOriginal: movieOriginal,
        isPremium: moviePremium,
        isKids: movieKids,
        isComingSoon: movieComingSoon,
        posterUrl: moviePoster || "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop",
        coverImageUrl: movieCoverImage || "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1600&auto=format&fit=crop",
        youtubeId: movieYoutubeId,
        releaseDate: movieReleaseDate,
        featured: movieFeatured,
        published: moviePublished,
        video: movieVideo || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        trailer: movieTrailer || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        director: movieDirector,
        cast: movieCast,
        quality: movieQuality,
        audio: movieAudio,
        customCategory: movieCustomCategory
      });

      addToast("Movie added to catalog!", "success");
      setShowAddMovieModal(false);
      clearMovieForm();
    } catch (err) {
      console.error("Add movie error:", err);
      addToast(`Failed to add movie: ${err.message || err}`, "error");
    }
  };

  const handleEditMovieClick = (movie) => {
    setEditingMovie(movie);
    setMovieTitle(movie.title || '');
    setMovieDesc(movie.description || '');
    setMovieGenre(movie.genre || 'Sci-Fi');
    setMovieLang(movie.language || 'English');
    setMovieYear((movie.year || '2026').toString());
    setMovieDur(movie.duration || '2h 00m');
    setMovieRat(movie.rating || '16+');
    setMovieOriginal(!!movie.isOriginal);
    setMoviePremium(!!movie.isPremium);
    setMovieKids(!!movie.isKids);
    setMovieComingSoon(!!movie.isComingSoon);
    setMoviePoster(movie.posterUrl || movie.poster || '');
    setMovieCoverImage(movie.coverImageUrl || movie.coverImage || '');
    setMovieVideo(movie.video || '');
    setMovieTrailer(movie.trailer || '');
    setMovieYoutubeId(movie.youtubeId || '');
    setMovieReleaseDate(movie.releaseDate || '');
    setMovieFeatured(!!movie.featured);
    setMoviePublished(!!movie.published);
    setMovieDirector(movie.director || '');
    setMovieCast(Array.isArray(movie.cast) ? movie.cast.join(', ') : (movie.cast || ''));
    setMovieQuality(movie.quality || '4K');
    setMovieAudio(movie.audio || 'Dolby Atmos');
    setMovieCustomCategory(movie.customCategory || '');
    setShowEditMovieModal(true);
  };

  const handleEditMovieSubmit = async (e) => {
    e.preventDefault();
    if (!movieTitle.trim()) {
      addToast("Please provide a title", "error");
      return;
    }
    
    await updateMovie(editingMovie.id, {
      title: movieTitle,
      description: movieDesc,
      genre: movieGenre,
      language: movieLang,
      year: parseInt(movieYear) || new Date().getFullYear(),
      duration: movieDur,
      rating: movieRat,
      isOriginal: movieOriginal,
      isPremium: moviePremium,
      isKids: movieKids,
      isComingSoon: movieComingSoon,
      posterUrl: moviePoster,
      coverImageUrl: movieCoverImage,
      video: movieVideo,
      trailer: movieTrailer,
      youtubeId: movieYoutubeId,
      releaseDate: movieReleaseDate,
      featured: movieFeatured,
      published: moviePublished,
      director: movieDirector,
      cast: movieCast,
      quality: movieQuality,
      audio: movieAudio,
      customCategory: movieCustomCategory
    });

    addToast("Movie updated successfully!", "success");
    setShowEditMovieModal(false);
    setEditingMovie(null);
    clearMovieForm();
  };



  // Series CRUD
  const handleAddSeries = async (e) => {
    e.preventDefault();
    if (!seriesTitle.trim()) {
      addToast("Please provide a title", "error");
      return;
    }
    try {
      await addSeries({
        title: seriesTitle,
        description: seriesDesc,
        genre: seriesGenre,
        language: seriesLang,
        isOriginal: seriesOriginal,
        isPremium: seriesPremium,
        isKids: seriesKids,
        isComingSoon: seriesComingSoon,
        year: seriesYear,
        rating: seriesRat,
        duration: seriesDur,
        youtubeId: seriesYoutubeId,
        releaseDate: seriesReleaseDate,
        video: seriesVideo,
        trailer: seriesTrailer,
        posterUrl: seriesPoster.trim() || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop",
        coverImageUrl: seriesCoverImage.trim() || "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop",
        seasons: seriesSeasons,
        director: seriesDirector,
        cast: seriesCast,
        quality: seriesQuality,
        audio: seriesAudio,
        customCategory: seriesCustomCategory
      });

      addToast("Series added successfully!", "success");
      setShowAddSeriesModal(false);
      clearSeriesForm();
    } catch (err) {
      console.error("Add series error:", err);
      addToast(`Failed to add series: ${err.message || err}`, "error");
    }
  };

  const handleEditSeriesClick = (item) => {
    setEditingSeries(item);
    setSeriesTitle(item.title || '');
    setSeriesDesc(item.description || '');
    setSeriesGenre(item.genre || 'Sci-Fi');
    setSeriesLang(item.language || 'English');
    setSeriesOriginal(!!item.isOriginal);
    setSeriesPremium(!!item.isPremium);
    setSeriesPoster(item.posterUrl || item.poster || '');
    setSeriesCoverImage(item.coverImageUrl || item.coverImage || '');
    setSeriesYear((item.year || '2026').toString());
    setSeriesDur(item.duration || '1 Season');
    setSeriesRat(item.rating || '16+');
    setSeriesKids(!!item.isKids);
    setSeriesComingSoon(!!item.isComingSoon);
    setSeriesFeatured(!!item.featured);
    setSeriesPublished(!!item.published);
    setSeriesYoutubeId(item.youtubeId || '');
    setSeriesReleaseDate(item.releaseDate || '');
    setSeriesVideo(item.video || '');
    setSeriesTrailer(item.trailer || '');
    setSeriesDirector(item.director || '');
    setSeriesCast(Array.isArray(item.cast) ? item.cast.join(', ') : (item.cast || ''));
    setSeriesQuality(item.quality || '4K');
    setSeriesAudio(item.audio || 'Dolby Atmos');
    setSeriesCustomCategory(item.customCategory || '');
    setSeriesSeasons(item.seasons || [{ seasonNumber: 1, name: "Season 1", episodes: [] }]);
    setActiveSeasonTab(item.seasons?.[0]?.seasonNumber || 1);
    setShowEditSeriesModal(true);
  };

  const handleEditSeriesSubmit = async (e) => {
    e.preventDefault();
    if (!seriesTitle.trim()) {
      addToast("Please provide a title", "error");
      return;
    }
    try {
      await updateSeries(editingSeries.id, {
        title: seriesTitle,
        description: seriesDesc,
        genre: seriesGenre,
        language: seriesLang,
        isOriginal: seriesOriginal,
        isPremium: seriesPremium,
        isKids: seriesKids,
        isComingSoon: seriesComingSoon,
        year: parseInt(seriesYear) || new Date().getFullYear(),
        rating: seriesRat,
        duration: seriesDur,
        youtubeId: seriesYoutubeId,
        releaseDate: seriesReleaseDate,
        featured: seriesFeatured,
        published: seriesPublished,
        video: seriesVideo,
        trailer: seriesTrailer,
        posterUrl: seriesPoster,
        coverImageUrl: seriesCoverImage,
        seasons: seriesSeasons,
        director: seriesDirector,
        cast: seriesCast,
        quality: seriesQuality,
        audio: seriesAudio,
        customCategory: seriesCustomCategory
      });

      addToast("Series updated successfully!", "success");
      setShowEditSeriesModal(false);
      setEditingSeries(null);
      clearSeriesForm();
    } catch (err) {
      console.error("Edit series error:", err);
      addToast(`Failed to update series: ${err.message || err}`, "error");
    }
  };

  // CMS Rail CMS reorder
  const moveSection = (idx, direction) => {
    const updated = [...homepageSections];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setHomepageSections(updated);
    addToast("Homepage layout updated", "success");
  };

  const toggleSectionVisibility = (sectionId) => {
    const updated = homepageSections.map(sec => 
      sec.id === sectionId ? { ...sec, visible: !sec.visible } : sec
    );
    setHomepageSections(updated);
    addToast("Section visibility toggled", "info");
  };

  // Check state and render views
  if (authLoading || isAdminLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-emerald-400 select-none">
        <Terminal className="w-10 h-10 animate-pulse mb-3" />
        <span className="text-xs font-mono tracking-widest uppercase">Initializing Secure Terminal...</span>
      </div>
    );
  }

  // 1. Unauthenticated Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 select-text">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-mono font-extrabold tracking-widest text-emerald-400">
              SCF STUDIOS
            </h1>
            <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase mt-1">
              Management Console Terminal
            </p>
          </div>

          <div className="bg-amber-950/20 border border-amber-900/50 rounded-lg p-3.5 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-[10px] text-amber-400 font-mono leading-normal">
              <strong>RESTRICTED ENVIRONMENT:</strong> This console is strictly for authorized platform administrators. Access attempts are recorded.
            </div>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 font-mono text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@scfstudios.com"
                className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 outline-none focus:border-emerald-500 placeholder-slate-700 font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold">Password</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-slate-950 border border-slate-800 rounded-lg p-3 pr-10 text-slate-200 outline-none focus:border-emerald-500 placeholder-slate-700 font-mono w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={signingIn}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg transition-colors active:scale-95 disabled:opacity-50"
            >
              {signingIn ? "Verifying Credentials..." : "Authenticate Terminal"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Authenticated but Unauthorized audience account
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-950/60 p-8 rounded-2xl shadow-2xl text-center space-y-6">
          <ShieldAlert className="w-14 h-14 text-red-500 mx-auto animate-bounce" />
          <div className="space-y-2">
            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">Access Denied</h2>
            <p className="text-xs font-mono text-slate-400 leading-relaxed max-w-sm mx-auto">
              Your account <strong>({currentUser.email})</strong> is successfully authenticated with Firebase, but does not possess platform administrator privileges.
            </p>
          </div>

          <div className="pt-4 flex flex-col gap-2">
            <button
              onClick={logout}
              className="w-full py-2.5 bg-red-950/40 hover:bg-red-950/70 border border-red-900/50 text-red-400 font-mono font-bold rounded-lg text-xs transition-colors"
            >
              Sign Out &amp; Switch Account
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono font-bold rounded-lg text-xs transition-colors"
            >
              Return to Streaming Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderSeasonsBuilder = () => {
    // Add a new season
    const handleAddSeason = (e) => {
      e.preventDefault();
      const nextNum = seriesSeasons.length + 1;
      setSeriesSeasons([
        ...seriesSeasons,
        { seasonNumber: nextNum, name: `Season ${nextNum}`, episodes: [] }
      ]);
      setActiveSeasonTab(nextNum);
    };

    // Remove a season
    const handleRemoveSeason = (seasonNum) => {
      if (seriesSeasons.length <= 1) {
        addToast("A series must have at least one season.", "warning");
        return;
      }
      const updated = seriesSeasons
        .filter(s => s.seasonNumber !== seasonNum)
        .map((s, idx) => ({
          ...s,
          seasonNumber: idx + 1,
          name: `Season ${idx + 1}`
        }));
      setSeriesSeasons(updated);
      setActiveSeasonTab(1);
    };

    // Add episode to active season
    const handleAddEpisode = (e) => {
      e.preventDefault();
      if (!newEpTitle.trim()) {
        addToast("Episode name is required", "error");
        return;
      }
      
      const currentSeason = seriesSeasons.find(s => s.seasonNumber === activeSeasonTab);
      if (!currentSeason) return;

      const nextEpNum = currentSeason.episodes.length + 1;
      const newEpisode = {
        id: `ep-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        episodeNumber: nextEpNum,
        title: newEpTitle,
        description: newEpDescription,
        thumbnail: newEpThumbnail || "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500&auto=format&fit=crop",
        video: newEpVideo,
        duration: newEpDuration || "25m"
      };

      const updated = seriesSeasons.map(s => {
        if (s.seasonNumber === activeSeasonTab) {
          return {
            ...s,
            episodes: [...s.episodes, newEpisode]
          };
        }
        return s;
      });

      setSeriesSeasons(updated);
      
      // Clear ep inputs
      setNewEpTitle('');
      setNewEpDescription('');
      setNewEpThumbnail('');
      setNewEpVideo('');
      setNewEpDuration('');
      addToast("Episode added to list!", "success");
    };

    // Remove episode from active season
    const handleRemoveEpisode = (epId) => {
      const updated = seriesSeasons.map(s => {
        if (s.seasonNumber === activeSeasonTab) {
          const filtered = s.episodes.filter(ep => ep.id !== epId);
          // Re-index episode numbers
          const reindexed = filtered.map((ep, idx) => ({
            ...ep,
            episodeNumber: idx + 1
          }));
          return {
            ...s,
            episodes: reindexed
          };
        }
        return s;
      });
      setSeriesSeasons(updated);
      addToast("Episode removed", "info");
    };

    const activeSeason = seriesSeasons.find(s => s.seasonNumber === activeSeasonTab) || seriesSeasons[0];

    return (
      <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/40 space-y-4 col-span-full">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Seasons &amp; Episodes Builder</span>
          <button
            type="button"
            onClick={handleAddSeason}
            className="text-[9px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 uppercase tracking-wider bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 cursor-pointer"
          >
            + Add Season
          </button>
        </div>

        {/* Season Tabs Selector */}
        <div className="flex flex-wrap gap-2">
          {seriesSeasons.map(s => (
            <div key={s.seasonNumber} className="relative group">
              <button
                type="button"
                onClick={() => setActiveSeasonTab(s.seasonNumber)}
                className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  activeSeasonTab === s.seasonNumber
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {s.name} ({s.episodes.length} Ep)
              </button>
              {seriesSeasons.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSeason(s.seasonNumber)}
                  className="absolute -top-1.5 -right-1.5 hidden group-hover:flex w-4.5 h-4.5 rounded-full bg-red-600 hover:bg-red-500 text-white items-center justify-center text-[10px] font-extrabold shadow cursor-pointer transition-all"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Active Season Episodes list */}
        {activeSeason && (
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
              {activeSeason.name} Episodes
            </h4>

            {activeSeason.episodes.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic">No episodes added yet. Use form below to add the first episode.</p>
            ) : (
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                {activeSeason.episodes.map(ep => (
                  <div key={ep.id} className="flex gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-900 items-center justify-between group">
                    <div className="flex gap-2.5 items-center min-w-0">
                      <img src={ep.thumbnail} alt={ep.title} className="w-12 aspect-[16/9] object-cover rounded bg-slate-900" />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-white block truncate">
                          Ep {ep.episodeNumber}: {ep.title}
                        </span>
                        <span className="text-[9px] text-slate-500 font-semibold block truncate">
                          {ep.duration} &middot; {ep.description || 'No description'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEpisode(ep.id)}
                      className="text-red-500 hover:text-red-400 p-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-1 text-[9px] uppercase font-bold"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New Episode Input Form */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-3">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Add Episode details</span>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] text-slate-500 uppercase font-bold">Episode Name / Title</label>
                  <input
                    type="text"
                    value={newEpTitle}
                    onChange={e => setNewEpTitle(e.target.value)}
                    placeholder="e.g. Episode 1: Pilot"
                    className="bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] text-slate-500 uppercase font-bold">Duration</label>
                  <input
                    type="text"
                    value={newEpDuration}
                    onChange={e => setNewEpDuration(e.target.value)}
                    placeholder="e.g. 25m 15s"
                    className="bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[8px] text-slate-500 uppercase font-bold">Video Stream URL</label>
                <input
                  type="text"
                  value={newEpVideo}
                  onChange={e => setNewEpVideo(e.target.value)}
                  placeholder="https://..."
                  className="bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <ImageUploader
                  folder="episodes"
                  initialUrl={newEpThumbnail}
                  onUploadComplete={(url) => setNewEpThumbnail(url)}
                  label="Episode Thumbnail / Pic"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[8px] text-slate-500 uppercase font-bold">Episode Details / Description</label>
                <textarea
                  value={newEpDescription}
                  onChange={e => setNewEpDescription(e.target.value)}
                  placeholder="Insert episode summary..."
                  rows={2}
                  className="bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-slate-200 outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleAddEpisode}
                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded text-[10px] transition-all cursor-pointer"
              >
                + Add Episode to {activeSeason.name}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 3. Authorized Admin Panel Layout
  const getSubTab = () => {
    switch (currentPath) {
      case '/studio-console/dashboard': return 'dashboard';
      case '/studio-console/content': return 'content';
      case '/studio-console/movies': return 'movies';
      case '/studio-console/series': return 'series';
      case '/studio-console/kids': return 'kids';
      case '/studio-console/upcoming': return 'upcoming';
      case '/studio-console/users': return 'users';
      case '/studio-console/settings': return 'settings';
      default: return 'dashboard';
    }
  };

  const activeTab = getSubTab();

  const handleAdminLogout = async () => {
    await logout();
    addToast("Logged out of management console.", "info");
    navigate('/studio-console');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono select-text flex flex-col">
      {/* Visual Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <div>
            <h1 className="text-sm font-bold tracking-wider text-white">SCF STUDIO CONSOLE</h1>
            <span className="text-[9px] uppercase tracking-widest text-emerald-400 block font-bold">Secure Root Terminal</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 block">{currentUser.email}</span>
            <span className="text-[9px] text-emerald-500 font-bold block">Status: Administrator</span>
          </div>
          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-950/40 hover:bg-red-950/70 border border-red-900/40 text-red-400 rounded text-[10px] font-bold transition-all"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-60 bg-slate-900/60 border-r border-slate-800 p-4 space-y-1 flex-shrink-0 flex flex-col gap-0.5">
          {[
            { id: 'dashboard', name: 'Overview Stats', icon: Activity, route: '/studio-console/dashboard' },
            { id: 'content', name: 'Homepage rails', icon: LayoutGrid, route: '/studio-console/content' },
            { id: 'movies', name: 'Manage Movies', icon: Film, route: '/studio-console/movies' },
            { id: 'series', name: 'Manage Series', icon: Tv, route: '/studio-console/series' },
            { id: 'kids', name: 'Kids Content', icon: Smile, route: '/studio-console/kids' },
            { id: 'upcoming', name: 'Upcoming Releases', icon: Calendar, route: '/studio-console/upcoming' },
            { id: 'users', name: 'Admin Registry', icon: Users, route: '/studio-console/users' },
            { id: 'settings', name: 'System Config', icon: Settings, route: '/studio-console/settings' }
          ].map(tab => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.route)}
                className={`w-full text-left px-3.5 py-3 rounded-lg flex items-center gap-3 text-xs font-bold transition-all ${
                  isTabActive
                    ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/25 shadow-emerald-500/5 shadow-inner'
                    : 'border border-transparent hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {tab.name}
              </button>
            );
          })}
        </aside>

        {/* Content Panel Container */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          
          {/* Tab 1: Overview Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-sm font-extrabold uppercase text-white tracking-widest">Platform Telemetry Overview</h3>
                <p className="text-[9px] text-slate-500 mt-1 uppercase font-semibold">Stats synced directly with Firebase and IndexedDB services.</p>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "Catalog Movies", value: movies.length.toString(), icon: Film },
                  { title: "Catalog Series", value: series.length.toString(), icon: Tv },
                  { title: "Security Level", value: "Root Access", icon: Shield },
                  { title: "Platform Mode", value: "Premium", icon: Activity }
                ].map((kpi, idx) => (
                  <div key={idx} className="border border-slate-800 bg-slate-900/30 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="text-[8px] uppercase font-bold tracking-wider">{kpi.title}</span>
                      <kpi.icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-lg font-bold text-white">{kpi.value}</div>
                  </div>
                ))}
              </div>

              {/* Alert Warning Panel */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 leading-relaxed font-mono">
                <div className="flex items-center gap-2 text-emerald-400 text-[10px] uppercase font-bold mb-1.5">
                  <Terminal className="w-4 h-4" />
                  Terminal Log Active
                </div>
                Platform modifications made through this screen will immediately cache to the local client structures and synchronise configuration. Ensure titles and descriptors comply with rating board rules.
              </div>
            </div>
          )}

          {/* Tab 2: Homepage Rails Arrangement */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 mb-4">
                <h3 className="text-sm font-extrabold uppercase text-white tracking-widest">Homepage CMS Arrangement</h3>
                <p className="text-[9px] text-slate-500 mt-1 uppercase font-semibold">Reorder and control visibility of homepage sliders.</p>
              </div>

              <div className="space-y-3">
                {homepageSections.map((section, idx) => (
                  <div
                    key={section.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-xs font-mono ${
                      section.visible ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-950/20 border-slate-900 opacity-40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutGrid className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="font-bold text-white block leading-tight">{section.title}</span>
                        <span className="text-[8px] text-slate-500 uppercase">Type: {section.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={idx === 0}
                        onClick={() => moveSection(idx, 'up')}
                        className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={idx === homepageSections.length - 1}
                        onClick={() => moveSection(idx, 'down')}
                        className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => toggleSectionVisibility(section.id)}
                        className={`p-1.5 rounded transition-all ${
                          section.visible ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-500 hover:bg-slate-800'
                        }`}
                      >
                        {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Movies list control */}
          {activeTab === 'movies' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                <div>
                  <h3 className="text-sm font-extrabold uppercase text-white tracking-widest">Movies Database</h3>
                  <p className="text-[9px] text-slate-500 mt-1 uppercase font-semibold">Publish new movies to catalog database.</p>
                </div>
                <button
                  onClick={() => { clearMovieForm(); setShowAddMovieModal(true); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs"
                >
                  <Plus className="w-4 h-4" />
                  Add Movie
                </button>
              </div>

              <div className="space-y-3">
                {movies.map(m => (
                  <div key={m.id} className="flex justify-between items-center p-3.5 rounded-lg bg-slate-900/20 border border-slate-800 text-xs">
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      <img src={m.posterUrl || m.poster} alt={m.title} className="w-9 aspect-[2/3] object-cover rounded" />
                      <div className="min-w-0">
                        <span className="font-bold text-white block truncate">{m.title}</span>
                        <span className="text-[9px] text-slate-500">{m.genre} &middot; {m.language}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="flex gap-1.5">
                        {m.isOriginal && <Badge variant="original" className="text-[6px]">Original</Badge>}
                        {m.isPremium && <Badge variant="premium" className="text-[6px]">Premium</Badge>}
                      </div>
                      <button
                        onClick={() => handleEditMovieClick(m)}
                        className="text-slate-500 hover:text-emerald-400 p-1.5"
                        title="Edit Movie"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          deleteMovie(m.id);
                          addToast("Movie removed", "info");
                        }}
                        className="text-slate-500 hover:text-red-400 p-1.5"
                        title="Delete Movie"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Web Series Catalog control */}
          {activeTab === 'series' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                <div>
                  <h3 className="text-sm font-extrabold uppercase text-white tracking-widest">Web Series Catalog</h3>
                  <p className="text-[9px] text-slate-500 mt-1 uppercase font-semibold">Publish new web series playlists.</p>
                </div>
                <button
                  onClick={() => { clearSeriesForm(); setShowAddSeriesModal(true); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs"
                >
                  <Plus className="w-4 h-4" />
                  Add Series
                </button>
              </div>

              <div className="space-y-3">
                {series.map(s => (
                  <div key={s.id} className="flex justify-between items-center p-3.5 rounded-lg bg-slate-900/20 border border-slate-800 text-xs">
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      <img src={s.posterUrl || s.poster} alt={s.title} className="w-9 aspect-[2/3] object-cover rounded" />
                      <div className="min-w-0">
                        <span className="font-bold text-white block truncate">{s.title}</span>
                        <span className="text-[9px] text-slate-500">{s.seasons?.length} Season(s) &middot; {s.genre}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="flex gap-1.5">
                        {s.isOriginal && <Badge variant="original" className="text-[6px]">Original</Badge>}
                        {s.isPremium && <Badge variant="premium" className="text-[6px]">Premium</Badge>}
                      </div>
                      <button
                        onClick={() => handleEditSeriesClick(s)}
                        className="text-slate-500 hover:text-emerald-400 p-1.5"
                        title="Edit Series"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          deleteSeries(s.id);
                          addToast("Series removed", "info");
                        }}
                        className="text-slate-500 hover:text-red-400 p-1.5"
                        title="Delete Series"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kids Friendly Content Management */}
          {activeTab === 'kids' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-4 mb-4 gap-4">
                <div>
                  <h3 className="text-sm font-extrabold uppercase text-white tracking-widest flex items-center gap-2">
                    <Smile className="w-5 h-5 text-emerald-400" />
                    Kids Content Manager
                  </h3>
                  <p className="text-[9px] text-slate-500 mt-1 uppercase font-semibold">Curated catalog for younger audiences.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setMovieKids(true);
                      setShowAddMovieModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    Add Kids Movie
                  </button>
                  <button
                    onClick={() => {
                      setSeriesKids(true);
                      setShowAddSeriesModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    Add Kids Series
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Kids Movies Column */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">Movies</h4>
                  <div className="space-y-3">
                    {movies.filter(m => m.isKids).length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic">No kids movies added yet.</p>
                    ) : (
                      movies.filter(m => m.isKids).map(m => (
                        <div key={m.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-900/20 border border-slate-800 text-xs">
                          <div className="flex items-center gap-3 min-w-0 pr-4">
                            <img src={m.posterUrl || m.poster} alt={m.title} className="w-9 aspect-[2/3] object-cover rounded" />
                            <div className="min-w-0">
                              <span className="font-bold text-white block truncate">{m.title}</span>
                              <span className="text-[9px] text-slate-500">{m.genre} &middot; {m.language}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <button onClick={() => handleEditMovieClick(m)} className="text-slate-500 hover:text-emerald-400 p-1">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                deleteMovie(m.id);
                                addToast("Movie removed", "info");
                              }}
                              className="text-slate-500 hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Kids Series Column */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">Web Series</h4>
                  <div className="space-y-3">
                    {series.filter(s => s.isKids).length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic">No kids series added yet.</p>
                    ) : (
                      series.filter(s => s.isKids).map(s => (
                        <div key={s.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-900/20 border border-slate-800 text-xs">
                          <div className="flex items-center gap-3 min-w-0 pr-4">
                            <img src={s.posterUrl || s.poster} alt={s.title} className="w-9 aspect-[2/3] object-cover rounded" />
                            <div className="min-w-0">
                              <span className="font-bold text-white block truncate">{s.title}</span>
                              <span className="text-[9px] text-slate-500">{s.seasons?.length} Season(s) &middot; {s.genre}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <button onClick={() => handleEditSeriesClick(s)} className="text-slate-500 hover:text-emerald-400 p-1">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                deleteSeries(s.id);
                                addToast("Series removed", "info");
                              }}
                              className="text-slate-500 hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Content Management */}
          {activeTab === 'upcoming' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-4 mb-4 gap-4">
                <div>
                  <h3 className="text-sm font-extrabold uppercase text-white tracking-widest flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    Upcoming Releases
                  </h3>
                  <p className="text-[9px] text-slate-500 mt-1 uppercase font-semibold">Manage exclusive premieres and scheduled content.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setMovieComingSoon(true);
                      setShowAddMovieModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    Add Upcoming Movie
                  </button>
                  <button
                    onClick={() => {
                      setSeriesComingSoon(true);
                      setShowAddSeriesModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    Add Upcoming Series
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upcoming Movies Column */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">Movies</h4>
                  <div className="space-y-3">
                    {movies.filter(m => m.isComingSoon).length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic">No upcoming movies scheduled yet.</p>
                    ) : (
                      movies.filter(m => m.isComingSoon).map(m => (
                        <div key={m.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-900/20 border border-slate-800 text-xs">
                          <div className="flex items-center gap-3 min-w-0 pr-4">
                            <img src={m.posterUrl || m.poster} alt={m.title} className="w-9 aspect-[2/3] object-cover rounded" />
                            <div className="min-w-0">
                              <span className="font-bold text-white block truncate">{m.title}</span>
                              <span className="text-[9px] text-slate-500">{m.genre} &middot; {m.language}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <button onClick={() => handleEditMovieClick(m)} className="text-slate-500 hover:text-emerald-400 p-1">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                deleteMovie(m.id);
                                addToast("Movie removed", "info");
                              }}
                              className="text-slate-500 hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Upcoming Series Column */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">Web Series</h4>
                  <div className="space-y-3">
                    {series.filter(s => s.isComingSoon).length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic">No upcoming series scheduled yet.</p>
                    ) : (
                      series.filter(s => s.isComingSoon).map(s => (
                        <div key={s.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-900/20 border border-slate-800 text-xs">
                          <div className="flex items-center gap-3 min-w-0 pr-4">
                            <img src={s.posterUrl || s.poster} alt={s.title} className="w-9 aspect-[2/3] object-cover rounded" />
                            <div className="min-w-0">
                              <span className="font-bold text-white block truncate">{s.title}</span>
                              <span className="text-[9px] text-slate-500">{s.seasons?.length} Season(s) &middot; {s.genre}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <button onClick={() => handleEditSeriesClick(s)} className="text-slate-500 hover:text-emerald-400 p-1">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                deleteSeries(s.id);
                                addToast("Series removed", "info");
                              }}
                              className="text-slate-500 hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Tab 5: Admin registry (emails allowed access) */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-sm font-extrabold uppercase text-white tracking-widest">Administrator Registry</h3>
                <p className="text-[9px] text-slate-500 mt-1 uppercase font-semibold">Active credentials possessing terminal access.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900/20 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    Security Group: root-admins
                  </div>

                  <div className="divide-y divide-slate-800">
                    {(import.meta.env.VITE_AUTHORIZED_ADMINS || 'admin@scfstudios.com')
                      .split(',')
                      .map((adminEmail, idx) => (
                        <div key={idx} className="py-2.5 flex justify-between items-center text-xs font-mono">
                          <span className="text-white font-bold">{adminEmail.trim()}</span>
                          <span className="text-[9px] text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded uppercase font-bold">
                            Authorized Email
                          </span>
                        </div>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 leading-normal bg-slate-900/10 p-3 rounded-lg border border-slate-800/40">
                  💡 <strong>Registry Modification:</strong> Administrators cannot be created dynamically from this terminal for security reasons. To authorize a new administrator email, append it to the <code>VITE_AUTHORIZED_ADMINS</code> variable list inside <code>.env.local</code>.
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: System Configuration Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-sm font-extrabold uppercase text-white tracking-widest">System Configuration</h3>
                <p className="text-[9px] text-slate-500 mt-1 uppercase font-semibold">Technical configurations of the current SCF Studios instance.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="border border-slate-800 bg-slate-900/20 p-4 rounded-xl space-y-3">
                  <h4 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    Firebase Connection
                  </h4>
                  <div className="space-y-2 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Project ID:</span>
                      <span className="text-slate-300">{import.meta.env.VITE_FIREBASE_PROJECT_ID || "scf-studios"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Auth Domain:</span>
                      <span className="text-slate-300">{import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "scf-studios.firebaseapp.com"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Connection State:</span>
                      <span className="text-emerald-400 font-bold uppercase">Online</span>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-800 bg-slate-900/20 p-4 rounded-xl space-y-3">
                  <h4 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Client Storage Cache
                  </h4>
                  <div className="space-y-2 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Local Database:</span>
                      <span className="text-slate-300">IndexedDB (active)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Storage Usage:</span>
                      <span className="text-slate-300">~1.4 MB (caching movies)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Platform Build:</span>
                      <span className="text-slate-300">v1.0.0-Vite</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Add Movie Modal */}
      {showAddMovieModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative select-text text-xs text-slate-400 scrollbar-thin">
            <h3 className="text-sm font-bold uppercase text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Publish Movie to Platform
            </h3>

            <form onSubmit={handleAddMovie} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 uppercase font-bold">Movie Title</label>
                <input
                  type="text"
                  value={movieTitle}
                  onChange={(e) => setMovieTitle(e.target.value)}
                  placeholder="Title name..."
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 uppercase font-bold">Description</label>
                <textarea
                  value={movieDesc}
                  onChange={(e) => setMovieDesc(e.target.value)}
                  placeholder="Insert storyline description..."
                  rows={2}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Genre</label>
                  <select
                    value={movieGenre}
                    onChange={(e) => setMovieGenre(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  >
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Drama">Drama</option>
                    <option value="Action">Action</option>
                    <option value="Romance">Romance</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Horror">Horror</option>
                    <option value="Family">Family</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Language</label>
                  <select
                    value={movieLang}
                    onChange={(e) => setMovieLang(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Year</label>
                  <input type="text" value={movieYear} onChange={e => setMovieYear(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Duration</label>
                  <input type="text" value={movieDur} onChange={e => setMovieDur(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Rating</label>
                  <input type="text" value={movieRat} onChange={e => setMovieRat(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">YouTube ID (Trailer / Video ID)</label>
                  <input
                    type="text"
                    value={movieYoutubeId}
                    onChange={(e) => setMovieYoutubeId(e.target.value)}
                    placeholder="e.g. dQw4w9WgXcQ"
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Release Date</label>
                  <input
                    type="date"
                    value={movieReleaseDate}
                    onChange={(e) => setMovieReleaseDate(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Director</label>
                  <input
                    type="text"
                    value={movieDirector}
                    onChange={(e) => setMovieDirector(e.target.value)}
                    placeholder="Director name..."
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Key Cast (comma separated)</label>
                  <input
                    type="text"
                    value={movieCast}
                    onChange={(e) => setMovieCast(e.target.value)}
                    placeholder="e.g. Actor 1, Actor 2"
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Video Quality</label>
                  <select
                    value={movieQuality}
                    onChange={(e) => setMovieQuality(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  >
                    <option value="4K">4K Ultra HD</option>
                    <option value="UHD">UHD</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="720p">720p HD</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Audio Format</label>
                  <select
                    value={movieAudio}
                    onChange={(e) => setMovieAudio(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  >
                    <option value="Dolby Atmos">Dolby Atmos</option>
                    <option value="Dolby Vision">Dolby Vision</option>
                    <option value="Dolby Sound">Dolby Sound</option>
                    <option value="Stereo">Stereo</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 uppercase font-bold">Homepage Category Placement</label>
                <select
                  value={movieCustomCategory}
                  onChange={(e) => setMovieCustomCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                >
                  <option value="">None (Default Rails Only)</option>
                  <option value="trending">Trending Now</option>
                  <option value="best-pick">Best Pick</option>
                  <option value="popular">Popular</option>
                  <option value="must-watch">Must Watch</option>
                  <option value="short-films">Short Films</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUploader
                  folder="posters"
                  initialUrl={moviePoster}
                  onUploadComplete={(url) => setMoviePoster(url)}
                  label="Poster Image"
                />
                <ImageUploader
                  folder="covers"
                  initialUrl={movieCoverImage}
                  onUploadComplete={(url) => setMovieCoverImage(url)}
                  label="Cover Image (Landscape)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <VideoUploader
                  folder="videos"
                  initialUrl={movieVideo}
                  onUploadComplete={(url) => setMovieVideo(url)}
                  label="Movie Video File"
                />
                <VideoUploader
                  folder="trailers"
                  initialUrl={movieTrailer}
                  onUploadComplete={(url) => setMovieTrailer(url)}
                  label="Trailer Video File"
                />
              </div>


              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={movieOriginal} onChange={e => setMovieOriginal(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Original</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={moviePremium} onChange={e => setMoviePremium(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Premium</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={movieKids} onChange={e => setMovieKids(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Kids Friendly</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={movieFeatured} onChange={e => setMovieFeatured(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Featured</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={moviePublished} onChange={e => setMoviePublished(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Published</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={movieComingSoon} onChange={e => setMovieComingSoon(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Coming Soon</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { clearMovieForm(); setShowAddMovieModal(false); }}
                  className="px-4 py-2 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg"
                >
                  Publish Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Series Modal */}
      {showAddSeriesModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative select-text text-xs text-slate-400 scrollbar-thin">
            <h3 className="text-sm font-bold uppercase text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Add Web Series Playlist
            </h3>

            <form onSubmit={handleAddSeries} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 uppercase font-bold">Series Title</label>
                <input
                  type="text"
                  value={seriesTitle}
                  onChange={(e) => setSeriesTitle(e.target.value)}
                  placeholder="Title..."
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 uppercase font-bold">Description</label>
                <textarea
                  value={seriesDesc}
                  onChange={(e) => setSeriesDesc(e.target.value)}
                  placeholder="Describe your series content..."
                  rows={2}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Genre</label>
                  <select
                    value={seriesGenre}
                    onChange={(e) => setSeriesGenre(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  >
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Drama">Drama</option>
                    <option value="Romance">Romance</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Horror">Horror</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Language</label>
                  <select
                    value={seriesLang}
                    onChange={(e) => setSeriesLang(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Year</label>
                  <input type="text" value={seriesYear} onChange={e => setSeriesYear(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Duration</label>
                  <input type="text" value={seriesDur} onChange={e => setSeriesDur(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Rating</label>
                  <input type="text" value={seriesRat} onChange={e => setSeriesRat(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">YouTube ID (Trailer / Video ID)</label>
                  <input
                    type="text"
                    value={seriesYoutubeId}
                    onChange={(e) => setSeriesYoutubeId(e.target.value)}
                    placeholder="e.g. dQw4w9WgXcQ"
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Release Date</label>
                  <input
                    type="date"
                    value={seriesReleaseDate}
                    onChange={(e) => setSeriesReleaseDate(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Director / Creator</label>
                  <input
                    type="text"
                    value={seriesDirector}
                    onChange={(e) => setSeriesDirector(e.target.value)}
                    placeholder="Director name..."
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Key Cast (comma separated)</label>
                  <input
                    type="text"
                    value={seriesCast}
                    onChange={(e) => setSeriesCast(e.target.value)}
                    placeholder="e.g. Actor 1, Actor 2"
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Video Quality</label>
                  <select
                    value={seriesQuality}
                    onChange={(e) => setSeriesQuality(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  >
                    <option value="4K">4K Ultra HD</option>
                    <option value="UHD">UHD</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="720p">720p HD</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Audio Format</label>
                  <select
                    value={seriesAudio}
                    onChange={(e) => setSeriesAudio(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  >
                    <option value="Dolby Atmos">Dolby Atmos</option>
                    <option value="Dolby Vision">Dolby Vision</option>
                    <option value="Dolby Sound">Dolby Sound</option>
                    <option value="Stereo">Stereo</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 uppercase font-bold">Homepage Category Placement</label>
                <select
                  value={seriesCustomCategory}
                  onChange={(e) => setSeriesCustomCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                >
                  <option value="">None (Default Rails Only)</option>
                  <option value="trending">Trending Now</option>
                  <option value="best-pick">Best Pick</option>
                  <option value="popular">Popular</option>
                  <option value="must-watch">Must Watch</option>
                  <option value="short-films">Short Films</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUploader
                  folder="series"
                  initialUrl={seriesPoster}
                  onUploadComplete={(url) => setSeriesPoster(url)}
                  label="Poster Image"
                />
                <ImageUploader
                  folder="series"
                  initialUrl={seriesCoverImage}
                  onUploadComplete={(url) => setSeriesCoverImage(url)}
                  label="Cover Image (Landscape)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <VideoUploader
                  folder="series_videos"
                  initialUrl={seriesVideo}
                  onUploadComplete={(url) => setSeriesVideo(url)}
                  label="Series Video File"
                />
                <VideoUploader
                  folder="series_trailers"
                  initialUrl={seriesTrailer}
                  onUploadComplete={(url) => setSeriesTrailer(url)}
                  label="Series Trailer Video File"
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={seriesOriginal} onChange={e => setSeriesOriginal(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Original</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={seriesPremium} onChange={e => setSeriesPremium(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Premium</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={seriesKids} onChange={e => setSeriesKids(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Kids Friendly</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={seriesComingSoon} onChange={e => setSeriesComingSoon(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Coming Soon</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={seriesFeatured} onChange={e => setSeriesFeatured(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Featured</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={seriesPublished} onChange={e => setSeriesPublished(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Published</span>
                </label>
              </div>

              {renderSeasonsBuilder()}

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { clearSeriesForm(); setShowAddSeriesModal(false); }}
                  className="px-4 py-2 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg"
                >
                  Publish Series
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Movie Modal */}
      {showEditMovieModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative select-text text-xs text-slate-400 scrollbar-thin">
            <h3 className="text-sm font-bold uppercase text-white mb-6 flex items-center gap-2">
              <Edit className="w-5 h-5 text-emerald-400" />
              Edit Movie: {movieTitle}
            </h3>

            <form onSubmit={handleEditMovieSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 uppercase font-bold">Movie Title</label>
                <input
                  type="text"
                  value={movieTitle}
                  onChange={(e) => setMovieTitle(e.target.value)}
                  placeholder="Title name..."
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 uppercase font-bold">Description</label>
                <textarea
                  value={movieDesc}
                  onChange={(e) => setMovieDesc(e.target.value)}
                  placeholder="Insert storyline description..."
                  rows={2}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Genre</label>
                  <select
                    value={movieGenre}
                    onChange={(e) => setMovieGenre(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  >
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Drama">Drama</option>
                    <option value="Action">Action</option>
                    <option value="Romance">Romance</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Horror">Horror</option>
                    <option value="Family">Family</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Language</label>
                  <select
                    value={movieLang}
                    onChange={(e) => setMovieLang(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Year</label>
                  <input type="text" value={movieYear} onChange={e => setMovieYear(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Duration</label>
                  <input type="text" value={movieDur} onChange={e => setMovieDur(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Rating</label>
                  <input type="text" value={movieRat} onChange={e => setMovieRat(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">YouTube ID (Trailer / Video ID)</label>
                  <input
                    type="text"
                    value={movieYoutubeId}
                    onChange={(e) => setMovieYoutubeId(e.target.value)}
                    placeholder="e.g. dQw4w9WgXcQ"
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Release Date</label>
                  <input
                    type="date"
                    value={movieReleaseDate}
                    onChange={(e) => setMovieReleaseDate(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Director</label>
                  <input
                    type="text"
                    value={movieDirector}
                    onChange={(e) => setMovieDirector(e.target.value)}
                    placeholder="Director name..."
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Key Cast (comma separated)</label>
                  <input
                    type="text"
                    value={movieCast}
                    onChange={(e) => setMovieCast(e.target.value)}
                    placeholder="e.g. Actor 1, Actor 2"
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Video Quality</label>
                  <select
                    value={movieQuality}
                    onChange={(e) => setMovieQuality(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  >
                    <option value="4K">4K Ultra HD</option>
                    <option value="UHD">UHD</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="720p">720p HD</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Audio Format</label>
                  <select
                    value={movieAudio}
                    onChange={(e) => setMovieAudio(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  >
                    <option value="Dolby Atmos">Dolby Atmos</option>
                    <option value="Dolby Vision">Dolby Vision</option>
                    <option value="Dolby Sound">Dolby Sound</option>
                    <option value="Stereo">Stereo</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 uppercase font-bold">Homepage Category Placement</label>
                <select
                  value={movieCustomCategory}
                  onChange={(e) => setMovieCustomCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                >
                  <option value="">None (Default Rails Only)</option>
                  <option value="trending">Trending Now</option>
                  <option value="best-pick">Best Pick</option>
                  <option value="popular">Popular</option>
                  <option value="must-watch">Must Watch</option>
                  <option value="short-films">Short Films</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUploader
                  folder="posters"
                  initialUrl={moviePoster}
                  onUploadComplete={(url) => setMoviePoster(url)}
                  label="Poster Image"
                />
                <ImageUploader
                  folder="covers"
                  initialUrl={movieCoverImage}
                  onUploadComplete={(url) => setMovieCoverImage(url)}
                  label="Cover Image (Landscape)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <VideoUploader
                  folder="videos"
                  initialUrl={movieVideo}
                  onUploadComplete={(url) => setMovieVideo(url)}
                  label="Movie Video File"
                />
                <VideoUploader
                  folder="trailers"
                  initialUrl={movieTrailer}
                  onUploadComplete={(url) => setMovieTrailer(url)}
                  label="Trailer Video File"
                />
              </div>


              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={movieOriginal} onChange={e => setMovieOriginal(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Original</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={moviePremium} onChange={e => setMoviePremium(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Premium</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={movieKids} onChange={e => setMovieKids(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Kids Friendly</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={movieFeatured} onChange={e => setMovieFeatured(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Featured</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={moviePublished} onChange={e => setMoviePublished(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Published</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={movieComingSoon} onChange={e => setMovieComingSoon(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Coming Soon</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditMovieModal(false);
                    setEditingMovie(null);
                  }}
                  className="px-4 py-2 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Series Modal */}
      {showEditSeriesModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative select-text text-xs text-slate-400 scrollbar-thin">
            <h3 className="text-sm font-bold uppercase text-white mb-6 flex items-center gap-2">
              <Edit className="w-5 h-5 text-emerald-400" />
              Edit Series: {seriesTitle}
            </h3>

            <form onSubmit={handleEditSeriesSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 uppercase font-bold">Series Title</label>
                <input
                  type="text"
                  value={seriesTitle}
                  onChange={(e) => setSeriesTitle(e.target.value)}
                  placeholder="Title..."
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 uppercase font-bold">Description</label>
                <textarea
                  value={seriesDesc}
                  onChange={(e) => setSeriesDesc(e.target.value)}
                  placeholder="Describe your series content..."
                  rows={2}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Genre</label>
                  <select
                    value={seriesGenre}
                    onChange={(e) => setSeriesGenre(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  >
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Drama">Drama</option>
                    <option value="Romance">Romance</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Horror">Horror</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Language</label>
                  <select
                    value={seriesLang}
                    onChange={(e) => setSeriesLang(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Year</label>
                  <input type="text" value={seriesYear} onChange={e => setSeriesYear(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Duration</label>
                  <input type="text" value={seriesDur} onChange={e => setSeriesDur(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Rating</label>
                  <input type="text" value={seriesRat} onChange={e => setSeriesRat(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">YouTube ID (Trailer / Video ID)</label>
                  <input
                    type="text"
                    value={seriesYoutubeId}
                    onChange={(e) => setSeriesYoutubeId(e.target.value)}
                    placeholder="e.g. dQw4w9WgXcQ"
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Release Date</label>
                  <input
                    type="date"
                    value={seriesReleaseDate}
                    onChange={(e) => setSeriesReleaseDate(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Director / Creator</label>
                  <input
                    type="text"
                    value={seriesDirector}
                    onChange={(e) => setSeriesDirector(e.target.value)}
                    placeholder="Director name..."
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Key Cast (comma separated)</label>
                  <input
                    type="text"
                    value={seriesCast}
                    onChange={(e) => setSeriesCast(e.target.value)}
                    placeholder="e.g. Actor 1, Actor 2"
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Video Quality</label>
                  <select
                    value={seriesQuality}
                    onChange={(e) => setSeriesQuality(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  >
                    <option value="4K">4K Ultra HD</option>
                    <option value="UHD">UHD</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="720p">720p HD</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Audio Format</label>
                  <select
                    value={seriesAudio}
                    onChange={(e) => setSeriesAudio(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  >
                    <option value="Dolby Atmos">Dolby Atmos</option>
                    <option value="Dolby Vision">Dolby Vision</option>
                    <option value="Dolby Sound">Dolby Sound</option>
                    <option value="Stereo">Stereo</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 uppercase font-bold">Homepage Category Placement</label>
                <select
                  value={seriesCustomCategory}
                  onChange={(e) => setSeriesCustomCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                >
                  <option value="">None (Default Rails Only)</option>
                  <option value="trending">Trending Now</option>
                  <option value="best-pick">Best Pick</option>
                  <option value="popular">Popular</option>
                  <option value="must-watch">Must Watch</option>
                  <option value="short-films">Short Films</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUploader
                  folder="series"
                  initialUrl={seriesPoster}
                  onUploadComplete={(url) => setSeriesPoster(url)}
                  label="Poster Image"
                />
                <ImageUploader
                  folder="series"
                  initialUrl={seriesCoverImage}
                  onUploadComplete={(url) => setSeriesCoverImage(url)}
                  label="Cover Image (Landscape)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <VideoUploader
                  folder="series_videos"
                  initialUrl={seriesVideo}
                  onUploadComplete={(url) => setSeriesVideo(url)}
                  label="Series Video File"
                />
                <VideoUploader
                  folder="series_trailers"
                  initialUrl={seriesTrailer}
                  onUploadComplete={(url) => setSeriesTrailer(url)}
                  label="Series Trailer Video File"
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={seriesOriginal} onChange={e => setSeriesOriginal(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Original</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={seriesPremium} onChange={e => setSeriesPremium(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Premium</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={seriesKids} onChange={e => setSeriesKids(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Kids Friendly</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={seriesComingSoon} onChange={e => setSeriesComingSoon(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Coming Soon</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={seriesFeatured} onChange={e => setSeriesFeatured(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Featured</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={seriesPublished} onChange={e => setSeriesPublished(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                  <span>Published</span>
                </label>
              </div>

              {renderSeasonsBuilder()}

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditSeriesModal(false);
                    setEditingSeries(null);
                  }}
                  className="px-4 py-2 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
