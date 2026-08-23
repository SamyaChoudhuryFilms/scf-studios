import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

const ContentContext = createContext();

export const useContent = () => useContext(ContentContext);

const DEFAULT_SECTIONS = [
  { id: "sec-trending", title: "Trending Now", type: "trending", visible: true },
  { id: "sec-continue", title: "Continue Watching", type: "continue_watching", visible: true },
  { id: "sec-originals", title: "SCF Studios Originals", type: "originals", visible: true },
  { id: "sec-bestpicks", title: "Best Picks", type: "best-pick", visible: true },
  { id: "sec-mustwatch", title: "Must Watch", type: "must-watch", visible: true },
  { id: "sec-shortfilms", title: "Short Films", type: "short-films", visible: true },
  { id: "sec-movies", title: "Popular Movies", type: "movies", visible: true },
  { id: "sec-series", title: "Trending Series", type: "series", visible: true },
  { id: "sec-kids", title: "Kids Corner", type: "kids", visible: true },
  { id: "sec-bengali", title: "Popular in Bengali", type: "bengali", visible: true }
];

export const ContentProvider = ({ children }) => {
  const [movies, setMovies] = useState(() => {
    const saved = localStorage.getItem('scfstudios_movies');
    return saved ? JSON.parse(saved) : [];
  });

  const [series, setSeries] = useState(() => {
    const saved = localStorage.getItem('scfstudios_series');
    return saved ? JSON.parse(saved) : [];
  });

  const [homepageSections, setHomepageSections] = useState(() => {
    const saved = localStorage.getItem('scfstudios_homepage_sections');
    return saved ? JSON.parse(saved) : DEFAULT_SECTIONS;
  });

  const [comments, setComments] = useState(() => {
    const saved = localStorage.getItem('scfstudios_comments');
    return saved ? JSON.parse(saved) : {};
  });

  // Real-time Firestore listeners
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "movies"), (snapshot) => {
      const dbMovies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMovies(dbMovies);
      localStorage.setItem('scfstudios_movies', JSON.stringify(dbMovies));
    }, (err) => {
      console.error("Firestore movies load error:", err);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "series"), (snapshot) => {
      const dbSeries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSeries(dbSeries);
      localStorage.setItem('scfstudios_series', JSON.stringify(dbSeries));
    }, (err) => {
      console.error("Firestore series load error:", err);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('scfstudios_homepage_sections', JSON.stringify(homepageSections));
  }, [homepageSections]);

  useEffect(() => {
    localStorage.setItem('scfstudios_comments', JSON.stringify(comments));
  }, [comments]);

  // Movie management (Admin)
  const addMovie = async (movieData) => {
    const docId = movieData.id || `m-${Date.now()}`;
    const movieRef = doc(db, "movies", docId);
    const data = {
      title: movieData.title,
      description: movieData.description,
      posterUrl: movieData.posterUrl || movieData.poster || '',
      coverImageUrl: movieData.coverImageUrl || movieData.coverImage || '',
      youtubeId: movieData.youtubeId || '',
      language: movieData.language,
      genre: movieData.genre,
      duration: movieData.duration,
      releaseDate: movieData.releaseDate || '',
      featured: !!movieData.featured,
      published: !!movieData.published,
      isOriginal: !!movieData.isOriginal,
      isPremium: !!movieData.isPremium,
      isKids: !!movieData.isKids,
      isComingSoon: !!movieData.isComingSoon,
      year: parseInt(movieData.year) || new Date().getFullYear(),
      rating: movieData.rating || '13+',
      quality: movieData.quality || '4K',
      audio: movieData.audio || 'Stereo',
      director: movieData.director || '',
      cast: Array.isArray(movieData.cast) ? movieData.cast : (movieData.cast ? movieData.cast.split(',').map(c => c.trim()) : []),
      video: movieData.video || '',
      trailer: movieData.trailer || '',
      customCategory: movieData.customCategory || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(movieRef, data);
    return { id: docId, ...data };
  };

  const updateMovie = async (movieId, updates) => {
    const movieRef = doc(db, "movies", movieId);
    const data = { ...updates, updatedAt: new Date().toISOString() };
    if (updates.poster) data.posterUrl = updates.poster;
    if (updates.coverImage) data.coverImageUrl = updates.coverImage;
    if (updates.cast && !Array.isArray(updates.cast)) {
      data.cast = updates.cast.split(',').map(c => c.trim());
    }
    await setDoc(movieRef, data, { merge: true });
  };

  const deleteMovie = async (movieId) => {
    const movieRef = doc(db, "movies", movieId);
    await deleteDoc(movieRef);
  };

  // Series management (Admin)
  const addSeries = async (seriesData) => {
    const docId = seriesData.id || `s-${Date.now()}`;
    const seriesRef = doc(db, "series", docId);
    const data = {
      title: seriesData.title,
      description: seriesData.description,
      posterUrl: seriesData.posterUrl || seriesData.poster || '',
      coverImageUrl: seriesData.coverImageUrl || seriesData.coverImage || '',
      genre: seriesData.genre,
      language: seriesData.language,
      isOriginal: !!seriesData.isOriginal,
      isPremium: !!seriesData.isPremium,
      isKids: !!seriesData.isKids,
      isComingSoon: !!seriesData.isComingSoon,
      year: parseInt(seriesData.year) || new Date().getFullYear(),
      rating: seriesData.rating || '13+',
      duration: seriesData.duration || '1 Season',
      youtubeId: seriesData.youtubeId || '',
      releaseDate: seriesData.releaseDate || '',
      featured: !!seriesData.featured,
      published: !!seriesData.published,
      quality: seriesData.quality || '4K',
      audio: seriesData.audio || 'Stereo',
      director: seriesData.director || '',
      cast: Array.isArray(seriesData.cast) ? seriesData.cast : (seriesData.cast ? seriesData.cast.split(',').map(c => c.trim()) : []),
      video: seriesData.video || '',
      trailer: seriesData.trailer || '',
      seasons: seriesData.seasons || [{ seasonNumber: 1, name: "Season 1", episodes: [] }],
      customCategory: seriesData.customCategory || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(seriesRef, data);
    return { id: docId, ...data };
  };

  const updateSeries = async (seriesId, updates) => {
    const seriesRef = doc(db, "series", seriesId);
    const data = { ...updates, updatedAt: new Date().toISOString() };
    if (updates.poster) data.posterUrl = updates.poster;
    if (updates.coverImage) data.coverImageUrl = updates.coverImage;
    if (updates.cast && !Array.isArray(updates.cast)) {
      data.cast = updates.cast.split(',').map(c => c.trim());
    }
    await setDoc(seriesRef, data, { merge: true });
  };

  const deleteSeries = async (seriesId) => {
    const seriesRef = doc(db, "series", seriesId);
    await deleteDoc(seriesRef);
  };

  const addEpisode = async (seriesId, seasonNumber, episodeData) => {
    const target = series.find(s => s.id === seriesId);
    if (!target) return;

    const updatedSeasons = target.seasons.map(season => {
      if (season.seasonNumber === seasonNumber) {
        const nextEpNum = season.episodes.length + 1;
        const newEp = {
          id: `ep-${Date.now()}`,
          episodeNumber: nextEpNum,
          ...episodeData
        };
        return {
          ...season,
          episodes: [...season.episodes, newEp]
        };
      }
      return season;
    });

    const seriesRef = doc(db, "series", seriesId);
    await setDoc(seriesRef, { seasons: updatedSeasons, updatedAt: new Date().toISOString() }, { merge: true });
  };

  const deleteEpisode = async (seriesId, seasonNumber, episodeId) => {
    const target = series.find(s => s.id === seriesId);
    if (!target) return;

    const updatedSeasons = target.seasons.map(season => {
      if (season.seasonNumber === seasonNumber) {
        return {
          ...season,
          episodes: season.episodes.filter(ep => ep.id !== episodeId)
        };
      }
      return season;
    });

    const seriesRef = doc(db, "series", seriesId);
    await setDoc(seriesRef, { seasons: updatedSeasons, updatedAt: new Date().toISOString() }, { merge: true });
  };

  // Comment features
  const addComment = (contentId, text, activeProfile) => {
    const newComment = {
      id: `comm-${Date.now()}`,
      profileName: activeProfile?.name || "Anonymous",
      avatar: activeProfile?.avatar || "indigo",
      text,
      likes: 0,
      isPinned: false,
      publishedAt: new Date().toISOString()
    };
    setComments(prev => {
      const list = prev[contentId] || [];
      return { ...prev, [contentId]: [newComment, ...list] };
    });
  };

  const pinComment = (contentId, commentId) => {
    setComments(prev => {
      const list = prev[contentId] || [];
      const updated = list.map(c => {
        if (c.id === commentId) return { ...c, isPinned: !c.isPinned };
        if (c.isPinned) return { ...c, isPinned: false };
        return c;
      });
      return { ...prev, [contentId]: updated };
    });
  };

  const deleteComment = (contentId, commentId) => {
    setComments(prev => {
      const list = prev[contentId] || [];
      return { ...prev, [contentId]: list.filter(c => c.id !== commentId) };
    });
  };

  return (
    <ContentContext.Provider value={{
      movies,
      series,
      homepageSections,
      comments,
      setHomepageSections,
      addMovie,
      updateMovie,
      deleteMovie,
      addSeries,
      updateSeries,
      deleteSeries,
      addEpisode,
      deleteEpisode,
      addComment,
      pinComment,
      deleteComment
    }}>
      {children}
    </ContentContext.Provider>
  );
};
