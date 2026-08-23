import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile as firebaseUpdateProfile 
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const DEFAULT_PROFILES = [
  { id: "prof-1", name: "You", avatar: "indigo", kidsMode: false, role: "USER" },
  { id: "prof-2", name: "Friends", avatar: "rose", kidsMode: false, role: "USER" },
  { id: "prof-3", name: "Kids", avatar: "amber", kidsMode: true, role: "USER" }
];

const checkIfAdmin = async (user) => {
  if (!user) return false;
  
  // 1. Check email in environment variable list of admins
  const adminEmailsStr = import.meta.env.VITE_AUTHORIZED_ADMINS || '';
  const adminEmails = adminEmailsStr.split(',').map(email => email.trim().toLowerCase());
  if (user.email && adminEmails.includes(user.email.toLowerCase())) {
    return true;
  }
  
  // 2. Check custom claim (getIdTokenResult)
  try {
    const tokenResult = await user.getIdTokenResult(true);
    if (tokenResult.claims && tokenResult.claims.admin) {
      return true;
    }
  } catch (error) {
    console.error("Error checking admin claims:", error);
  }
  
  return false;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // Run role-based check
        setIsAdminLoading(true);
        const adminStatus = await checkIfAdmin(user);
        setIsAdmin(adminStatus);
        setIsAdminLoading(false);

        // Load profiles from localStorage specific to this user UID
        const savedProfiles = localStorage.getItem(`scfstudios_profiles_${user.uid}`);
        let userProfiles = savedProfiles ? JSON.parse(savedProfiles) : DEFAULT_PROFILES;
        
        // If they are NOT an administrator, strip the ADMIN role from any local profiles to prevent privilege escalation in the UI
        if (!adminStatus) {
          userProfiles = userProfiles.map(p => p.role === 'ADMIN' ? { ...p, role: 'USER' } : p);
        }
        setProfiles(userProfiles);

        const savedActive = localStorage.getItem(`scfstudios_active_profile_${user.uid}`);
        if (savedActive) {
          const activeObj = JSON.parse(savedActive);
          const found = userProfiles.find(p => p.id === activeObj.id);
          setActiveProfile(found || userProfiles[0]);
        } else {
          setActiveProfile(userProfiles[0]);
        }

        // Set audience / subscription details
        const savedSub = localStorage.getItem(`sub_${user.uid}`) || "Premium";
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          subscription: savedSub,
          createdAt: user.metadata.creationTime
        });
      } else {
        setCurrentUser(null);
        setProfiles([]);
        setActiveProfile(null);
        setIsAdmin(false);
        setIsAdminLoading(false);
      }
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  // Save profiles and active profile per user when updated
  useEffect(() => {
    if (firebaseUser && profiles.length > 0) {
      localStorage.setItem(`scfstudios_profiles_${firebaseUser.uid}`, JSON.stringify(profiles));
    }
  }, [profiles, firebaseUser]);

  useEffect(() => {
    if (firebaseUser && activeProfile) {
      localStorage.setItem(`scfstudios_active_profile_${firebaseUser.uid}`, JSON.stringify(activeProfile));
    }
  }, [activeProfile, firebaseUser]);

  // Profile operations
  const selectProfile = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setActiveProfile(profile);
    }
  };

  const addProfile = (name, avatar, kidsMode, role = "USER") => {
    const newProfile = {
      id: `prof-${Date.now()}`,
      name,
      avatar,
      kidsMode,
      role: isAdmin ? role : "USER" // Force role to USER if user is not authorized administrator
    };
    setProfiles(prev => [...prev, newProfile]);
    return newProfile;
  };

  const updateProfile = (profileId, updates) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === profileId) {
        // Enforce non-admin role if the user is not a verified administrator
        const sanitizedUpdates = { ...updates };
        if (!isAdmin && sanitizedUpdates.role) {
          sanitizedUpdates.role = "USER";
        }
        const updated = { ...p, ...sanitizedUpdates };
        if (activeProfile && activeProfile.id === profileId) {
          setActiveProfile(updated);
        }
        return updated;
      }
      return p;
    }));
  };

  const deleteProfile = (profileId) => {
    if (profiles.length <= 1) return false;
    setProfiles(prev => prev.filter(p => p.id !== profileId));
    if (activeProfile && activeProfile.id === profileId) {
      const remaining = profiles.filter(p => p.id !== profileId);
      setActiveProfile(remaining[0]);
    }
    return true;
  };

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  const register = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await firebaseUpdateProfile(userCredential.user, {
      displayName: name
    });
    return userCredential.user;
  };

  const logout = async () => {
    await signOut(auth);
    setActiveProfile(null);
  };

  const updateSubscription = (tier) => {
    if (firebaseUser) {
      localStorage.setItem(`sub_${firebaseUser.uid}`, tier);
      setCurrentUser(prev => prev ? { ...prev, subscription: tier } : null);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      firebaseUser,
      isAdmin,
      isAdminLoading,
      authLoading,
      profiles,
      activeProfile,
      selectProfile,
      addProfile,
      updateProfile,
      deleteProfile,
      login,
      register,
      logout,
      updateSubscription
    }}>
      {children}
    </AuthContext.Provider>
  );
};
