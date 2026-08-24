import React from 'react';
import { useRouter, Link } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { Home, Heart, Search, Bell, Download } from 'lucide-react';

export default function MobileNav() {
  const { currentPath } = useRouter();
  const { activeProfile } = useAuth();

  if (!activeProfile) return null;

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/my-list', label: 'Wishlist', icon: Heart },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/notifications', label: 'Notification', icon: Bell },
    { to: '/downloads', label: 'Download', icon: Download }
  ];

  return (
    <div 
      className="md:hidden fixed bottom-0.5 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] z-40 bg-black/60 backdrop-blur-xl border border-white/10 py-3.5 px-6 flex items-center justify-between shadow-2xl rounded-full"
    >
      {navItems.map(item => {
        const isActive = currentPath === item.to || (item.to !== '/' && currentPath.startsWith(item.to));
        const Icon = item.icon;

        return (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center justify-center p-2 rounded-full transition-transform active:scale-90"
            aria-label={item.label}
            title={item.label}
          >
            <Icon 
              className={`w-5.5 h-5.5 transition-all duration-200 ${
                isActive ? 'text-brand-accent scale-110 drop-shadow-[0_0_8px_rgba(229,9,20,0.4)]' : 'text-text-secondary hover:text-text-primary'
              }`}
              fill={isActive ? 'currentColor' : 'none'}
            />
          </Link>
        );
      })}
    </div>
  );
}
