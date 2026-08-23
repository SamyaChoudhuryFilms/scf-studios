import React, { useState } from 'react';
import { useRouter, Link } from '../../context/RouterContext';
import { useToast } from '../../context/ToastContext';

export default function ForgotPassword() {
  const { navigate } = useRouter();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      addToast("Please provide your email address", "error");
      return;
    }
    addToast(`Password recovery link sent to ${email}`, "success");
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-4 select-text">
      
      <div className="max-w-md w-full bg-card-bg/40 border border-white/5 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
        
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-extrabold tracking-wider text-brand-accent mb-2 block">
            SCF STUDIOS
          </Link>
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest block">
            Reset your password
          </span>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed mb-6 text-center">
          Enter your registered email address below. We'll send you a recovery link to restore access to your profile workspace.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs text-text-secondary">
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

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-lg shadow-lg transition-transform active:scale-95 text-xs"
          >
            Send Password Recovery Link
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-text-muted">
          Back to{' '}
          <Link to="/login" className="text-brand-accent hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>

    </div>
  );
}
