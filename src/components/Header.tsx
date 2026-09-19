import React from 'react';
import { useTeam } from '../context/TeamContext';
import { Bell, FileText, UserCheck, Flame, Cpu, Radio, Award, Home as HomeIcon, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentTeam,
    setIsIdentityModalOpen,
    setIsSpecModalOpen,
    setIsNotificationOpen,
    setIsYahooSyncModalOpen,
    setIsCommentarySidebarOpen,
    notifications,
    activeTab,
    setActiveTab,
    simulationState,
  } = useTeam();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="border-b border-[#1E293B] bg-[#0B0F17]/95 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        
        {/* Logo & App Title - Clickable to Home */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 text-left group transition cursor-pointer"
            title="Return to Home Hub"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 flex items-center justify-center font-black text-black text-xl shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform">
              🏈
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base lg:text-lg text-white leading-tight tracking-tight group-hover:text-emerald-300 transition-colors">
                  Initech Invitational
                </h1>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-800 text-purple-300 font-bold">
                  Yahoo #13003
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-bold hidden sm:inline-block">
                  v2.4 ILP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Weekly Audio Dispatch • Yahoo Pick'em Intelligence • 10 Active Teams
              </p>
            </div>
          </button>

          {/* Mobile Profile Trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsCommentarySidebarOpen(true)}
              className="p-2 rounded-lg bg-red-950/70 border border-red-800 text-red-300 hover:text-white relative"
              aria-label="AI Commentary"
              title="AI Broadcast Commentary (Gemini 3.8 Flash)"
            >
              <Radio className="w-4 h-4 text-amber-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500"></span>
            </button>
            <button
              onClick={() => setIsYahooSyncModalOpen(true)}
              className="px-2 py-1.5 rounded-lg bg-purple-950/70 border border-purple-800 text-[11px] font-mono text-purple-200 font-bold flex items-center gap-1"
              title="Yahoo Group #13003"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              #13003
            </button>
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] font-bold text-black flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsIdentityModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-white"
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-black"
                style={{ backgroundColor: currentTeam.color }}
              >
                {currentTeam.avatar}
              </span>
              <span className="truncate max-w-[80px]">{currentTeam.ownerName}</span>
            </button>
          </div>
        </div>

        {/* 5 Primary Navigation Tabs */}
        <nav className="flex items-center gap-1.5 p-1 bg-[#151D2A] border border-[#1E293B] rounded-xl overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'home'
                ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <HomeIcon className={`w-3.5 h-3.5 ${activeTab === 'home' ? 'text-black' : 'text-emerald-400'}`} />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab('war-room')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'war-room'
                ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${activeTab === 'war-room' ? 'text-black' : 'text-amber-400'}`} />
            <span>The War Room</span>
            {simulationState !== 'kc_leads' && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('strategist')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'strategist'
                ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Cpu className={`w-3.5 h-3.5 ${activeTab === 'strategist' ? 'text-black' : 'text-emerald-400'}`} />
            <span>The Strategist</span>
          </button>

          <button
            onClick={() => setActiveTab('watercooler')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'watercooler'
                ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${activeTab === 'watercooler' ? 'text-black' : 'text-purple-400'}`} />
            <span>The Watercooler</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'vault'
                ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className={`w-3.5 h-3.5 ${activeTab === 'vault' ? 'text-black' : 'text-blue-400'}`} />
            <span>The Vault</span>
          </button>
        </nav>

        {/* Action Controls & Frictionless Identity (Desktop) */}
        <div className="hidden md:flex items-center gap-2.5">
          
          {/* AI Broadcast Commentary Sidebar Trigger */}
          <button
            onClick={() => setIsCommentarySidebarOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-red-950/80 via-amber-950/80 to-red-950/80 hover:from-red-900 hover:to-amber-900 border border-red-800/80 text-white text-xs font-bold transition group shadow-sm shadow-red-950/40 cursor-pointer"
            title="Open AI Broadcast Commentary (Gemini 3.8 Flash)"
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span className="tracking-tight">AI Commentary</span>
          </button>

          {/* Yahoo League 13003 Live Sync Trigger */}
          <button
            onClick={() => setIsYahooSyncModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/80 text-purple-200 text-xs font-semibold transition group shadow-sm shadow-purple-900/20"
            title="Yahoo Pro Football Pick'em • Group #13003 (Click for live ingestion)"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono font-bold text-white">Yahoo #13003</span>
          </button>

          {/* Spec View Button */}
          <button
            onClick={() => setIsSpecModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition"
            title="Read Gemini System Architecture Spec"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Spec Sheet</span>
          </button>

          {/* Push Notification Drawer Trigger */}
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
            title="PWA Web Push Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] font-bold text-black flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Zero-Password Team Identity Badge */}
          <button
            onClick={() => setIsIdentityModalOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#151D2A] hover:bg-slate-800 border border-[#1E293B] hover:border-emerald-500/50 transition group text-left"
            title="Click to switch active team persona"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-black shadow"
              style={{ backgroundColor: currentTeam.color }}
            >
              {currentTeam.avatar}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition leading-tight">
                  {currentTeam.ownerName}
                </span>
                <UserCheck className="w-3 h-3 text-emerald-400" />
              </div>
              <p className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                {currentTeam.teamName}
              </p>
            </div>
          </button>

        </div>

      </div>
    </header>
  );
};
