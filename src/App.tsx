import React from 'react';
import { TeamProvider, useTeam } from './context/TeamContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { WarRoom } from './pages/WarRoom';
import { Strategist } from './pages/Strategist';
import { Watercooler } from './pages/Watercooler';
import { FranchiseVault } from './pages/FranchiseVault';
import { IdentityModal } from './components/IdentityModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ArchitectureSpecModal } from './components/ArchitectureSpecModal';
import { YahooSyncModal } from './components/YahooSyncModal';
import { BroadcastCommentarySidebar } from './components/BroadcastCommentarySidebar';
import { CheckCircle2, Shield, Activity, Cpu } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    activeTab,
    currentTeam,
    setIsSpecModalOpen,
    isCommentarySidebarOpen,
    setIsCommentarySidebarOpen,
  } = useTeam();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0B0F17] text-slate-200">
      
      {/* Navigation Header */}
      <Header />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 flex-1">
        {activeTab === 'home' && <Home />}
        {activeTab === 'war-room' && <WarRoom />}
        {activeTab === 'strategist' && <Strategist />}
        {activeTab === 'watercooler' && <Watercooler />}
        {activeTab === 'vault' && <FranchiseVault />}
      </main>

      {/* System Modals, Drawers & AI Broadcast Commentary Sidebar */}
      <IdentityModal />
      <NotificationDrawer />
      <ArchitectureSpecModal />
      <YahooSyncModal />
      
      {/* Commentary Sidebar Backdrop */}
      {isCommentarySidebarOpen && (
        <div
          onClick={() => setIsCommentarySidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 transition-opacity"
          aria-hidden="true"
        />
      )}
      <BroadcastCommentarySidebar />

      {/* System Status Footer */}
      <footer className="border-t border-[#1E293B] bg-[#0B0F17]/90 py-4 px-4 lg:px-8 text-xs font-mono text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold">SYSTEM ACTIVE</span>
            </span>
            <span>•</span>
            <span className="text-slate-400">sync_live.py (ESPN 3m cron)</span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-slate-400">ILP Solver: PuLP v2.8</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsSpecModalOpen(true)}
              className="text-slate-400 hover:text-white transition underline underline-offset-4"
            >
              Architecture & Spec
            </button>
            <span className="text-slate-600">•</span>
            <span>Active Persona: <strong className="text-slate-300 font-sans">{currentTeam.ownerName}</strong></span>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <TeamProvider>
      <MainContent />
    </TeamProvider>
  );
}
