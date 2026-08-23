import React, { useState } from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { useContent } from '../../context/ContentContext';
import { useRouter } from '../../context/RouterContext';
import { useToast } from '../../context/ToastContext';
import { History, Trash2, Play, X, Calendar, Clock } from 'lucide-react';
import Badge from '../../components/common/Badge';

export default function WatchHistory() {
  const { watchHistory, clearHistory, removeFromHistory } = usePlayback();
  const { movies, series } = useContent();
  const { navigate } = useRouter();
  const { addToast } = useToast();

  const [activeFilter, setActiveFilter] = useState('All'); // 'All', 'In Progress', 'Completed'

  // Resolve history items details
  const resolvedHistory = watchHistory.map(h => {
    let itemDetails = null;
    let title = '';
    let description = '';
    let thumbnail = '';

    if (h.type === 'movie') {
      itemDetails = movies.find(m => m.id === h.contentId);
      if (itemDetails) {
        title = itemDetails.title;
        description = itemDetails.description;
        thumbnail = itemDetails.posterUrl || itemDetails.poster;
      }
    } else if (h.type === 'episode') {
      // Find episode in series list
      for (const s of series) {
        for (const season of s.seasons) {
          const ep = season.episodes.find(e => e.id === h.contentId);
          if (ep) {
            itemDetails = ep;
            title = `${s.title} — ${season.name} Ep ${ep.episodeNumber}`;
            description = ep.description;
            thumbnail = ep.thumbnail;
            break;
          }
        }
        if (itemDetails) break;
      }
    }

    if (!itemDetails) return null;

    return {
      ...h,
      title,
      description,
      thumbnail
    };
  }).filter(Boolean);

  // Filter list
  const filteredHistory = resolvedHistory.filter(item => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'In Progress') return !item.completed;
    if (activeFilter === 'Completed') return item.completed;
    return false;
  });

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear your entire watch history?")) {
      clearHistory();
      addToast("Watch history cleared", "info");
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="pb-16 min-h-screen bg-background pt-24 px-4 md:px-12 select-text">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Title with Clear Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 mb-6 gap-4">
          <h1 className="text-2xl font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <History className="w-6 h-6 text-brand-accent" />
            Watch History
          </h1>

          {resolvedHistory.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-red-500/20 hover:bg-red-500/10 text-red-400 rounded-lg text-xs font-bold transition-all self-start sm:self-auto"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8">
          {['All', 'In Progress', 'Completed'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeFilter === filter
                  ? 'bg-brand-accent text-white shadow-lg'
                  : 'bg-card-bg/40 border border-white/5 text-text-secondary hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* History items List */}
        {filteredHistory.length === 0 ? (
          <div className="py-24 text-center max-w-sm mx-auto">
            <History className="w-12 h-12 mx-auto mb-4 text-text-muted opacity-40 animate-pulse" />
            <h3 className="text-base font-bold text-white mb-1">No history found</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {activeFilter === 'All'
                ? "You haven't watched any movies or series yet. Start exploring the catalog!"
                : `No watch items match the "${activeFilter}" filter.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map(item => (
              <div
                key={item.contentId}
                className="flex gap-4 p-3.5 rounded-xl bg-card-bg/15 border border-white/5 hover:border-white/10 hover:bg-card-bg/30 relative group transition-all"
              >
                {/* Image poster preview */}
                <div className="relative w-28 sm:w-40 aspect-[16/9] bg-slate-900 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                  
                  {/* Play click trigger */}
                  <button
                    onClick={() => navigate(`/watch/${item.contentId}`)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <div className="w-9 h-9 rounded-full bg-brand-accent text-white flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </button>
                  
                  {/* Bottom progress line */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                    <div className="h-full bg-brand-accent" style={{ width: `${item.progressPercent}%` }}></div>
                  </div>
                </div>

                {/* Info and timestamps */}
                <div className="flex-1 min-w-0 pr-6 flex flex-col justify-center">
                  <h4
                    onClick={() => navigate(`/watch/${item.contentId}`)}
                    className="text-xs font-bold text-text-primary hover:text-brand-accent transition-colors truncate cursor-pointer leading-snug mb-1"
                  >
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-text-secondary line-clamp-2 leading-relaxed mb-2.5 hidden sm:block">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[9px] text-text-muted font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.watchedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Watched {formatTime(item.position)} / {formatTime(item.duration)} ({item.progressPercent}%)
                    </span>
                    {item.completed && <Badge variant="success" className="text-[7px] px-1 py-0.5">Completed</Badge>}
                  </div>
                </div>

                {/* Dismiss single item button */}
                <button
                  onClick={() => {
                    removeFromHistory(item.contentId);
                    addToast("Removed item from watch history", "info");
                  }}
                  className="absolute top-3.5 right-3.5 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from history"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
