import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useContent } from '../../context/ContentContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useToast } from '../../context/ToastContext';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, Minimize, Settings, ArrowLeft, SkipForward, SkipBack, PictureInPicture } from 'lucide-react';
import { getMedia } from '../../utils/db';

export default function Watch() {
  const { matchRoute, navigate } = useRouter();
  const { movies, series } = useContent();
  const { saveProgress, watchHistory } = usePlayback();
  const { addToast } = useToast();

  const [contentId, setContentId] = useState(null);
  const [mediaItem, setMediaItem] = useState(null);
  const [mediaType, setMediaType] = useState(''); // 'movie', 'episode', 'video', 'short'
  const [videoSrc, setVideoSrc] = useState('');

  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Player controls states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState('1080p');
  const [subtitle, setSubtitle] = useState('Off');
  const [audioLang, setAudioLang] = useState('Default');
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showIntroButton, setShowIntroButton] = useState(false);

  // Match /watch/:id route
  useEffect(() => {
    const params = matchRoute('/watch/:id');
    if (params?.id) {
      setContentId(params.id);
    }
  }, [window.location.pathname]);

  // Lookup details of content
  useEffect(() => {
    if (!contentId) return;

    // 1. Movie
    let found = movies.find(m => m.id === contentId);
    if (found) {
      setMediaItem(found);
      setMediaType('movie');
      return;
    }

    // 2. Episode
    for (const s of series) {
      for (const season of s.seasons) {
        found = season.episodes.find(e => e.id === contentId);
        if (found) {
          // Attaching seriesId and seriesTitle for episode navigation
          setMediaItem({ ...found, seriesId: s.id, seriesTitle: s.title, seasonNum: season.seasonNumber });
          setMediaType('episode');
          return;
        }
      }
    }
  }, [contentId, movies, series]);

  // Resolve IndexedDB video URLs to Blob URLs dynamically
  useEffect(() => {
    if (!mediaItem) return;

    let active = true;
    let objectUrl = '';

    const resolveVideo = async () => {
      if (mediaItem.video && mediaItem.video.startsWith('indexeddb://')) {
        const key = mediaItem.video.replace('indexeddb://', '');
        const blob = await getMedia(key);
        if (blob && active) {
          objectUrl = URL.createObjectURL(blob);
          setVideoSrc(objectUrl);
        } else if (active) {
          addToast("Could not find video file in browser storage.", "error");
        }
      } else {
        setVideoSrc(mediaItem.video || '');
      }
    };

    resolveVideo();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [mediaItem]);

  // Resume progress from history on mount
  useEffect(() => {
    if (!videoRef.current || !mediaItem) return;

    const savedProgress = watchHistory.find(h => h.contentId === mediaItem.id);
    if (savedProgress && savedProgress.position > 2) {
      videoRef.current.currentTime = savedProgress.position;
      addToast(`Resumed from ${formatTime(savedProgress.position)}`, "info");
    }
  }, [mediaItem]);

  // Save progress periodically & on unmount
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && mediaItem && isPlaying) {
        const pos = videoRef.current.currentTime;
        const dur = videoRef.current.duration || 1;
        saveProgress(mediaItem.id, mediaType, pos, dur, {
          title: mediaItem.title
        });
      }
    }, 4000);

    return () => {
      clearInterval(interval);
      if (videoRef.current && mediaItem) {
        const pos = videoRef.current.currentTime;
        const dur = videoRef.current.duration || 1;
        saveProgress(mediaItem.id, mediaType, pos, dur, {
          title: mediaItem.title
        });
      }
    };
  }, [mediaItem, isPlaying, mediaType]);

  // Controls visibility timeout on hover
  useEffect(() => {
    let timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying && !showSettingsDropdown) {
          setShowControls(false);
        }
      }, 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      clearTimeout(timeout);
    };
  }, [isPlaying, showSettingsDropdown]);

  // Keyboard Shortcuts Controller
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      if (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT') {
        return; // Avoid typing conflict
      }

      if (!videoRef.current) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekDelta(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekDelta(5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(-0.1);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMuted, volume]);

  if (!mediaItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text-secondary text-sm">
        Video stream loading or unavailable.
      </div>
    );
  }

  // Next / Previous episode calculations for Web Series
  const getEpisodeNeighbours = () => {
    if (mediaType !== 'episode') return { prev: null, next: null };
    const currentSeries = series.find(s => s.id === mediaItem.seriesId);
    if (!currentSeries) return { prev: null, next: null };

    const allEpisodes = currentSeries.seasons.flatMap(s => s.episodes);
    const idx = allEpisodes.findIndex(ep => ep.id === mediaItem.id);

    return {
      prev: idx > 0 ? allEpisodes[idx - 1] : null,
      next: idx < allEpisodes.length - 1 ? allEpisodes[idx + 1] : null
    };
  };

  const { prev: prevEp, next: nextEp } = getEpisodeNeighbours();

  // Show Skip Intro Button during 5s to 25s
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    
    // Show Skip Intro button between 5s and 25s
    if (time >= 5 && time <= 25) {
      setShowIntroButton(true);
    } else {
      setShowIntroButton(false);
    }
  };

  const skipIntro = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 26;
      setShowIntroButton(false);
      addToast("Skipped intro", "success");
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    // Autoplay next episode if available
    if (nextEp) {
      addToast("Playing next episode in 3 seconds...", "info");
      setTimeout(() => {
        navigate(`/watch/${nextEp.id}`);
      }, 3000);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const seekDelta = (seconds) => {
    if (videoRef.current) {
      let nextTime = videoRef.current.currentTime + seconds;
      if (nextTime < 0) nextTime = 0;
      if (nextTime > duration) nextTime = duration;
      videoRef.current.currentTime = nextTime;
    }
  };

  const handleScrubberChange = (e) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMute = !isMuted;
      videoRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
  };

  const handleVolumeSlider = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const changeVolume = (delta) => {
    let newVolume = volume + delta;
    if (newVolume < 0) newVolume = 0;
    if (newVolume > 1) newVolume = 1;
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => {
        console.error("Error enabling fullscreen", err);
      });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      addToast("Picture-in-Picture not supported on this browser.", "error");
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    addToast(`Speed: ${speed}x`, "info");
  };

  const handleBack = () => {
    if (mediaType === 'episode') {
      navigate(`/series/${mediaItem.seriesId}`);
    } else if (mediaType === 'movie') {
      navigate(`/movie/${mediaItem.id}`);
    } else {
      navigate('/');
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    const pad = (num) => num.toString().padStart(2, '0');
    
    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full bg-black z-50 overflow-hidden flex items-center justify-center select-none"
    >
      {/* HTML5 Native Video Tag */}
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleVideoEnded}
        playsInline
      />

      {/* Top Header Overlay */}
      {showControls && (
        <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-black/85 to-transparent px-6 py-5 flex items-center justify-between z-10">
          <button
            onClick={handleBack}
            className="flex items-center gap-3 text-text-secondary hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <div className="text-left">
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block">
                Watch &bull; {mediaType === 'episode' ? mediaItem.seriesTitle : 'Movie'}
              </span>
              <h2 className="text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
                {mediaType === 'episode' ? `S${mediaItem.seasonNum}:E${mediaItem.episodeNumber} - ${mediaItem.title}` : mediaItem.title}
              </h2>
            </div>
          </button>
        </div>
      )}

      {/* Skip Intro Overlay Trigger */}
      {showIntroButton && (
        <button
          onClick={skipIntro}
          className="absolute bottom-28 right-6 z-10 px-6 py-2.5 bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-bold rounded-lg border border-brand-accent/40 shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
        >
          <SkipForward className="w-4 h-4 fill-white" />
          Skip Intro
        </button>
      )}

      {/* Custom Control Bar Overlay */}
      {showControls && (
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/85 to-transparent p-6 z-10 flex flex-col gap-4">
          
          {/* Custom Timeline Scrubber */}
          <div className="flex items-center gap-4 w-full">
            <span className="text-xs font-semibold text-text-secondary min-w-[45px] text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleScrubberChange}
              className="flex-1 h-1.5 rounded-lg appearance-none bg-white/20 cursor-pointer outline-none transition-all focus:h-2"
            />
            <span className="text-xs font-semibold text-text-secondary min-w-[45px] text-left">
              {formatTime(duration)}
            </span>
          </div>

          {/* Action Row Controls */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              {/* Back / Next Episode for Series */}
              {mediaType === 'episode' && prevEp && (
                <button
                  onClick={() => navigate(`/watch/${prevEp.id}`)}
                  className="text-text-secondary hover:text-white transition-colors"
                  title="Previous Episode"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
              )}

              {/* Play / Pause Toggle */}
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
              </button>

              {mediaType === 'episode' && nextEp && (
                <button
                  onClick={() => navigate(`/watch/${nextEp.id}`)}
                  className="text-text-secondary hover:text-white transition-colors"
                  title="Next Episode"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              )}

              {/* Mute and Volume Bar */}
              <div className="flex items-center gap-2 group/volume">
                <button onClick={toggleMute} className="text-text-secondary hover:text-white transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeSlider}
                  className="w-0 group-hover/volume:w-20 transition-all duration-300 h-1 rounded bg-white/30 cursor-pointer appearance-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 relative">
              {/* Picture in Picture */}
              <button
                onClick={togglePiP}
                className="text-text-secondary hover:text-white transition-colors"
                title="Picture-in-Picture"
              >
                <PictureInPicture className="w-5 h-5" />
              </button>

              {/* Settings Trigger */}
              <button
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className={`text-text-secondary hover:text-white transition-colors ${showSettingsDropdown ? 'text-brand-accent' : ''}`}
                title="Controls Panel"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Settings Dropdown Context Overlay */}
              {showSettingsDropdown && (
                <div className="absolute right-0 bottom-12 w-64 bg-card-bg border border-white/10 rounded-lg shadow-2xl p-3 z-50 space-y-3.5 text-xs text-text-secondary">
                  {/* Playback speed */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-text-muted uppercase font-bold">Speed</span>
                    <div className="flex gap-1.5 font-bold mt-1">
                      {[0.75, 1, 1.25, 1.5, 2].map(speed => (
                        <button
                          key={speed}
                          onClick={() => handleSpeedChange(speed)}
                          className={`px-1.5 py-0.5 rounded border text-[10px] ${
                            playbackSpeed === speed ? 'bg-brand-accent text-white border-transparent' : 'border-white/10 hover:bg-white/5'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality selector */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-text-muted uppercase font-bold">Quality</span>
                    <div className="flex gap-1.5 font-bold mt-1">
                      {['480p', '720p', '1080p', '4K'].map(q => (
                        <button
                          key={q}
                          onClick={() => {
                            setQuality(q);
                            addToast(`Quality switched to ${q}`, "success");
                          }}
                          className={`px-1.5 py-0.5 rounded border text-[10px] ${
                            quality === q ? 'bg-brand-accent text-white border-transparent' : 'border-white/10 hover:bg-white/5'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subtitles selector */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-text-muted uppercase font-bold">Subtitles</span>
                    <div className="flex gap-1.5 font-bold mt-1">
                      {['Off', 'English', 'Bengali'].map(sub => (
                        <button
                          key={sub}
                          onClick={() => {
                            setSubtitle(sub);
                            addToast(`Subtitles: ${sub}`, "info");
                          }}
                          className={`px-1.5 py-0.5 rounded border text-[10px] ${
                            subtitle === sub ? 'bg-brand-accent text-white border-transparent' : 'border-white/10 hover:bg-white/5'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audio language */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-text-muted uppercase font-bold">Audio Language</span>
                    <select
                      value={audioLang}
                      onChange={(e) => {
                        setAudioLang(e.target.value);
                        addToast(`Audio Language: ${e.target.value}`, "info");
                      }}
                      className="bg-background border border-white/10 text-white rounded p-1 text-[10px] outline-none"
                    >
                      <option value="Default">Default</option>
                      <option value="English">English</option>
                      <option value="Bengali">Bengali</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Fullscreen Toggle */}
              <button onClick={toggleFullscreen} className="text-text-secondary hover:text-white transition-colors">
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
