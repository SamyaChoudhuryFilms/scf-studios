import React, { useState } from 'react';
import { Bell, ArrowLeft, Trash2 } from 'lucide-react';
import { useRouter } from '../../context/RouterContext';

export default function Notifications() {
  const { navigate } = useRouter();
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New Release", message: "Calcutta Express is coming soon. Check out the details!", time: "2 hours ago", unread: true },
    { id: 2, title: "Trending Now", message: "The Last Signal is the #1 trending title today.", time: "1 day ago", unread: true },
    { id: 3, title: "System Info", message: "Welcome to SCF STUDIOS Premium Streaming Portal.", time: "3 days ago", unread: false }
  ]);

  const handleClearAll = () => {
    setNotifications([]);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pt-20 pb-24 select-text">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-1 hover:bg-white/5 rounded-full text-text-secondary hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-brand-accent" />
              Notifications
            </h1>
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center gap-3">
              <button 
                onClick={markAllRead} 
                className="text-xs text-text-muted hover:text-brand-accent transition-colors font-semibold"
              >
                Mark Read
              </button>
              <button 
                onClick={handleClearAll} 
                className="p-1.5 hover:bg-white/5 rounded text-rose-500 hover:text-rose-400 transition-colors"
                title="Clear All"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* List */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="w-16 h-16 bg-card-bg rounded-full flex items-center justify-center text-text-muted border border-white/5">
              <Bell className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-text-secondary">No notifications yet</p>
            <p className="text-xs text-text-muted max-w-xs">
              We'll notify you when new movies, series, or updates are available.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div 
                key={n.id} 
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  n.unread 
                    ? 'bg-brand-accent/5 border-brand-accent/20 shadow-md' 
                    : 'bg-card-bg border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {n.unread && <span className="w-2 h-2 rounded-full bg-brand-accent flex-shrink-0" />}
                      <span className="text-xs font-bold text-white uppercase tracking-wider">{n.title}</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">{n.message}</p>
                  </div>
                  <span className="text-[10px] text-text-muted whitespace-nowrap">{n.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
