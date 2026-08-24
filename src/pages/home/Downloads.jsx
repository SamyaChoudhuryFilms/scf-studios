import React from 'react';
import { Download, ArrowLeft, Play } from 'lucide-react';
import { useRouter } from '../../context/RouterContext';

export default function Downloads() {
  const { navigate } = useRouter();

  // Mock list of downloads (can be empty or show one sample download item)
  const downloads = [
    {
      id: "hamster-kids-movie",
      title: "Super Hamster: Rise of the Sunflower",
      type: "movie",
      size: "342 MB",
      duration: "1h 15m",
      poster: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=400&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary pt-20 pb-24 px-4 md:px-12 select-text">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="p-1 hover:bg-white/5 rounded-full text-text-secondary hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-brand-accent" />
            Downloads
          </h1>
        </div>

        {/* List */}
        {downloads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="w-16 h-16 bg-card-bg rounded-full flex items-center justify-center text-text-muted border border-white/5">
              <Download className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-text-secondary">No offline content downloaded</p>
            <p className="text-xs text-text-muted max-w-xs">
              Save your favorite movies and series to watch offline anytime, anywhere.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-text-muted">
              You have 1 downloaded video ({downloads[0].size})
            </p>
            
            {downloads.map(item => (
              <div 
                key={item.id} 
                className="flex items-center gap-4 bg-card-bg border border-white/5 hover:border-white/10 rounded-xl p-3 transition-colors"
              >
                {/* Poster */}
                <div className="w-20 aspect-[16/9] rounded-lg overflow-hidden flex-shrink-0 bg-black/40 relative group">
                  <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => navigate(`/watch/${item.id}`)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Play className="w-5 h-5 text-white fill-white" />
                  </button>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-text-muted mt-1">
                    <span className="uppercase">{item.type}</span>
                    <span>&middot;</span>
                    <span>{item.duration}</span>
                    <span>&middot;</span>
                    <span>{item.size}</span>
                  </div>
                </div>

                {/* Play action */}
                <button
                  onClick={() => navigate(`/watch/${item.id}`)}
                  className="px-3 py-1.5 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-lg text-[10px] transition-transform hover:scale-105 active:scale-95"
                >
                  Watch
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
