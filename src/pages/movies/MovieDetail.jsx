import React, { useEffect, useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useContent } from '../../context/ContentContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useToast } from '../../context/ToastContext';
import MovieCard from '../../components/cards/MovieCard';
import Badge from '../../components/common/Badge';
import { Play, Plus, Check, Share2, Calendar, Clock, Film } from 'lucide-react';

export default function MovieDetail() {
  const { matchRoute, navigate } = useRouter();
  const { movies } = useContent();
  const { toggleMyList, isInMyList } = usePlayback();
  const { addToast } = useToast();

  const [movie, setMovie] = useState(null);

  // Match /movie/:id route
  useEffect(() => {
    const params = matchRoute('/movie/:id');
    if (params?.id) {
      const found = movies.find(m => m.id === params.id);
      if (found) {
        setMovie(found);
        window.scrollTo(0, 0);
      }
    }
  }, [movies, window.location.pathname]);

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text-secondary text-sm">
        Movie not found.
      </div>
    );
  }

  const isAdded = isInMyList(movie.id);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast("Link copied to clipboard!", "success");
  };

  // Find related movies of the same genre
  const relatedMovies = movies
    .filter(m => m.genre === movie.genre && m.id !== movie.id)
    .slice(0, 4);

  return (
    <div className="pb-16 min-h-screen bg-background text-text-primary select-text">
      {/* Large Cover Image Hero */}
      <section className="relative w-full h-[60vh] md:h-[75vh] flex items-end">
        <div className="absolute inset-0 z-0">
          <img
            src={movie.coverImageUrl || movie.coverImage}
            alt={movie.title}
            className="w-full h-full object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/40 to-transparent"></div>
        </div>

        {/* Content Overlays */}
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-end pb-8">
          
          {/* Movie Poster Card (Desktop) */}
          <div className="hidden md:block w-56 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0">
            <img src={movie.posterUrl || movie.poster} alt={movie.title} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {movie.isOriginal && <Badge variant="original">Original</Badge>}
              {movie.isPremium && <Badge variant="premium">Premium</Badge>}
              <span className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {movie.year}
              </span>
              <span className="text-text-muted">&middot;</span>
              <span className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {movie.duration}
              </span>
              <span className="text-text-muted">&middot;</span>
              <span className="text-[10px] font-bold bg-brand-accent/20 border border-brand-accent/30 text-brand-accent px-1.5 py-0.5 rounded">
                {movie.quality || '4K'}
              </span>
              {movie.audio && (
                <>
                  <span className="text-text-muted">&middot;</span>
                  <span className="text-[10px] font-bold bg-white/10 border border-white/20 text-text-secondary px-1.5 py-0.5 rounded">
                    {movie.audio}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold uppercase mb-4 tracking-tight">
              {movie.title}
            </h1>

            <p className="text-sm md:text-base text-text-secondary font-medium leading-relaxed max-w-3xl mb-6">
              {movie.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {movie.isComingSoon ? (
                <button
                  onClick={() => addToast(`"${movie.title}" is coming soon. Stay tuned!`, "info")}
                  className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-lg transition-transform hover:scale-105 text-sm"
                >
                  <Clock className="w-4 h-4" />
                  Coming Soon
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/watch/${movie.id}`)}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-lg shadow-lg transition-transform hover:scale-105 text-sm"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Watch Now
                </button>
              )}

              <button
                onClick={handleShare}
                className="flex items-center justify-center w-11 h-11 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg text-white transition-all active:scale-95"
                title="Share Movie"
              >
                <Share2 className="w-4.5 h-4.5" />
              </button>

              <button
                onClick={() => {
                  toggleMyList(movie.id);
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

      {/* Main Details Panel (Cast, Crew, More Like This) */}
      <section className="max-w-7xl mx-auto py-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Metadata & Crew */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-card-bg/40 border border-white/5 rounded-xl space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-2">
              <Film className="w-4.5 h-4.5 text-brand-accent" />
              Production Details
            </h3>
            
             <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[10px] text-text-muted uppercase block font-semibold mb-0.5">Director</span>
                <span className="font-bold text-text-secondary">{movie.director || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase block font-semibold mb-0.5">Genre</span>
                <span className="font-bold text-text-secondary">{movie.genre}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase block font-semibold mb-0.5">Language</span>
                <span className="font-bold text-text-secondary">{movie.language}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase block font-semibold mb-0.5">Age Restriction</span>
                <span className="font-bold text-text-secondary border border-white/10 px-1.5 py-0.5 rounded text-xs inline-block mt-0.5">
                  {movie.rating}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase block font-semibold mb-0.5">Video Quality</span>
                <span className="font-bold text-text-secondary">{movie.quality || '4K'}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase block font-semibold mb-0.5">Audio Track</span>
                <span className="font-bold text-text-secondary">{movie.audio || 'Dolby Atmos'}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] text-text-muted uppercase block font-semibold mb-1">Key Cast</span>
              <div className="flex flex-wrap gap-2">
                {movie.cast?.map(actor => (
                  <span key={actor} className="text-xs bg-white/5 border border-white/5 px-2.5 py-1 rounded text-text-secondary font-medium">
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recommendations */}
        <div>
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
            More Like This
          </h3>

          {relatedMovies.length === 0 ? (
            <p className="text-xs text-text-muted">No related content found in this category.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {relatedMovies.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => navigate(`/movie/${rel.id}`)}
                  className="flex gap-3 bg-card-bg/20 border border-white/5 hover:border-white/10 p-2 rounded-lg cursor-pointer transition-all hover:bg-card-bg"
                >
                  <img
                    src={rel.posterUrl || rel.poster}
                    alt={rel.title}
                    className="w-12 aspect-[2/3] object-cover rounded-md flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-xs font-bold text-text-primary truncate mb-0.5">{rel.title}</h4>
                    <span className="text-[9px] text-text-secondary">{rel.year} &middot; {rel.genre}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
