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
      className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-bg-secondary/95 backdrop-blur-lg border-t border-white/5 py-2.5 px-6 flex items-center justify-between shadow-lg"
      style={{ paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))' }}
    >
      {navItems.map(item => {
        const isActive = currentPath === item.to || (item.to !== '/' && currentPath.startsWith(item.to));
        const Icon = item.icon;

        return (
          <Link
            key={item.to}
            to={item.to}
            className="flex flex-col items-center gap-1 text-[10px] tracking-wide w-16"
          >
            <Icon className={`w-5 h-5 transition-all duration-200 ${
              isActive ? 'text-brand-accent scale-110' : 'text-text-secondary hover:text-text-primary'
            }`} />
            <span className={`text-[9px] font-semibold transition-colors duration-200 ${
              isActive ? 'text-brand-accent font-bold' : 'text-text-muted'
            }`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
