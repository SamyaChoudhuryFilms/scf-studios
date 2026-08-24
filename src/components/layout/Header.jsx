import React, { useState, useEffect, useRef } from 'react';
import { useRouter, Link } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';
import { Search, Bell, ChevronDown, LogOut, LayoutGrid, Upload, Shield, Heart, History, User, Tv, Film, Menu, X } from 'lucide-react';

export default function Header() {
  const { currentPath, navigate } = useRouter();
  const { activeProfile, profiles, selectProfile, logout } = useAuth();
  const { movies, series } = useContent();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New Release", message: "Calcutta Express is coming soon. Check out the details!", time: "2 hours ago", unread: true },
    { id: 2, title: "Trending Now", message: "The Last Signal is the #1 trending title today.", time: "1 day ago", unread: true },
    { id: 3, title: "System Info", message: "Welcome to SCF STUDIOS Premium Streaming Portal.", time: "3 days ago", unread: false }
  ]);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const notificationRef = useRef(null);

  // Monitor scroll for premium gradient transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Search suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    
    // Filter movies and series
    const matchedMovies = movies
      .filter(m => m.title.toLowerCase().includes(query))
      .map(m => ({ id: m.id, title: m.title, type: 'movie', route: `/movie/${m.id}` }));

    const matchedSeries = series
      .filter(s => s.title.toLowerCase().includes(query))
      .map(s => ({ id: s.id, title: s.title, type: 'series', route: `/series/${s.id}` }));

    setSuggestions([...matchedMovies, ...matchedSeries].slice(0, 5));
  }, [searchQuery, movies, series]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const getAvatarBg = (avatar) => {
    switch (avatar) {
      case 'indigo': return 'bg-brand-accent';
      case 'rose': return 'bg-rose-600';
      case 'emerald': return 'bg-emerald-600';
      case 'amber': return 'bg-amber-600';
      default: return 'bg-slate-700';
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/movies', label: 'Movies' },
    { to: '/series', label: 'Series' },
    { to: '/kids', label: 'Kids' },
    { to: '/coming-soon', label: 'Coming Soon' }
  ];

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-4 md:px-12 py-4 flex items-center justify-between ${
      scrolled ? 'bg-background/90 backdrop-blur-md border-b border-white/5' : 'bg-gradient-to-b from-background/80 to-transparent'
    }`}>
      {/* Brand Wordmark Logo */}
      <div className="flex items-center gap-3 md:gap-8">
        {activeProfile && (
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-text-secondary hover:text-white p-1 transition-colors cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-6.5 h-6.5" />
          </button>
        )}

        <Link to="/" className="text-2xl font-extrabold tracking-wider text-brand-accent hover:opacity-90">
          SCF STUDIOS
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => {
            const isActive = currentPath === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-semibold tracking-wide transition-colors duration-200 ${
                  isActive ? 'text-brand-accent font-bold' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {/* Search Input bar (Desktop only) */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block" ref={searchRef}>
          <div className="flex items-center bg-card-bg/60 border border-white/10 rounded-full px-3 py-1.5 focus-within:border-brand-accent transition-all duration-200 w-44 md:w-64">
            <Search className="w-4 h-4 text-text-muted mr-2" />
            <input
              type="text"
              placeholder="Titles, genres, languages..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="bg-transparent text-xs text-text-primary outline-none w-full"
            />
          </div>

          {/* Quick Suggestions overlay */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute right-0 mt-2 w-72 bg-card-bg border border-white/10 rounded-lg shadow-2xl p-2 z-50">
              <div className="text-[10px] uppercase font-bold text-text-muted px-3 py-1 border-b border-white/5">
                Suggestions
              </div>
              <ul className="mt-1">
                {suggestions.map(item => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        navigate(item.route);
                        setSearchQuery('');
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 text-text-secondary hover:text-text-primary rounded-md flex items-center justify-between"
                    >
                      <span>{item.title}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/10 text-text-muted font-semibold">
                        {item.type}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>

        {/* Notifications Icon & Dropdown (Desktop only) */}
        <div className="relative hidden md:block" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              // Mark all as read when opening
              setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
            }}
            className="relative text-text-secondary hover:text-text-primary p-1 rounded-full transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notifications.some(n => n.unread) && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-accent border-2 border-background rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-card-bg border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 animate-slide-in">
              <div className="p-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-white">Notifications</span>
                <button
                  onClick={() => setNotifications([])}
                  className="text-[9px] text-text-muted hover:text-white uppercase font-bold transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-white/5 select-text">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-text-muted">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-3 hover:bg-white/[0.02] flex items-start gap-2.5 transition-colors">
                      <div className="flex-1 space-y-0.5 text-left">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-white uppercase">{n.title}</span>
                          <span className="text-[8px] text-text-muted">{n.time}</span>
                        </div>
                        <p className="text-[10px] text-text-secondary leading-normal">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown or Sign In */}
        {activeProfile ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-1.5 hover:opacity-90"
            >
              <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold text-white uppercase shadow-md ${getAvatarBg(activeProfile.avatar)}`}>
                {activeProfile.name[0]}
              </div>
              <ChevronDown className="w-4 h-4 text-text-muted" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-card-bg border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50">
                {/* Switch Profiles Section */}
                <div className="p-2 border-b border-white/5">
                  <div className="text-[10px] uppercase font-bold text-text-muted px-3 py-1">
                    Switch Profile
                  </div>
                  {profiles.filter(p => p.id !== activeProfile.id).map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        selectProfile(p.id);
                        setProfileDropdownOpen(false);
                        navigate('/');
                      }}
                      className="w-full text-left px-3 py-1.5 rounded hover:bg-white/5 flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary"
                    >
                      <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-white uppercase text-[10px] ${getAvatarBg(p.avatar)}`}>
                        {p.name[0]}
                      </div>
                      <span className="truncate">{p.name}</span>
                    </button>
                  ))}
                  <Link
                    to="/profiles"
                    className="flex items-center gap-2 px-3 py-2 mt-1 rounded text-xs text-brand-accent hover:bg-brand-accent/10"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Manage Profiles
                  </Link>
                </div>

                {/* Navigation Links */}
                <div className="p-1 border-b border-white/5 text-xs text-text-secondary">

                  <Link
                    to="/my-list"
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 hover:text-text-primary rounded"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <Heart className="w-4 h-4" />
                    My Watchlist
                  </Link>

                  <Link
                    to="/history"
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 hover:text-text-primary rounded"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <History className="w-4 h-4" />
                    Watch History
                  </Link>

                  <Link
                    to="/account"
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 hover:text-text-primary rounded"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Account Settings
                  </Link>
                </div>

                {/* Logout Button */}
                <div className="p-1">
                  <button
                    onClick={() => {
                      logout();
                      setProfileDropdownOpen(false);
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-red-500/10 text-red-400 rounded text-xs text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4.5 py-2 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-lg text-xs transition-all tracking-wider shadow-md shadow-brand-accent/10 hover:scale-105 active:scale-95"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Mobile Hamburger Drawer Menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-[280px] z-55 bg-bg-secondary border-r border-white/5 shadow-2xl transition-transform duration-300 md:hidden flex flex-col ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <span className="text-lg font-extrabold tracking-wider text-brand-accent">
            SCF STUDIOS
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 hover:bg-white/5 rounded-full text-text-secondary hover:text-white transition-colors cursor-pointer"
            title="Close Menu"
          >
            <X className="w-5.5 h-5.5" />
          </button>
        </div>

        <nav className="flex flex-col p-6 space-y-4">
          {[
            { to: '/movies', label: 'Movies' },
            { to: '/series', label: 'Series' },
            { to: '/kids', label: 'Kids' },
            { to: '/coming-soon', label: 'Upcoming' },
          ].map(link => {
            const isActive = currentPath === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-bold tracking-wide py-2 border-b border-white/[0.02] flex items-center transition-colors ${
                  isActive ? 'text-brand-accent font-bold' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
