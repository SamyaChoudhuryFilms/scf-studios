import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit2, Trash2, Check, X, ShieldAlert } from 'lucide-react';
import Badge from '../../components/common/Badge';

export default function Profiles() {
  const { profiles, selectProfile, addProfile, updateProfile, deleteProfile } = useAuth();
  const { navigate } = useRouter();
  const { addToast } = useToast();

  const [isManageMode, setIsManageMode] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null); // Profile object being edited
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('indigo');
  const [kidsMode, setKidsMode] = useState(false);
  const [role, setRole] = useState('USER');

  const avatarOptions = ['indigo', 'rose', 'emerald', 'amber', 'slate'];

  const getAvatarBg = (color) => {
    switch (color) {
      case 'indigo': return 'bg-brand-accent';
      case 'rose': return 'bg-rose-600';
      case 'emerald': return 'bg-emerald-600';
      case 'amber': return 'bg-amber-600';
      default: return 'bg-slate-700';
    }
  };

  const handleProfileSelect = (profile) => {
    if (isManageMode) {
      // Open editor
      setEditingProfile(profile);
      setName(profile.name);
      setAvatar(profile.avatar);
      setKidsMode(profile.kidsMode);
      setRole(profile.role);
    } else {
      selectProfile(profile.id);
      addToast(`Switched to profile: ${profile.name}`, "success");
      navigate('/');
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast("Profile name cannot be empty", "error");
      return;
    }
    const created = addProfile(name, avatar, kidsMode, role);
    addToast(`Added profile ${created.name}`, "success");
    resetForm();
    setShowAddModal(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast("Profile name cannot be empty", "error");
      return;
    }
    updateProfile(editingProfile.id, { name, avatar, kidsMode, role });
    addToast("Profile updated successfully", "success");
    setEditingProfile(null);
    resetForm();
  };

  const handleDelete = (id) => {
    if (profiles.length <= 1) {
      addToast("You must keep at least one profile", "error");
      return;
    }
    const success = deleteProfile(id);
    if (success) {
      addToast("Profile deleted", "success");
      setEditingProfile(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setName('');
    setAvatar('indigo');
    setKidsMode(false);
    setRole('USER');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-16 px-6">
      
      {/* Header Title */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-wide uppercase">
        {isManageMode ? 'Manage Profiles' : "Who's Watching?"}
      </h1>
      <p className="text-xs text-text-secondary font-medium tracking-wide mb-12">
        Select a profile to enter the entertainment universe.
      </p>

      {/* Profiles list */}
      <div className="flex flex-wrap items-center justify-center gap-8 max-w-4xl">
        {profiles.map(profile => (
          <div
            key={profile.id}
            onClick={() => handleProfileSelect(profile)}
            className="flex flex-col items-center gap-3 cursor-pointer group text-center"
          >
            {/* Avatar Bubble */}
            <div className="relative">
              <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-xl flex items-center justify-center text-white text-3xl font-extrabold uppercase shadow-2xl transition-all duration-300 border-2 border-transparent group-hover:scale-105 group-hover:border-brand-accent ${getAvatarBg(profile.avatar)}`}>
                {profile.name[0]}
              </div>

              {/* Edit pencil badge overlay */}
              {isManageMode && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                  <Edit2 className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex flex-col items-center gap-1.5 w-24 sm:w-28">
              <span className="text-xs font-bold text-text-secondary group-hover:text-white transition-colors truncate w-full">
                {profile.name}
              </span>
              <div className="flex flex-wrap justify-center gap-1">
                {profile.kidsMode && <Badge variant="warning" className="text-[7.5px] px-1">Kids</Badge>}
              </div>
            </div>
          </div>
        ))}

        {/* Add Profile Card */}
        {profiles.length < 6 && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex flex-col items-center gap-3 cursor-pointer group text-center"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-card-bg border border-white/5 flex items-center justify-center text-text-muted group-hover:text-white group-hover:border-white/20 transition-all duration-300 hover:scale-105">
              <Plus className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold text-text-muted group-hover:text-white transition-colors">
              Add Profile
            </span>
          </button>
        )}
      </div>

      {/* Action Toggle controls */}
      <div className="mt-16 flex gap-4">
        <button
          onClick={() => setIsManageMode(!isManageMode)}
          className={`px-6 py-2.5 rounded-lg text-xs font-bold border transition-all ${
            isManageMode
              ? 'bg-brand-accent border-transparent text-white shadow-lg'
              : 'bg-transparent border-white/20 hover:border-white/40 text-text-secondary'
          }`}
        >
          {isManageMode ? 'Done Managing' : 'Manage Profiles'}
        </button>
        
        {!isManageMode && (
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/10"
          >
            Enter Platform
          </button>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card-bg border border-white/10 rounded-xl p-6 max-w-md w-full shadow-2xl relative select-text">
            <button
              onClick={() => setEditingProfile(null)}
              className="absolute top-4 right-4 text-text-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-extrabold uppercase text-white mb-6">
              Edit Profile: {editingProfile.name}
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-5 text-xs text-text-secondary">
              {/* Name field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-text-muted uppercase font-bold">Profile Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-brand-accent text-xs"
                />
              </div>

              {/* Avatar color picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-text-muted uppercase font-bold">Avatar Color</label>
                <div className="flex gap-2.5">
                  {avatarOptions.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatar(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                        avatar === c ? 'border-brand-accent scale-110' : 'border-transparent'
                      } ${getAvatarBg(c)}`}
                    >
                      {avatar === c && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>



              {/* Kids Mode toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-white/5">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-white">Kids Mode</span>
                  <span className="text-[10px] text-text-muted">Only show family-friendly, G-rated animation and movies.</span>
                </div>
                <input
                  type="checkbox"
                  checked={kidsMode}
                  onChange={(e) => setKidsMode(e.target.checked)}
                  className="w-4 h-4 accent-brand-accent"
                />
              </div>

              {/* Action Buttons row */}
              <div className="pt-4 flex items-center justify-between border-t border-white/5">
                <button
                  type="button"
                  onClick={() => handleDelete(editingProfile.id)}
                  className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-bold hover:underline"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Profile
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProfile(null)}
                    className="px-4 py-2 border border-white/15 rounded-lg text-text-secondary hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Profile Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card-bg border border-white/10 rounded-xl p-6 max-w-md w-full shadow-2xl relative select-text">
            <button
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="absolute top-4 right-4 text-text-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-extrabold uppercase text-white mb-6">
              Create New Profile
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-5 text-xs text-text-secondary">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-text-muted uppercase font-bold">Profile Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sona"
                  className="bg-background border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-brand-accent text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-text-muted uppercase font-bold">Avatar Color</label>
                <div className="flex gap-2.5">
                  {avatarOptions.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatar(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                        avatar === c ? 'border-brand-accent scale-110' : 'border-transparent'
                      } ${getAvatarBg(c)}`}
                    >
                      {avatar === c && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>



              <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-white/5">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-white">Kids Mode</span>
                  <span className="text-[10px] text-text-muted">Only show cartoon animation and family G-rated content.</span>
                </div>
                <input
                  type="checkbox"
                  checked={kidsMode}
                  onChange={(e) => setKidsMode(e.target.checked)}
                  className="w-4 h-4 accent-brand-accent"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-white/15 rounded-lg text-text-secondary hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-lg"
                >
                  Add Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
