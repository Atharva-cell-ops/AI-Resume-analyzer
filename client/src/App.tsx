import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { ResumeProvider } from './context/ResumeContext';
import { ResumeBuilderPage } from './pages/ResumeBuilderPage';
import { AtsAnalyzerPage } from './pages/AtsAnalyzerPage';
import { DashboardPage } from './pages/DashboardPage';
import { AuthModal } from './components/auth/AuthModal';
import { FileText, Sparkles, LogOut, LogIn, UserPlus, Gauge, Edit3, LayoutDashboard } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const [activeView, setActiveView] = useState<'builder' | 'analyzer' | 'dashboard'>('builder');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Professional SaaS Navigation Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100 shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  ATS Resume Studio
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold tracking-wide uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                  Full Stack ATS Engine
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setActiveView('builder')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeView === 'builder'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Resume Builder</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('analyzer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeView === 'analyzer'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                <span>ATS Analyzer</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeView === 'dashboard'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
                <span>Dashboard</span>
              </button>
            </nav>
          </div>

          {/* User & Auth Navigation */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <span className="text-xs text-slate-500">Checking auth...</span>
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-600 hidden sm:inline">
                  Signed in as <strong className="text-slate-900 font-semibold">{user.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-medium shadow-xs transition"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="flex items-center gap-1 px-3 py-1.5 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-semibold transition"
                >
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </button>
                <button
                  type="button"
                  onClick={() => openAuth('register')}
                  className="flex items-center gap-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main View Experience */}
      <main className="flex-1 flex flex-col">
        {activeView === 'builder' && <ResumeBuilderPage />}
        {activeView === 'analyzer' && <AtsAnalyzerPage />}
        {activeView === 'dashboard' && (
          <DashboardPage
            onNavigateToBuilder={() => setActiveView('builder')}
            onNavigateToAnalyzer={() => setActiveView('analyzer')}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ResumeProvider>
      <AppContent />
    </ResumeProvider>
  );
};
