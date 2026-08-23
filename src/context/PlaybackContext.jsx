import React, { createContext, useContext, useState, useEffect } from 'react';

const PlaybackContext = createContext();

export const usePlayback = () => useContext(PlaybackContext);

export const PlaybackProvider = ({ children }) => {
  const [watchHistory, setWatchHistory] = useState(() => {
    const saved = localStorage.getItem('scfstudios_watch_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [myList, setMyList] = useState(() => {
    const saved = localStorage.getItem('scfstudios_my_list');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('scfstudios_watch_history', JSON.stringify(watchHistory));
  }, [watchHistory]);

  useEffect(() => {
    localStorage.setItem('scfstudios_my_list', JSON.stringify(myList));
  }, [myList]);

  // Save progress
  const saveProgress = (contentId, type, position, duration, metadata = {}) => {
    if (!contentId || !duration) return;
    
    const percentage = Math.round((position / duration) * 100);
    const completed = percentage >= 90; // Over 90% is considered watched and removed from continue watching

    setWatchHistory(prev => {
      // Remove previous entry of this content to move it to the top
      const filtered = prev.filter(item => item.contentId !== contentId);
      
      const newEntry = {
        contentId,
        type,
        position,
        duration,
        progressPercent: percentage,
        completed,
        watchedAt: new Date().toISOString(),
        ...metadata
      };

      return [newEntry, ...filtered];
    });
  };

  const removeFromHistory = (contentId) => {
    setWatchHistory(prev => prev.filter(item => item.contentId !== contentId));
  };

  const clearHistory = () => {
    setWatchHistory([]);
  };

  // Watchlist operations
  const addToMyList = (contentId) => {
    setMyList(prev => {
      if (prev.includes(contentId)) return prev;
      return [...prev, contentId];
    });
  };

  const removeFromMyList = (contentId) => {
    setMyList(prev => prev.filter(id => id !== contentId));
  };

  const toggleMyList = (contentId) => {
    setMyList(prev => {
      if (prev.includes(contentId)) {
        return prev.filter(id => id !== contentId);
      } else {
        return [...prev, contentId];
      }
    });
  };

  const isInMyList = (contentId) => myList.includes(contentId);

  // Derive Continue Watching list
  const continueWatching = watchHistory.filter(item => !item.completed && item.progressPercent > 1);

  return (
    <PlaybackContext.Provider value={{
      watchHistory,
      continueWatching,
      myList,
      saveProgress,
      removeFromHistory,
      clearHistory,
      addToMyList,
      removeFromMyList,
      toggleMyList,
      isInMyList
    }}>
      {children}
    </PlaybackContext.Provider>
  );
};
