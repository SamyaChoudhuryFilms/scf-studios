import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { useContent } from '../../context/ContentContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useToast } from '../../context/ToastContext';
import { Play, X } from 'lucide-react';

export default function ContinueWatchingCard({ progressItem }) {
  const { navigate } = useRouter();
  const { movies, series } = useContent();
  const { removeFromHistory } = usePlayback();
  const { addToast } = useToast();

  const { contentId, type, progressPercent, position } = progressItem;

  // Resolve content details
  let item = null;
  let displayTitle = '';
  let displaySubtitle = '';
  let thumbnail = '';

  if (type === 'movie') {
    item = movies.find(m => m.id === contentId);
    if (item) {
      displayTitle = item.title;
      displaySubtitle = 'Movie';
      thumbnail = item.posterUrl || item.poster; // or coverImage
    }
  } else if (type === 'episode') {
    // Search series for episode
    for (const s of series) {
      for (const season of s.seasons) {
        const ep = season.episodes.find(e => e.id === contentId);
        if (ep) {
          item = ep;
          displayTitle = s.title;
          displaySubtitle = `${season.name} &middot; Ep ${ep.episodeNumber}`;
          thumbnail = ep.thumbnail;
          break;
        }
      }
      if (item) break;
    }
  }

  if (!item) return null;

  const handlePlay = (e) => {
    e.stopPropagation();
    navigate(`/watch/${contentId}`);
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    removeFromHistory(contentId);
    addToast("Removed from Continue Watching", "info");
  };

  return (
    <div
      onClick={() => navigate(`/watch/${contentId}`)}
      className="relative flex-shrink-0 w-48 sm:w-56 md:w-64 bg-card-bg/40 border border-white/5 rounded-lg overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-105 hover:bg-card-bg hover:border-white/10 hover:shadow-2xl"
    >
      {/* Thumbnail area with progress line */}
      <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden">
        <img
          src={thumbnail}
          alt={displayTitle}
          className="w-full h-full object-cover group-hover:opacity-40 transition-opacity duration-300"
          loading="lazy"
        />

        {/* Play Icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-9 h-9 rounded-full bg-brand-accent text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all">
            <Play className="w-4.5 h-4.5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Dismiss Cross Icon */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 active:scale-95"
          title="Remove from history"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Persistent bottom progress bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div
            className="h-full bg-brand-accent"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Title & Progress info */}
      <div className="p-3">
        <h4 className="text-xs font-bold text-text-primary truncate mb-0.5 leading-snug">
          {displayTitle}
        </h4>
        <div className="flex items-center justify-between text-[9px] text-text-secondary font-medium">
          <span dangerouslySetInnerHTML={{ __html: displaySubtitle }}></span>
          <span className="text-brand-accent font-bold">{progressPercent}% watched</span>
        </div>
      </div>
    </div>
  );
}
