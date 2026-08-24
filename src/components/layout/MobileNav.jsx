import React, { useState, useEffect, useRef } from 'react';
import { useRouter, Link } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { Home, Heart, Search, Bell, Download } from 'lucide-react';

export default function MobileNav() {
  const { currentPath } = useRouter();
  const { activeProfile } = useAuth();
  
  const [scrollingDown, setScrollingDown] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Check scroll direction with a 10px threshold
      if (Math.abs(currentScrollY - lastScrollY.current) > 10) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
          setScrollingDown(true);
        } else {
          setScrollingDown(false);
        }
        lastScrollY.current = currentScrollY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      className={`md:hidden fixed bottom-1 left-1/2 -translate-x-1/2 z-40 bg-black/20 backdrop-blur-[16px] border border-white/10 shadow-2xl rounded-full transition-all duration-300 flex items-center justify-between ${
        scrollingDown 
          ? 'py-2 px-3.5 w-[80%] max-w-[280px]' 
          : 'py-3 px-5 w-[90%] max-w-[350px]'
      }`}
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
