import React, { useEffect, useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useContent } from '../../context/ContentContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import { Play, Plus, Check, Share2, ChevronRight, Tv, Calendar, ListVideo, Film } from 'lucide-react';

export default function SeriesDetail() {
  const { matchRoute, navigate } = useRouter();
  const { series } = useContent();
  const { toggleMyList, isInMyList, watchHistory } = usePlayback();
  const { addToast } = useToast();

  const [showSeries, setShowSeries] = useState(null);
  const [selectedSeasonNum, setSelectedSeasonNum] = useState(1);

  // Match /series/:id route
  useEffect(() => {
    const params = matchRoute('/series/:id');
    if (params?.id) {
      const found = series.find(s => s.id === params.id);
      if (found) {
        setShowSeries(found);
        setSelectedSeasonNum(1); // Reset to season 1 on switch
        window.scrollTo(0, 0);
      }
    }
  }, [series, window.location.pathname]);

  if (!showSeries) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text-secondary text-sm">
        Series not found.
      </div>
    );
  }

  const isAdded = isInMyList(showSeries.id);
  const selectedSeason = showSeries.seasons?.find(s => s.seasonNumber === selectedSeasonNum) || showSeries.seasons?.[0];

  // Resume logic: Find latest episode of this series in watch history
  const getResumeEpisode = () => {
    const epIds = showSeries.seasons?.flatMap(s => s.episodes.map(e => e.id)) || [];
    const matchedHistory = watchHistory
      .filter(h => epIds.includes(h.contentId))
      .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));

    if (matchedHistory.length > 0) {
      // Find the episode details
      const lastPlayedId = matchedHistory[0].contentId;
      for (const season of showSeries.seasons) {
        const ep = season.episodes.find(e => e.id === lastPlayedId);
        if (ep) return { episode: ep, seasonNumber: season.seasonNumber };
      }
    }
    
    // Default to first episode of first season
    return {
      episode: showSeries.seasons?.[0]?.episodes?.[0],
      seasonNumber: 1
    };
  };

  const { episode: resumeEp, seasonNumber: resumeSeasonNum } = getResumeEpisode();

  const handleResumePlay = () => {
    if (resumeEp) {
      navigate(`/watch/${resumeEp.id}`);
      addToast(`Resuming Season ${resumeSeasonNum} Ep ${resumeEp.episodeNumber}`, "info");
    } else {
      addToast("No episodes available.", "error");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast("Link copied to clipboard!", "success");
  };

  // Find if an episode has progress in history
  const getEpisodeProgress = (epId) => {
    const historyItem = watchHistory.find(h => h.contentId === epId);
    return historyItem ? historyItem.progressPercent : 0;
  };

  return (
    <div className="pb-16 min-h-screen bg-background text-text-primary select-text">
      {/* Cover Image Section */}
      <section className="relative w-full h-[55vh] md:h-[65vh] flex items-end">
        <div className="absolute inset-0 z-0">
          <img
            src={showSeries.coverImageUrl || showSeries.coverImage}
            alt={showSeries.title}
            className="w-full h-full object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/40 to-transparent"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-end pb-8">
          {/* Poster (Desktop) */}
          <div className="hidden md:block w-48 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0">
            <img src={showSeries.posterUrl || showSeries.poster} alt={showSeries.title} className="w-full h-full object-cover" />
          </div>

          {/* Text and controls */}
          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {showSeries.isOriginal && <Badge variant="original">Original</Badge>}
              {showSeries.isPremium && <Badge variant="premium">Premium</Badge>}
              <span className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                <Tv className="w-3.5 h-3.5" />
                {showSeries.seasons?.length} Seasons
              </span>
              <span className="text-text-muted">&middot;</span>
              <span className="text-xs font-semibold text-text-secondary">{showSeries.genre}</span>
              <span className="text-text-muted">&middot;</span>
              <span className="text-[10px] font-bold bg-brand-accent/20 border border-brand-accent/30 text-brand-accent px-1.5 py-0.5 rounded">
                {showSeries.quality || '4K'}
              </span>
              {showSeries.audio && (
                <>
                  <span className="text-text-muted">&middot;</span>
                  <span className="text-[10px] font-bold bg-white/10 border border-white/20 text-text-secondary px-1.5 py-0.5 rounded">
                    {showSeries.audio}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold uppercase mb-4 tracking-tight">
              {showSeries.title}
            </h1>

            <p className="text-sm md:text-base text-text-secondary font-medium leading-relaxed max-w-3xl mb-6">
              {showSeries.description}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleResumePlay}
                className="flex items-center gap-2 px-6 py-3 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-lg shadow-lg transition-transform hover:scale-105 text-sm"
              >
                <Play className="w-4 h-4 fill-white" />
                {resumeEp ? `Play S${resumeSeasonNum}:E${resumeEp.episodeNumber}` : 'Play'}
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center w-11 h-11 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg text-white transition-all active:scale-95"
                title="Share Series"
              >
                <Share2 className="w-4.5 h-4.5" />
              </button>

              <button
                onClick={() => {
                  toggleMyList(showSeries.id);
                  addToast(isAdded ? "Removed from My List" : "Added to My List", "success");
                }}
                className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold rounded-lg transition-transform hover:scale-105 text-sm"
              >
                {isAdded ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
                My List
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Seasons & Episode List Section */}
      <section className="max-w-7xl mx-auto py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/5 pb-4 mb-8 gap-4">
          <div className="flex items-center gap-3">
            <ListVideo className="w-5 h-5 text-brand-accent" />
            <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-wider">
              Episodes
            </h2>
          </div>

          {/* Season Dropdown Selector */}
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="text-text-muted uppercase text-[10px]">Season</span>
            <select
              value={selectedSeasonNum}
              onChange={(e) => setSelectedSeasonNum(parseInt(e.target.value))}
              className="bg-card-bg border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-accent text-white"
            >
              {showSeries.seasons?.map(season => (
                <option key={season.seasonNumber} value={season.seasonNumber}>
                  {season.name} ({season.episodes.length} Episodes)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Episode Grid / List */}
        {selectedSeason ? (
          <div className="space-y-6 max-w-5xl">
            {selectedSeason.episodes.map(ep => {
              const progress = getEpisodeProgress(ep.id);
              
              return (
                <div
                  key={ep.id}
                  onClick={() => navigate(`/watch/${ep.id}`)}
                  className="flex flex-col md:flex-row gap-5 p-4 rounded-xl bg-card-bg/20 border border-white/5 hover:border-white/10 hover:bg-card-bg/40 cursor-pointer group transition-all"
                >
                  {/* Episode Thumbnail */}
                  <div className="relative w-full md:w-56 aspect-[16/9] rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
                    <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    
                    {/* Play button overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-brand-accent text-white flex items-center justify-center shadow-lg">
                        <Play className="w-4.5 h-4.5 fill-white ml-0.5" />
                      </div>
                    </div>

                    <span className="absolute bottom-2 right-2 px-1 py-0.5 bg-black/85 text-[9px] font-bold text-white rounded">
                      {ep.duration}
                    </span>

                    {/* Progress Bar (Continue watching indicator) */}
                    {progress > 0 && (
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                        <div className="h-full bg-brand-accent" style={{ width: `${progress}%` }}></div>
                      </div>
                    )}
                  </div>

                  {/* Episode Metadata & Description */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold text-text-primary group-hover:text-brand-accent transition-colors truncate">
                        Ep {ep.episodeNumber}: {ep.title}
                      </h3>
                      {progress > 0 && (
                        <span className="text-[10px] text-brand-accent font-bold">
                          {progress === 100 ? 'Watched' : `${progress}% Watched`}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                      {ep.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-text-muted">No episodes found for this season.</p>
        )}
      </section>

      {/* Series Production Details & Cast */}
      <section className="max-w-7xl mx-auto pb-16 border-t border-white/5 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Metadata & Crew */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-card-bg/40 border border-white/5 rounded-xl space-y-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-2">
                <Film className="w-4.5 h-4.5 text-brand-accent" />
                Series Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[10px] text-text-muted uppercase block font-semibold mb-0.5">Director / Creator</span>
                  <span className="font-bold text-text-secondary">{showSeries.director || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase block font-semibold mb-0.5">Genre</span>
                  <span className="font-bold text-text-secondary">{showSeries.genre}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase block font-semibold mb-0.5">Language</span>
                  <span className="font-bold text-text-secondary">{showSeries.language}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase block font-semibold mb-0.5">Age Rating</span>
                  <span className="font-bold text-text-secondary border border-white/10 px-1.5 py-0.5 rounded text-xs inline-block mt-0.5">
                    {showSeries.rating}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase block font-semibold mb-0.5">Video Quality</span>
                  <span className="font-bold text-text-secondary">{showSeries.quality || '4K'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase block font-semibold mb-0.5">Audio Track</span>
                  <span className="font-bold text-text-secondary">{showSeries.audio || 'Dolby Atmos'}</span>
                </div>
              </div>

              {showSeries.cast && showSeries.cast.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] text-text-muted uppercase block font-semibold mb-1">Key Cast</span>
                  <div className="flex flex-wrap gap-2">
                    {showSeries.cast.map(actor => (
                      <span key={actor} className="text-xs bg-white/5 border border-white/5 px-2.5 py-1 rounded text-text-secondary font-medium">
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
