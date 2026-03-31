import { startTransition, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../lib/api';

const checklist = [
  'Protected access for your store workspace',
  'Quick demo mode for trying the app immediately',
  'Google sign-in support when your client ID is configured',
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAsDemo, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectTo = location.state?.from?.pathname || '/app';

  const navigateToApp = () => {
    startTransition(() => {
      navigate(redirectTo, { replace: true });
    });
  };

  const handleGoogleCredential = async (credential) => {
    try {
      setLoading(true);
      setError('');
      await loginWithGoogle(credential);
      navigateToApp();
    } catch (loginError) {
      setError(getErrorMessage(loginError));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setError('');
    loginAsDemo();
    navigateToApp();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_28%),radial-gradient(circle_at_left,_rgba(34,211,238,0.14),_transparent_34%),linear-gradient(180deg,_#020617_0%,_#0f172a_48%,_#08111d_100%)] text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="max-w-xl">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-primary to-emerald-400 text-white shadow-lg shadow-cyan-500/20">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-white">PharmaSync</p>
              <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">Secure Access</p>
            </div>
          </Link>

          <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
            <Sparkles size={16} />
            Welcome back to your medical store workspace
          </div>

          <h1 className="font-display mt-6 text-5xl font-bold leading-tight text-white sm:text-6xl">
            Sign in and step into your store command center.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Use Google for a smoother sign-in flow, or open demo access right away to explore the full pharmacy workflow.
          </p>

          <div className="mt-8 space-y-4">
            {checklist.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-4">
                <CheckCircle2 className="mt-0.5 text-emerald-300" size={18} />
                <p className="text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[2.4rem] bg-gradient-to-br from-cyan-400/20 via-transparent to-emerald-400/12 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-slate-950/65 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl sm:p-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.26em] text-cyan-200/70">Account Access</p>
                <h2 className="font-display mt-2 text-3xl font-bold text-white">Login to continue</h2>
              </div>
              <div className="rounded-2xl bg-white/6 p-3 text-cyan-200">
                <ShieldCheck size={22} />
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              Google login is ready for production use once you add your client ID to the frontend and backend environment files.
            </p>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {!googleClientId && (
              <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                Google client ID is not configured yet. Add <code>VITE_GOOGLE_CLIENT_ID</code> in the frontend env and <code>GOOGLE_CLIENT_ID</code> in the backend env to enable the real Google button.
              </div>
            )}

            <div className="mt-8 space-y-4">
              {googleClientId ? (
                <GoogleSignInButton
                  clientId={googleClientId}
                  disabled={loading}
                  onCredential={handleGoogleCredential}
                />
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex w-full items-center justify-center rounded-full border border-white/10 bg-white/4 px-5 py-3 text-sm font-semibold text-slate-400"
                >
                  Google Login Not Configured Yet
                </button>
              )}

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-slate-950/80 px-3 text-xs uppercase tracking-[0.24em] text-slate-500">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-6 py-3.5 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continue In Demo Mode
                <ArrowRight size={16} />
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-slate-400">
              Need the public intro first?{' '}
              <Link to="/" className="font-medium text-cyan-200 hover:text-cyan-100">
                Go back to landing page
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
