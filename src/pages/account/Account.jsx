import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { useToast } from '../../context/ToastContext';
import { User, Shield, CreditCard, Laptop, Settings, Languages, EyeOff } from 'lucide-react';
import Badge from '../../components/common/Badge';

export default function Account() {
  const { currentUser, activeProfile } = useAuth();
  const { navigate } = useRouter();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'billing', 'security', 'devices', 'playback'
  const [prefLang, setPrefLang] = useState('English');
  const [prefSubtitle, setPrefSubtitle] = useState('Off');
  const [securityPassword, setSecurityPassword] = useState('*********');

  const tabs = [
    { id: 'profile', name: 'Profile Settings', icon: User },
    { id: 'billing', name: 'Subscription Plan', icon: CreditCard },
    { id: 'security', name: 'Security & Password', icon: Shield },
    { id: 'devices', name: 'Registered Devices', icon: Laptop },
    { id: 'playback', name: 'Playback & Langs', icon: Languages }
  ];

  const handlePasswordChange = (e) => {
    e.preventDefault();
    addToast("Password reset email sent successfully", "success");
  };

  const activePlan = currentUser?.subscription || "Free";

  return (
    <div className="pb-16 min-h-screen bg-background pt-24 select-text">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10">
        
        {/* Left Sidebar Tabs selectors */}
        <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-1">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4 px-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-brand-accent animate-spin" />
            Account Workspace
          </h2>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all ${
                  isTabActive
                    ? 'bg-brand-accent text-white shadow-lg'
                    : 'bg-card-bg/25 border border-white/5 hover:bg-card-bg text-text-secondary hover:text-white'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {tab.name}
              </button>
            );
          })}
        </aside>

        {/* Right Details Panel */}
        <main className="flex-1 bg-card-bg/20 border border-white/5 rounded-2xl p-6 md:p-8 select-text">
          
          {/* Tab 1: Profile Settings */}
          {activeTab === 'profile' && activeProfile && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4 mb-4">
                <h3 className="text-base font-extrabold uppercase text-white">Profile Details</h3>
                <p className="text-[10px] text-text-muted">Manage active profile details and kids settings.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-background border border-white/5">
                <div className="w-16 h-16 rounded-xl bg-brand-accent text-white flex items-center justify-center font-extrabold text-xl uppercase">
                  {activeProfile.name[0]}
                </div>
                <div className="flex-1 text-center sm:text-left text-xs space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                    {activeProfile.name}
                    <Badge variant="default" className="text-[8px] bg-white/10">{activeProfile.role}</Badge>
                  </h4>
                  <p className="text-text-secondary font-medium">Linked Email: {currentUser?.email}</p>
                  <p className="text-text-muted">Account Created: {new Date(currentUser?.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => navigate('/profiles')}
                  className="px-4 py-2 border border-white/10 rounded-lg font-bold text-white hover:bg-white/5 transition-all text-xs"
                >
                  Manage Profiles
                </button>
              </div>

              <div className="space-y-4 text-xs text-text-secondary">
                <div className="flex justify-between border-b border-white/5 py-3">
                  <span className="font-semibold text-text-muted">Kids Protection</span>
                  <span className="font-bold text-white">{activeProfile.kidsMode ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-3">
                  <span className="font-semibold text-text-muted">Account Tier</span>
                  <span className="font-bold text-brand-accent uppercase">{activePlan}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Billing & Subscriptions */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4 mb-4">
                <h3 className="text-base font-extrabold uppercase text-white">Subscription Management</h3>
                <p className="text-[10px] text-text-muted">Review plan pricing and benefits.</p>
              </div>

              <div className="p-6 rounded-xl bg-brand-accent/5 border border-brand-accent/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-xs space-y-1">
                  <span className="text-[10px] text-brand-accent font-bold uppercase tracking-wider block">Current active plan</span>
                  <h4 className="text-lg font-extrabold text-white uppercase">{activePlan} subscription</h4>
                  <p className="text-text-secondary">Next billing date: Sept 20, 2026</p>
                </div>
                <button
                  onClick={() => navigate('/plans')}
                  className="px-5 py-2.5 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-lg transition-transform hover:scale-105 text-xs shadow-lg"
                >
                  Change Plan
                </button>
              </div>

              <div className="space-y-4 text-xs text-text-secondary pt-4">
                <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Payment History</h4>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-white/5">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white">Aug 20, 2026 Invoice</span>
                    <span className="text-[10px] text-text-muted block">Billed to VISA *1024</span>
                  </div>
                  <span className="font-bold text-text-primary">
                    {activePlan === 'Family Space' ? '₹299' : activePlan === 'Premium' ? '₹199' : '₹0'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Security & Passwords */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4 mb-4">
                <h3 className="text-base font-extrabold uppercase text-white">Security & Password</h3>
                <p className="text-[10px] text-text-muted">Keep your account safe and secure.</p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-5 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-text-muted uppercase font-bold">Email Address</label>
                  <input
                    type="email"
                    value={currentUser?.email || ''}
                    disabled
                    className="bg-background/50 border border-white/10 rounded-lg p-2.5 text-text-muted outline-none cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-text-muted uppercase font-bold">Current Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={securityPassword}
                      disabled
                      className="bg-background/50 border border-white/10 rounded-lg p-2.5 text-text-muted outline-none w-full cursor-not-allowed"
                    />
                    <EyeOff className="absolute right-3 top-3 w-4 h-4 text-text-muted" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold rounded-lg transition-all text-xs"
                >
                  Send Password Reset Email
                </button>
              </form>
            </div>
          )}

          {/* Tab 4: Registered Devices */}
          {activeTab === 'devices' && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4 mb-4">
                <h3 className="text-base font-extrabold uppercase text-white">Active Devices</h3>
                <p className="text-[10px] text-text-muted">List of systems currently logged in under this profile.</p>
              </div>

              <div className="space-y-3.5">
                {[
                  { device: "Chrome (macOS)", location: "Kolkata, India", status: "Active Now" },
                  { device: "SCF Studios Smart TV (Samsung)", location: "Central Mumbai, India", status: "Logged in: 2 days ago" }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3.5 rounded-lg bg-background border border-white/5 text-xs text-text-secondary">
                    <div>
                      <span className="font-bold text-white block">{item.device}</span>
                      <span className="text-[10px] text-text-muted">{item.location}</span>
                    </div>
                    <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded ${
                      item.status === 'Active Now' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-text-muted border-white/10 bg-white/5'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Playback & Languages */}
          {activeTab === 'playback' && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4 mb-4">
                <h3 className="text-base font-extrabold uppercase text-white">Playback Preferences</h3>
                <p className="text-[10px] text-text-muted">Adjust default audio language and captions settings.</p>
              </div>

              <div className="space-y-4 text-xs text-text-secondary">
                {/* Audio Lang Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-text-muted uppercase font-bold">Preferred Audio Language</label>
                  <select
                    value={prefLang}
                    onChange={(e) => {
                      setPrefLang(e.target.value);
                      addToast(`Default Audio: ${e.target.value}`, "success");
                    }}
                    className="bg-background border border-white/10 text-white rounded-lg p-2.5 outline-none focus:border-brand-accent text-xs"
                  >
                    <option value="English">English</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>

                {/* Subtitle Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-text-muted uppercase font-bold">Preferred Subtitle Translation</label>
                  <select
                    value={prefSubtitle}
                    onChange={(e) => {
                      setPrefSubtitle(e.target.value);
                      addToast(`Default Subtitles: ${e.target.value}`, "success");
                    }}
                    className="bg-background border border-white/10 text-white rounded-lg p-2.5 outline-none focus:border-brand-accent text-xs"
                  >
                    <option value="Off">Off</option>
                    <option value="English">English</option>
                    <option value="Bengali">Bengali</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
