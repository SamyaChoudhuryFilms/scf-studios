import React from 'react';
import { useRouter, Link } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { Home, Film, Tv, Users, User } from 'lucide-react';

export default function MobileNav() {
  const { currentPath } = useRouter();
  const { activeProfile } = useAuth();

  if (!activeProfile) return null;

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/movies', label: 'Movies', icon: Film },
    { to: '/series', label: 'Series', icon: Tv },
    { to: '/profiles', label: 'Profile', icon: User }
  ];

  const getAvatarBg = (avatar) => {
    switch (avatar) {
      case 'indigo': return 'bg-brand-accent';
      case 'rose': return 'bg-rose-600';
      case 'emerald': return 'bg-emerald-600';
      case 'amber': return 'bg-amber-600';
      default: return 'bg-slate-700';
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-bg-secondary/90 backdrop-blur-lg border-t border-white/5 py-2 px-6 flex items-center justify-between">
      {navItems.map(item => {
        const isActive = currentPath === item.to || (item.to !== '/' && currentPath.startsWith(item.to));
        const Icon = item.icon;

        return (
          <Link
            key={item.to}
            to={item.to}
            className="flex flex-col items-center gap-1 text-[10px] tracking-wide"
          >
            {item.label === 'Profile' ? (
              <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-white uppercase text-[9px] border transition-all duration-200 ${
                isActive ? 'border-brand-accent scale-110' : 'border-transparent'
              } ${getAvatarBg(activeProfile.avatar)}`}>
                {activeProfile.name[0]}
              </div>
            ) : (
              <Icon className={`w-5.5 h-5.5 transition-all duration-200 ${
                isActive ? 'text-brand-accent scale-110' : 'text-text-secondary'
              }`} />
            )}
            <span className={`text-[9px] font-semibold transition-colors duration-200 ${
              isActive ? 'text-brand-accent' : 'text-text-muted'
            }`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
