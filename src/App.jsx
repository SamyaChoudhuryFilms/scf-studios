import React from 'react';
import { RouterProvider, useRouter } from './context/RouterContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import { PlaybackProvider } from './context/PlaybackContext';
import { ToastProvider } from './context/ToastContext';

// Layout Elements
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/home/Home';
import Movies from './pages/movies/Movies';
import MovieDetail from './pages/movies/MovieDetail';
import Series from './pages/series/Series';
import SeriesDetail from './pages/series/SeriesDetail';
import Watch from './pages/watch/Watch';
import Search from './pages/search/Search';
import StudioConsole from './pages/admin/StudioConsole';
import MyList from './pages/home/MyList';
import WatchHistory from './pages/home/WatchHistory';
import Profiles from './pages/auth/Profiles';
import Account from './pages/account/Account';
import Plans from './pages/account/Plans';
import Kids from './pages/home/Kids';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ComingSoon from './pages/coming-soon/ComingSoon';

// Fallback 404 Component
function NotFound() {
  const { navigate } = useRouter();
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6 select-text text-xs text-text-secondary">
      <h1 className="text-4xl font-extrabold text-white mb-2 uppercase tracking-wide">404 — Page Not Found</h1>
      <p className="max-w-xs leading-relaxed mb-6">
        The cinematic coordinates you requested do not exist in this entertainment universe.
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-5 py-2.5 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-lg transition-transform hover:scale-105 active:scale-95"
      >
        Return to Home
      </button>
    </div>
  );
}

// Router Switcher
function AppRoutes() {
  const { currentPath, matchRoute } = useRouter();
  const { currentUser, activeProfile } = useAuth();

  // Authentication locks: Only protect watch and account routes, allowing guest browsing on home, movies, series, search, etc.
  const isAuthRoute = ['/login', '/register', '/forgot-password'].includes(currentPath);
  const isAdminRoute = currentPath.startsWith('/studio-console');
  const isProtectedRoute = currentPath.startsWith('/watch') || ['/my-list', '/history', '/profiles', '/account', '/plans'].includes(currentPath);
  
  if (!currentUser && isProtectedRoute && !isAuthRoute && !isAdminRoute) {
    // Redirect standard guest users trying to access video playback or accounts to Login
    return <Login />;
  }

  // Profile locks: User must select a profile first (except auth, profiles, and admin routes)
  if (currentUser && !activeProfile && currentPath !== '/profiles' && !isAuthRoute && !isAdminRoute) {
    return <Profiles />;
  }

  // Exact matching routes
  switch (currentPath) {
    case '/':
      return <Home />;
    case '/movies':
      return <Movies />;
    case '/series':
      return <Series />;
    case '/search':
      return <Search />;
    case '/my-list':
      return <MyList />;
    case '/history':
      return <WatchHistory />;
    case '/profiles':
      return <Profiles />;
    case '/account':
      return <Account />;
    case '/plans':
      return <Plans />;
    case '/kids':
      return <Kids />;
    case '/coming-soon':
      return <ComingSoon />;
    case '/login':
      return <Login />;
    case '/register':
      return <Register />;
    case '/forgot-password':
      return <ForgotPassword />;
    default:
      break;
  }

  // Dynamic route matches
  if (matchRoute('/movie/:id')) {
    return <MovieDetail />;
  }
  if (matchRoute('/series/:id')) {
    return <SeriesDetail />;
  }
  if (matchRoute('/watch/:id')) {
    return <Watch />;
  }


  if (currentPath.startsWith('/studio-console')) {
    return <StudioConsole />;
  }

  return <NotFound />;
}

// Global App Scaffolder
function AppContent() {
  const { currentPath, matchRoute } = useRouter();

  // Hide global layouts on full immersion pages
  const isImmersivePage =
    currentPath === '/login' ||
    currentPath === '/register' ||
    currentPath === '/forgot-password' ||
    currentPath === '/profiles' ||
    currentPath.startsWith('/studio-console') ||
    !!matchRoute('/watch/:id');

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary selection:bg-brand-accent/30 selection:text-white">
      {!isImmersivePage && <Header />}
      
      <div className="flex-1 w-full">
        <AppRoutes />
      </div>

      {!isImmersivePage && <MobileNav />}
      {!isImmersivePage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <ContentProvider>
          <PlaybackProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </PlaybackProvider>
        </ContentProvider>
      </AuthProvider>
    </RouterProvider>
  );
}
