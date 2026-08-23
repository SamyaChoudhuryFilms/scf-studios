import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, Link } from '../../context/RouterContext';
import { useToast } from '../../context/ToastContext';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { navigate } = useRouter();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast("Please fill in all credentials", "error");
      return;
    }
    
    setLoading(true);
    try {
      await login(email, password);
      addToast("Successfully logged in!", "success");
      navigate('/profiles');
    } catch (err) {
      console.error(err);
      let errorMsg = "Failed to sign in. Please verify your credentials.";
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errorMsg = "Incorrect email or password.";
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = "Please enter a valid email address.";
      }
      addToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-4 select-text">
      
      {/* Container Box */}
      <div className="max-w-md w-full bg-card-bg/40 border border-white/5 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
        
        {/* Brand Logo header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-extrabold tracking-wider text-brand-accent mb-2 block">
            SCF STUDIOS
          </Link>
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest">
            Your Entertainment Universe
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs text-text-secondary">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-text-muted uppercase font-bold">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@scfstudios.com"
              className="bg-background border border-white/10 rounded-lg p-3 text-white outline-none focus:border-brand-accent text-xs placeholder-text-muted/60"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-text-muted uppercase font-bold">Password</label>
              <Link to="/forgot-password" className="text-[10px] text-brand-accent hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-background border border-white/10 rounded-lg p-3 pr-10 text-white outline-none focus:border-brand-accent text-xs placeholder-text-muted/60 w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-text-muted hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-brand-accent"
            />
            <label htmlFor="remember" className="text-text-muted cursor-pointer font-medium selection:bg-transparent">
              Remember me on this browser
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-lg shadow-lg shadow-brand-accent/10 transition-transform active:scale-95 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-text-muted">
          New to SCF Studios?{' '}
          <Link to="/register" className="text-brand-accent hover:underline font-semibold">
            Create account
          </Link>
        </div>
      </div>

    </div>
  );
}
