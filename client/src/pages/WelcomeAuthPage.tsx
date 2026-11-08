import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  ShieldCheck,
  Zap,
  TrendingUp,
  AlertCircle,
  Lock,
  Mail,
  User as UserIcon,
  Loader2
} from 'lucide-react';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '1015016366592-aba8gm5719m5s3hkvnsbofq1oe366e3o.apps.googleusercontent.com';

export const WelcomeAuthPage: React.FC = () => {
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Initialize official Google Identity Services with user's client ID
  useEffect(() => {
    let checkInterval: any;

    const initGsi = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id) return false;

      try {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            if (response.credential) {
              setIsSubmitting(true);
              setError(null);
              try {
                await loginWithGoogle(response.credential);
              } catch (err: any) {
                setError(err.message || 'Google authentication failed');
              } finally {
                setIsSubmitting(false);
              }
            }
          }
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'rectangular',
            text: 'continue_with',
            logo_alignment: 'left',
            width: googleBtnRef.current.offsetWidth || 340
          });
        }
        return true;
      } catch (e) {
        console.warn('GSI init notice:', e);
        return false;
      }
    };

    if (!initGsi()) {
      checkInterval = setInterval(() => {
        if (initGsi()) clearInterval(checkInterval);
      }, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [loginWithGoogle]);

  const handleGoogleClick = () => {
    const google = (window as any).google;
    if (google?.accounts?.id) {
      google.accounts.id.prompt();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login({ email: email.trim().toLowerCase(), password });
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        await register({ name: name.trim(), email: email.trim().toLowerCase(), password });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100 shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900">
                ATS Resume Studio
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold tracking-wide uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                Full Stack Platform
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Account Required to Access Workspace
          </div>
        </div>
      </header>

      {/* Main Content Hero + Auth Card */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-14">
        {/* Left Value Props */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>100% Deterministic ATS Optimizer</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Build Resumes That Beat The Applicant Tracking System.
          </h1>

          <p className="text-base text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Create your ATS-friendly resume from scratch with live preview, real-time action-verb suggestions, and instant job-description match scoring.
          </p>

          {/* Key Feature Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
            <div className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 w-fit mb-2">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs mb-1">Clean Slate Builder</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Type your own career history, education, and skills with live single-column preview.
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 w-fit mb-2">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs mb-1">ATS Score Engine</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Paste any job description to evaluate keyword matches and score gain suggestions.
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
              <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600 w-fit mb-2">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs mb-1">PDF &amp; DOCX Export</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Server-side Puppeteer export ensuring 100% selectable text that parsers love.
              </p>
            </div>
          </div>
        </div>

        {/* Right Auth Card */}
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-md">
          {/* Tabs: Sign In / Create Account */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 mb-6 text-xs">
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                mode === 'register' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {mode === 'register' ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'register'
                ? 'Sign up to start typing your resume from scratch.'
                : 'Sign in to access your saved resumes and version history.'}
            </p>
          </div>

          {error && (
            <div className="p-3 mb-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Official Google Identity Services Sign-In Button */}
          <div className="mb-4">
            <div ref={googleBtnRef} className="flex justify-center w-full min-h-[44px]" />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">or with email</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Full Name <span className="text-indigo-600">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-indigo-600">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-indigo-600">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Min 8 characters' : '••••••••'}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-xs mt-2 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : mode === 'register' ? (
                'Create Account & Start Building'
              ) : (
                'Sign In to Workspace'
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <span>ATS Resume Studio &bull; Full-Stack Production Architecture &bull; 100% Deterministic ATS Engine</span>
      </footer>
    </div>
  );
};
