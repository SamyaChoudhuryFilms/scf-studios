import React from 'react';
import { RouterProvider, useRouter } from './context/RouterContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ContentProvider, useContent } from './context/ContentContext';
import { PlaybackProvider } from './context/PlaybackContext';
import { ToastProvider } from './context/ToastContext';
import { isFirebaseConfigured } from './lib/firebase';

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
import Notifications from './pages/home/Notifications';
import Downloads from './pages/home/Downloads';

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
  const isProtectedRoute = currentPath.startsWith('/watch') || ['/my-list', '/history', '/profiles', '/account', '/plans', '/notifications', '/downloads'].includes(currentPath);
  
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
    case '/notifications':
      return <Notifications />;
    case '/downloads':
      return <Downloads />;
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
  const { movies, series } = useContent();

  const getPageTitle = () => {
    if (currentPath === '/') return 'Home';
    if (currentPath === '/movies') return 'Movies';
    if (currentPath === '/series') return 'Series';
    if (currentPath === '/kids') return 'Kids';
    if (currentPath === '/coming-soon') return 'Upcoming';
    if (currentPath === '/my-list') return 'Wishlist';
    if (currentPath === '/search') return 'Search';
    if (currentPath === '/notifications') return 'Notifications';
    if (currentPath === '/downloads') return 'Downloads';
    if (currentPath === '/profiles') return 'Profile';
    if (currentPath === '/login') return 'Login';
    if (currentPath === '/register') return 'Create Account';
    if (currentPath === '/forgot-password') return 'ForgotPassword';
    if (currentPath === '/account') return 'Settings';
    if (currentPath === '/plans') return 'Settings';
    if (currentPath === '/history') return 'Settings';

    const movieParams = matchRoute('/movie/:id');
    if (movieParams?.id) {
      const movie = movies?.find(m => m.id === movieParams.id);
      if (movie?.isKids) return 'Kids Details';
      return 'Movie Details';
    }

    const seriesParams = matchRoute('/series/:id');
    if (seriesParams?.id) {
      const show = series?.find(s => s.id === seriesParams.id);
      if (show?.isKids) return 'Kids Details';
      return 'Series Details';
    }

    if (matchRoute('/watch/:id')) return 'Watch';

    if (currentPath.startsWith('/studio-console')) return 'Browse';

    return '';
  };

  const pageTitle = getPageTitle();

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
      
      {/* Dynamic Page Title Subheader (Fixed under the top header) */}
      {!isImmersivePage && pageTitle && (
        <div className="fixed top-[64px] left-0 w-full z-40 bg-background/90 backdrop-blur-md border-b border-white/5 px-4 md:px-12 py-2 flex items-center shadow-md">
          <span className="text-xs md:text-sm font-extrabold text-text-secondary uppercase tracking-wider">
            {pageTitle}
          </span>
        </div>
      )}
      
      <div className="flex-1 w-full pb-20 md:pb-0">
        <AppRoutes />
      </div>

      {!isImmersivePage && <MobileNav />}
      {!isImmersivePage && <Footer />}
    </div>
  );
}

export default function App() {
  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-6 text-center select-text">
        <div className="max-w-md bg-card-bg border border-white/10 p-8 rounded-xl shadow-2xl">
          <img src="/logo-square.jpg" className="w-16 h-16 mx-auto rounded-xl mb-4 border border-white/10" alt="SCF Studios" />
          <h1 className="text-xl font-extrabold text-white mb-2 uppercase tracking-wide">Firebase Config Missing</h1>
          <p className="text-xs text-text-secondary leading-relaxed mb-6">
            The Firebase database connection is not configured. If you deployed to Vercel, please add your Firebase credentials to the Environment Variables settings and redeploy.
          </p>
          <div className="bg-black/40 border border-white/5 rounded-lg p-4 text-left text-[10px] font-mono text-emerald-400 space-y-1 overflow-x-auto">
            <div>VITE_FIREBASE_API_KEY="..."</div>
            <div>VITE_FIREBASE_AUTH_DOMAIN="..."</div>
            <div>VITE_FIREBASE_PROJECT_ID="..."</div>
            <div>VITE_FIREBASE_STORAGE_BUCKET="..."</div>
            <div>VITE_FIREBASE_MESSAGING_SENDER_ID="..."</div>
            <div>VITE_FIREBASE_APP_ID="..."</div>
            <div>VITE_AUTHORIZED_ADMINS="..."</div>
          </div>
        </div>
      </div>
    );
  }

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
