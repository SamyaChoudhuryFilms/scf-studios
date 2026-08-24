import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, Link } from '../../context/RouterContext';
import { useToast } from '../../context/ToastContext';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const { navigate } = useRouter();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      addToast("All fields are required", "error");
      return;
    }
    if (password.length < 6) {
      addToast("Password must be at least 6 characters.", "error");
      return;
    }
    if (!agreeTerms) {
      addToast("You must agree to the Terms of Service", "error");
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name);
      addToast("Account created successfully!", "success");
      navigate('/profiles');
    } catch (err) {
      console.error(err);
      let errorMsg = "Failed to create account. Please check your credentials.";
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = "This email address is already in use.";
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = "Please enter a valid email address.";
      } else if (err.code === 'auth/weak-password') {
        errorMsg = "Password is too weak. Must be at least 6 characters.";
      }
      addToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-4 select-text">

      <div className="max-w-md w-full bg-card-bg/40 border border-white/5 p-8 rounded-2xl shadow-2xl backdrop-blur-md">

        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-extrabold tracking-wider text-brand-accent mb-2 block">
            SCF STUDIOS
          </Link>
          <h1 className="text-lg font-bold text-white uppercase tracking-wider mb-1">
            Create Account
          </h1>
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest">
            Create your account
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs text-text-secondary">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-text-muted uppercase font-bold">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="bg-background border border-white/10 rounded-lg p-3 text-white outline-none focus:border-brand-accent text-xs placeholder-text-muted/60"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-text-muted uppercase font-bold">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="bg-background border border-white/10 rounded-lg p-3 text-white outline-none focus:border-brand-accent text-xs placeholder-text-muted/60"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-text-muted uppercase font-bold">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
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

          {/* Agree checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 accent-brand-accent"
            />
            <label htmlFor="terms" className="text-text-muted cursor-pointer font-medium leading-relaxed">
              I agree to the Terms of Service & Privacy Policy
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-lg shadow-lg transition-transform active:scale-95 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-accent hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>

    </div>
  );
}
