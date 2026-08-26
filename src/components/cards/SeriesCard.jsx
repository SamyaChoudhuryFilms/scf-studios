import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useToast } from '../../context/ToastContext';
import { Play, Plus, Check, Info } from 'lucide-react';
import Badge from '../common/Badge';

export default function SeriesCard({ series, fullWidth }) {
  const { navigate } = useRouter();
  const { toggleMyList, isInMyList } = usePlayback();
  const { addToast } = useToast();

  const isAdded = isInMyList(series.id);

  const handlePlay = (e) => {
    e.stopPropagation();
    // Play first episode of first season by default
    const firstEp = series.seasons?.[0]?.episodes?.[0];
    if (firstEp) {
      navigate(`/watch/${firstEp.id}`);
    } else {
      navigate(`/series/${series.id}`);
    }
  };

  const handleToggleList = (e) => {
    e.stopPropagation();
    toggleMyList(series.id);
    addToast(isAdded ? "Removed from My List" : "Added to My List", "success");
  };

  const handleInfo = (e) => {
    e.stopPropagation();
    navigate(`/series/${series.id}`);
  };

  const totalSeasons = series.seasons?.length || 0;

  return (
    <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : 'flex-shrink-0 w-32 sm:w-36 md:w-40'}`}>
      <div
        onClick={() => navigate(`/series/${series.id}`)}
        className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-card-bg cursor-pointer group transition-all duration-300 border border-white/5 hover:scale-105 hover:z-20 hover:shadow-2xl"
      >
        {/* Background Poster */}
        <img
          src={series.posterUrl || series.poster}
          alt={series.title}
          className="w-full h-full object-cover group-hover:opacity-40 transition-opacity duration-300"
          loading="lazy"
        />

        {/* Badges (Premium or Original only, one at a time) */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {series.isOriginal ? (
            <Badge variant="original" className="text-[8px] px-1 py-0">Original</Badge>
          ) : series.isPremium ? (
            <Badge variant="premium" className="text-[8px] px-1 py-0">Premium</Badge>
          ) : null}
          <Badge variant="default" className="text-[8px] px-1 py-0 bg-black/40 text-white border-transparent">
            {totalSeasons} {totalSeasons === 1 ? 'Season' : 'Seasons'}
          </Badge>
        </div>



        {/* Hover Panel on Desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end">
          <h4 className="text-xs font-bold text-text-primary mb-1 truncate">{series.title}</h4>

          {/* Badges in Hover Panel */}
          {(series.isOriginal || series.isPremium || series.isComingSoon) && (
            <div className="flex gap-1 mb-1.5 flex-wrap">
              {series.isOriginal && <Badge variant="original" className="text-[7px] px-1 py-0">Original</Badge>}
              {series.isPremium && <Badge variant="premium" className="text-[7px] px-1 py-0">Premium</Badge>}
              {series.isComingSoon && <Badge variant="warning" className="text-[7px] px-1 py-0">Coming Soon</Badge>}
            </div>
          )}
          
          <div className="flex flex-wrap items-center gap-1 text-[8px] text-text-secondary font-medium mb-3">
            <span>{series.genre}</span>
            <span>&middot;</span>
            <span>{series.language}</span>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePlay}
              className="w-7 h-7 rounded-full bg-brand-accent hover:bg-brand-accent-hover text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
              title="Watch Series"
            >
              <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
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
              title="Series Details"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
