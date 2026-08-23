import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useContent } from '../../context/ContentContext';
import MovieCard from '../../components/cards/MovieCard';
import SeriesCard from '../../components/cards/SeriesCard';
import { Search as SearchIcon, X, Clock, Sparkles } from 'lucide-react';

export default function Search() {
  const { currentPath, navigate } = useRouter();
  const { movies, series } = useContent();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All'); // 'All', 'Movies', 'Series'
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('scfstudios_recent_searches');
    return saved ? JSON.parse(saved) : ["Kolkata", "Genesis", "Delhi", "Darjeeling"];
  });

  // Pull initial query from URL (?q=something)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q) {
      setQuery(q);
    }
  }, [window.location.search]);

  // Sync recent searches to localstorage
  useEffect(() => {
    localStorage.setItem('scfstudios_recent_searches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  const handleClearQuery = () => {
    setQuery('');
    navigate('/search');
  };

  const handleRecentClick = (term) => {
    setQuery(term);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      
      // Save to recents
      setRecentSearches(prev => {
        const filtered = prev.filter(t => t.toLowerCase() !== query.trim().toLowerCase());
        return [query.trim(), ...filtered].slice(0, 6);
      });
    }
  };

  // Perform search matching
  const searchResults = useMemo(() => {
    if (!query.trim()) return { movies: [], series: [] };
    const q = query.toLowerCase();

    return {
      movies: movies.filter(m => m.title.toLowerCase().includes(q) || m.genre.toLowerCase().includes(q)),
      series: series.filter(s => s.title.toLowerCase().includes(q) || s.genre.toLowerCase().includes(q))
    };
  }, [query, movies, series]);

  const hasResults =
    searchResults.movies.length > 0 ||
    searchResults.series.length > 0;

  const categories = ['All', 'Movies', 'Series'];

  const popularSearches = ["The Last Signal", "Sundarban Thrills", "Delhi Heist", "Chasing Light"];

  return (
    <div className="pb-16 min-h-screen bg-background pt-24 px-4 md:px-12 select-text">
      
      {/* Search Header Input bar */}
      <section className="max-w-4xl mx-auto mb-8">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full bg-card-bg border border-white/10 rounded-xl px-4 py-3 focus-within:border-brand-accent transition-all duration-300">
          <SearchIcon className="w-5 h-5 text-text-muted mr-3" />
          <input
            type="text"
            placeholder="Search movies, web series, genres..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent text-sm text-text-primary outline-none w-full placeholder-text-muted"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={handleClearQuery}
              className="text-text-muted hover:text-white transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          )}
        </form>
      </section>

      {/* Empty State: Recent & Popular Searches */}
      {!query.trim() && (
        <section className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-accent" />
                  Recent Searches
                </h3>
                <button
                  onClick={handleClearRecent}
                  className="text-[10px] text-text-muted hover:text-white transition-colors font-bold uppercase"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {recentSearches.map(term => (
                  <button
                    key={term}
                    onClick={() => handleRecentClick(term)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-card-bg/20 hover:bg-card-bg border border-white/5 text-xs text-text-secondary hover:text-brand-accent transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular searches */}
          <div>
            <div className="border-b border-white/5 pb-2.5 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-accent" />
                Popular Searches
              </h3>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {popularSearches.map(term => (
                <button
                  key={term}
                  onClick={() => handleRecentClick(term)}
                  className="px-3 py-1.5 rounded-full bg-card-bg/40 border border-white/5 text-xs text-text-secondary hover:text-white hover:border-brand-accent transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category filters */}
      {query.trim() && (
        <section className="max-w-7xl mx-auto flex gap-2 overflow-x-auto no-scrollbar border-b border-white/5 pb-4 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-brand-accent text-white shadow-lg'
                  : 'bg-card-bg/50 border border-white/5 text-text-secondary hover:text-white hover:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </section>
      )}

      {/* Results grid */}
      {query.trim() && (
        <section className="max-w-7xl mx-auto">
          {!hasResults ? (
            <div className="py-24 text-center max-w-md mx-auto">
              <h3 className="text-base font-bold text-white mb-1.5">No results found for "{query}"</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Check spelling, look up different keywords, or explore other categories.
              </p>
            </div>
          ) : (
             <div className="space-y-12">
               {/* Movies results */}
               {(activeCategory === 'All' || activeCategory === 'Movies') && searchResults.movies.length > 0 && (
                 <div>
                   <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-4 border-b border-white/5 pb-1">
                     Movies ({searchResults.movies.length})
                   </h3>
                   <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-5">
                     {searchResults.movies.map(movie => <MovieCard key={movie.id} movie={movie} fullWidth />)}
                   </div>
                 </div>
               )}

               {/* Series results */}
               {(activeCategory === 'All' || activeCategory === 'Series') && searchResults.series.length > 0 && (
                 <div>
                   <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-4 border-b border-white/5 pb-1">
                     Web Series ({searchResults.series.length})
                   </h3>
                   <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-5">
                     {searchResults.series.map(s => <SeriesCard key={s.id} series={s} fullWidth />)}
                   </div>
                 </div>
               )}
             </div>
          )}
        </section>
      )}

    </div>
  );
}
