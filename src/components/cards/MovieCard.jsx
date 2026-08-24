import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useToast } from '../../context/ToastContext';
import { Play, Plus, Check, Info, Clock } from 'lucide-react';
import Badge from '../common/Badge';

export default function MovieCard({ movie, fullWidth }) {
  const { navigate } = useRouter();
  const { toggleMyList, isInMyList } = usePlayback();
  const { addToast } = useToast();
  const isAdded = isInMyList(movie.id);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (movie.isComingSoon) {
      addToast(`"${movie.title}" is coming soon. Stay tuned!`, "info");
      return;
    }
    navigate(`/watch/${movie.id}`);
  };

  const handleToggleList = (e) => {
    e.stopPropagation();
    toggleMyList(movie.id);
    addToast(isAdded ? "Removed from My List" : "Added to My List", "success");
  };

  const handleInfo = (e) => {
    e.stopPropagation();
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : 'flex-shrink-0 w-32 sm:w-36 md:w-40'}`}>
      <div
        onClick={() => navigate(`/movie/${movie.id}`)}
        className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-card-bg cursor-pointer group transition-all duration-300 border border-white/5 hover:scale-105 hover:z-20 hover:shadow-2xl"
      >
        {/* Background Poster */}
        <img
          src={movie.posterUrl || movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:opacity-40 transition-opacity duration-300"
          loading="lazy"
        />

        {/* Badges (Premium, Original, Coming Soon) */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {movie.isComingSoon && <Badge variant="warning" className="text-[7px] px-1 py-0">Coming Soon</Badge>}
          {movie.isOriginal && <Badge variant="original" className="text-[7px] px-1 py-0">Original</Badge>}
          {movie.isPremium && <Badge variant="premium" className="text-[7px] px-1 py-0">Premium</Badge>}
        </div>

        {/* Bottom overlay info bar - Always visible inside poster */}
        <div className="absolute bottom-0 left-0 w-full p-2.5 bg-gradient-to-t from-black/95 via-black/55 to-transparent flex flex-col z-10 pointer-events-none">
          <h4 className="text-[10px] sm:text-[11px] font-bold truncate text-white drop-shadow-md leading-tight">{movie.title}</h4>
          <p className="text-[8px] sm:text-[9px] text-white/70 mt-0.5 leading-none">
            {movie.year || (movie.releaseDate ? movie.releaseDate.substring(0, 4) : '2026')} &middot; {movie.genre}
          </p>
        </div>

        {/* Hover Panel on Desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end">
          <h4 className="text-xs font-bold text-text-primary mb-1 truncate">{movie.title}</h4>
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-1 text-[8px] text-text-secondary font-medium mb-3">
            <span>{movie.year || (movie.releaseDate ? movie.releaseDate.substring(0, 4) : '2026')}</span>
            <span>&middot;</span>
            <span>{movie.duration}</span>
            <span>&middot;</span>
            <span className="border border-white/20 px-0.5 rounded text-[7px]">{movie.rating || 'G'}</span>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePlay}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${
                movie.isComingSoon
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-brand-accent hover:bg-brand-accent-hover text-white'
              }`}
              title={movie.isComingSoon ? "Coming Soon" : "Watch Now"}
            >
              {movie.isComingSoon ? <Clock className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
            </button>
            
            <button
              onClick={handleToggleList}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all"
              title="My List"
            >
              {isAdded ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleInfo}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center ml-auto transition-all"
              title="More Info"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
