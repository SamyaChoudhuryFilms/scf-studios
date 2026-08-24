import React, { useState } from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { useContent } from '../../context/ContentContext';
import MovieCard from '../../components/cards/MovieCard';
import SeriesCard from '../../components/cards/SeriesCard';
import { Heart, Film, Tv } from 'lucide-react';

export default function MyList() {
  const { myList } = usePlayback();
  const { movies, series } = useContent();

  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Movies', 'Series'

  // Resolve content items that are saved in myList
  const resolvedList = myList.map(id => {
    // 1. Movie
    let item = movies.find(m => m.id === id);
    if (item) return { ...item, type: 'movie' };
    
    // 2. Series
    item = series.find(s => s.id === id);
    if (item) return { ...item, type: 'series' };

    return null;
  }).filter(Boolean);

  // Filter list based on active tab
  const filteredList = resolvedList.filter(item => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Movies') return item.type === 'movie';
    if (activeTab === 'Series') return item.type === 'series';
    return false;
  });

  const tabOptions = [
    { id: 'All', name: 'All Saved', icon: Heart },
    { id: 'Movies', name: 'Movies', icon: Film },
    { id: 'Series', name: 'Web Series', icon: Tv }
  ];

  return (
    <div className="pb-16 min-h-screen bg-background pt-24 select-text">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-extrabold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
          <Heart className="w-6 h-6 text-brand-accent fill-brand-accent/20" />
          My List
        </h1>

        {/* List filter tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-white/5 pb-4 mb-8">
          {tabOptions.map(tab => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                  isTabActive
                    ? 'bg-brand-accent text-white shadow-lg'
                    : 'bg-card-bg/50 border border-white/5 text-text-secondary hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Content lists */}
        {filteredList.length === 0 ? (
          <div className="py-24 text-center max-w-sm mx-auto">
            <Heart className="w-12 h-12 mx-auto mb-4 text-text-muted opacity-40" />
            <h3 className="text-base font-bold text-white mb-1">Your Watchlist is empty</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Explore the movies and web series pages, hover over content cards and click the '+' icon to save them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-5">
            {filteredList.map(item => (
              item.type === 'movie' ? (
                <MovieCard key={item.id} movie={item} fullWidth />
              ) : (
                <SeriesCard key={item.id} series={item} fullWidth />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
