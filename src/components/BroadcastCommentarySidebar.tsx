import React, { useState, useEffect, useRef } from 'react';
import { useTeam } from '../context/TeamContext';
import { BroadcastCommentaryData, BroadcastDialogueLine } from '../types';
import { getTeamSeasonAccuracy } from '../data/seasonAccuracyData';
import {
  X,
  Radio,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Send,
  Copy,
  Check,
  Award,
  TrendingUp,
  Shield,
  Target,
  Zap,
  Flame,
  AlertTriangle,
  ChevronRight,
  Info,
  Sliders,
  MessageSquare,
  Activity,
  Cpu,
} from 'lucide-react';

export const BroadcastCommentarySidebar: React.FC = () => {
  const {
    isCommentarySidebarOpen,
    setIsCommentarySidebarOpen,
    currentTeam,
    teams,
    setCurrentTeamId,
  } = useTeam();

  const [selectedWeek, setSelectedWeek] = useState<number>(7);
  const [selectedPersona, setSelectedPersona] = useState<'dual' | 'sal' | 'chloe' | 'commish'>('dual');
  const [focusMode, setFocusMode] = useState<'full_debrief' | 'strategy_audit' | 'anchor_leverage'>('full_debrief');
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [commentary, setCommentary] = useState<BroadcastCommentaryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Audio Playback with Web SpeechSynthesis
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Fetch or generate commentary for the current parameters
  const generateCommentary = async (customPrompt?: string) => {
    setIsLoading(true);
    // Stop any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }

    try {
      const res = await fetch('/api/broadcast/commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: currentTeam.id,
          weekNumber: selectedWeek,
          persona: selectedPersona,
          focusMode,
          userQuestion: customPrompt !== undefined ? customPrompt : userQuestion,
        }),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (data.commentary) {
        setCommentary(data.commentary);
      }
    } catch (err) {
      console.warn('Commentary fetch error, generating local fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate on first open or when week/team changes if no commentary yet
  useEffect(() => {
    if (isCommentarySidebarOpen && !commentary) {
      generateCommentary();
    }
  }, [isCommentarySidebarOpen, currentTeam.id, selectedWeek]);

  // Clean up audio on unmount or close
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleClose = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
    setIsCommentarySidebarOpen(false);
  };

  const handleCopyTranscript = () => {
    if (!commentary) return;
    const textLines = [
      `=== AI BROADCAST COMMENTARY: ${commentary.headline} ===`,
      `Manager: ${commentary.ownerName} (${commentary.teamName}) | Week ${commentary.weekNumber}`,
      `Strategy Grade: ${commentary.strategyAssessment.grade} | Efficiency: ${commentary.strategyAssessment.capitalEfficiency}%`,
      `Record: ${commentary.statsSummary.record} (${commentary.statsSummary.accuracy}%) | Points: ${commentary.statsSummary.pointsEarned}/${commentary.statsSummary.pointsPossible}`,
      '',
      '--- BROADCAST TRANSCRIPT ---',
      ...commentary.broadcastScript.map(
        (line) => `${line.speaker.toUpperCase()}${line.stageDirection ? ` [${line.stageDirection}]` : ''}: ${line.text}`
      ),
      '',
      '--- TACTICAL PRESCRIPTIONS ---',
      ...commentary.tacticalPrescriptions.map((p, i) => `${i + 1}. ${p}`),
    ].join('\n');

    navigator.clipboard.writeText(textLines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Speech synthesis playback
  const toggleSpeechAudio = () => {
    if (!window.speechSynthesis) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (!commentary || commentary.broadcastScript.length === 0) return;

    window.speechSynthesis.cancel();

    // Combine lines into speech text
    const fullText = commentary.broadcastScript
      .map((line) => `${line.speaker}: ${line.text}`)
      .join('. ');

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = speechRate;

    // Pick voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('Natural'))
    ) || voices[0];
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const currentAccuracyRecord = getTeamSeasonAccuracy(currentTeam.id);
  const activeWeekTrend = currentAccuracyRecord.weeklyTrends.find((w) => w.week === selectedWeek);

  if (!isCommentarySidebarOpen) return null;

  return (
    <aside
      aria-label="AI Broadcast Commentary Sidebar"
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] md:w-[620px] bg-[#0A0E17]/98 backdrop-blur-xl border-l border-[#1E293B] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out"
    >
      {/* Top App Header & Live Badge */}
      <div className="p-4 sm:p-5 border-b border-[#1E293B] bg-[#0E1524] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-amber-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-red-900/40 relative">
            <Radio className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                AI Broadcast Commentary
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 border border-red-800 text-red-300 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                ON AIR
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <span>Weekly Outcomes & Strategy Audit</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-mono text-[11px] font-bold flex items-center gap-0.5">
                <Sparkles className="w-3 h-3" />
                Gemini 3.8 Flash
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white transition"
          title="Close Sidebar"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Control Panel: Week, Persona & Focus Selection */}
      <div className="p-4 sm:p-5 border-b border-[#1E293B] bg-[#0B101D] space-y-4">
        {/* Active Franchise Selector */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-black shadow"
              style={{ backgroundColor: currentTeam.color }}
            >
              {currentTeam.avatar}
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight">
                {currentTeam.ownerName}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {currentTeam.teamName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <label htmlFor="team-switcher" className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Franchise:
            </label>
            <select
              id="team-switcher"
              value={currentTeam.id}
              onChange={(e) => setCurrentTeamId(e.target.value)}
              className="text-xs font-semibold bg-[#151D2A] border border-[#1E293B] text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.ownerName} ({t.teamName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Week Selector Bar (Weeks 1-7) */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
            <span>NFL Regular Season Week:</span>
            {activeWeekTrend && (
              <span className="font-mono text-emerald-400 font-bold">
                {activeWeekTrend.correctCount}/{activeWeekTrend.gamesCount} wins ({activeWeekTrend.accuracy}%)
              </span>
            )}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((wk) => {
              const wkData = currentAccuracyRecord.weeklyTrends.find((w) => w.week === wk);
              const isSelected = selectedWeek === wk;
              return (
                <button
                  key={wk}
                  onClick={() => setSelectedWeek(wk)}
                  className={`flex flex-col items-center py-2 px-1 rounded-xl transition border text-center ${
                    isSelected
                      ? 'bg-gradient-to-b from-emerald-500 to-teal-600 text-black border-emerald-400 font-bold shadow-md shadow-emerald-500/20'
                      : 'bg-[#151D2A] hover:bg-[#1E293B] text-slate-300 border-[#1E293B]'
                  }`}
                >
                  <span className={`text-[10px] uppercase ${isSelected ? 'text-black/80 font-bold' : 'text-slate-400'}`}>
                    Wk
                  </span>
                  <span className="text-sm font-black">{wk}</span>
                  {wkData && (
                    <span
                      className={`text-[9px] font-mono mt-0.5 ${
                        isSelected ? 'text-black font-extrabold' : 'text-emerald-400'
                      }`}
                    >
                      {wkData.accuracy}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Persona Selector (Dual, Sal, Chloe, Commish) */}
        <div>
          <label className="block text-[11px] text-slate-400 mb-1.5 font-medium">
            Broadcast Desk Host & Voice:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              onClick={() => setSelectedPersona('dual')}
              className={`px-2.5 py-2 rounded-xl text-left border transition text-xs flex flex-col justify-between ${
                selectedPersona === 'dual'
                  ? 'bg-gradient-to-r from-amber-950/80 to-teal-950/80 border-amber-500 text-white font-bold'
                  : 'bg-[#151D2A] border-[#1E293B] text-slate-300 hover:bg-slate-800/80'
              }`}
            >
              <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                🎙️ Dual Desk
              </span>
              <span className="text-[11px] font-extrabold truncate">Sal & Chloe</span>
            </button>

            <button
              onClick={() => setSelectedPersona('sal')}
              className={`px-2.5 py-2 rounded-xl text-left border transition text-xs flex flex-col justify-between ${
                selectedPersona === 'sal'
                  ? 'bg-orange-950/80 border-orange-500 text-white font-bold'
                  : 'bg-[#151D2A] border-[#1E293B] text-slate-300 hover:bg-slate-800/80'
              }`}
            >
              <span className="text-[10px] text-orange-400 font-bold flex items-center gap-1">
                🥩 Coach Sal
              </span>
              <span className="text-[11px] font-extrabold truncate">Bridgeport Grit</span>
            </button>

            <button
              onClick={() => setSelectedPersona('chloe')}
              className={`px-2.5 py-2 rounded-xl text-left border transition text-xs flex flex-col justify-between ${
                selectedPersona === 'chloe'
                  ? 'bg-teal-950/80 border-teal-500 text-white font-bold'
                  : 'bg-[#151D2A] border-[#1E293B] text-slate-300 hover:bg-slate-800/80'
              }`}
            >
              <span className="text-[10px] text-teal-400 font-bold flex items-center gap-1">
                📊 Dr. Chloe
              </span>
              <span className="text-[11px] font-extrabold truncate">MIT Analytics</span>
            </button>

            <button
              onClick={() => setSelectedPersona('commish')}
              className={`px-2.5 py-2 rounded-xl text-left border transition text-xs flex flex-col justify-between ${
                selectedPersona === 'commish'
                  ? 'bg-purple-950/80 border-purple-500 text-white font-bold'
                  : 'bg-[#151D2A] border-[#1E293B] text-slate-300 hover:bg-slate-800/80'
              }`}
            >
              <span className="text-[10px] text-purple-400 font-bold flex items-center gap-1">
                ⚖️ Commish AI
              </span>
              <span className="text-[11px] font-extrabold truncate">Official Ruling</span>
            </button>
          </div>
        </div>

        {/* Focus Mode Selector & Generate Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1 bg-[#151D2A] p-1 rounded-xl border border-[#1E293B] text-[11px]">
            <button
              onClick={() => setFocusMode('full_debrief')}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                focusMode === 'full_debrief'
                  ? 'bg-slate-800 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Debrief
            </button>
            <button
              onClick={() => setFocusMode('strategy_audit')}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                focusMode === 'strategy_audit'
                  ? 'bg-slate-800 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Strategy Audit
            </button>
            <button
              onClick={() => setFocusMode('anchor_leverage')}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                focusMode === 'anchor_leverage'
                  ? 'bg-slate-800 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              13-16 Anchors
            </button>
          </div>

          <button
            onClick={() => generateCommentary()}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Broadcasting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Commentary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Scrollable Commentary Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
        {commentary ? (
          <>
            {/* Headline Card */}
            <div className="rounded-2xl p-4 bg-gradient-to-b from-[#162133] to-[#0E1524] border border-[#23354E] relative overflow-hidden shadow-lg">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                    WEEK {commentary.weekNumber} AUDIT
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {commentary.generatedWith}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyTranscript}
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1 transition"
                    title="Copy Transcript"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px] hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                "{commentary.headline}"
              </h3>

              {/* Weekly Performance Quick Metrics */}
              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-700/60 text-center font-mono">
                <div className="bg-[#0A0F1A]/80 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Record</div>
                  <div className="text-sm font-black text-white">{commentary.statsSummary.record}</div>
                  <div className="text-[10px] text-emerald-400 font-bold">{commentary.statsSummary.accuracy}%</div>
                </div>

                <div className="bg-[#0A0F1A]/80 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Points</div>
                  <div className="text-sm font-black text-amber-300">{commentary.statsSummary.pointsEarned}</div>
                  <div className="text-[10px] text-slate-500">/ {commentary.statsSummary.pointsPossible} max</div>
                </div>

                <div className="bg-[#0A0F1A]/80 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Efficiency</div>
                  <div className="text-sm font-black text-cyan-300">{commentary.statsSummary.confidenceEfficiency}%</div>
                  <div className="text-[10px] text-slate-400">Pts/Poss</div>
                </div>

                <div className="bg-[#0A0F1A]/80 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Anchors</div>
                  <div className="text-sm font-black text-purple-300">{commentary.statsSummary.anchorRecord}</div>
                  <div className="text-[10px] text-slate-400">13-16 pts</div>
                </div>
              </div>
            </div>

            {/* Audio Speech Player Bar */}
            <div className="rounded-xl p-3 bg-[#131B2A] border border-[#1E293B] flex items-center justify-between gap-3 shadow">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={toggleSpeechAudio}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold transition shadow ${
                    isPlayingAudio
                      ? 'bg-amber-500 text-black animate-pulse'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-black'
                  }`}
                  title={isPlayingAudio ? 'Pause Broadcast Audio' : 'Play Broadcast Audio'}
                >
                  {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div>
                  <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <span>{isPlayingAudio ? 'Broadcasting Audio...' : 'Listen to Broadcast'}</span>
                    {isPlayingAudio && (
                      <span className="flex items-center gap-0.5 text-amber-400">
                        <span className="w-1 h-3 bg-amber-400 animate-pulse rounded-full"></span>
                        <span className="w-1 h-4 bg-amber-400 animate-pulse delay-75 rounded-full"></span>
                        <span className="w-1 h-2 bg-amber-400 animate-pulse delay-150 rounded-full"></span>
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Voice synthesizer tuned to on-air dialogue
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSpeechRate((prev) => (prev === 1.0 ? 1.25 : prev === 1.25 ? 1.5 : 1.0))}
                  className="px-2 py-1 rounded bg-[#0B0F17] border border-slate-700 text-[10px] font-mono text-slate-300 hover:text-white"
                  title="Playback Speed"
                >
                  {speechRate}x
                </button>
              </div>
            </div>

            {/* Radio Commentary Dialogue Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  <span>On-Air Broadcast Script</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">
                  {commentary.broadcastScript.length} exchanges
                </span>
              </div>

              <div className="space-y-2.5">
                {commentary.broadcastScript.map((turn, idx) => {
                  const isSal = turn.speaker.toLowerCase().includes('sal');
                  const isChloe = turn.speaker.toLowerCase().includes('chloe');
                  const isCommish = turn.speaker.toLowerCase().includes('commish');

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border transition leading-relaxed text-xs ${
                        isSal
                          ? 'bg-[#181512] border-orange-900/40 text-orange-50'
                          : isChloe
                          ? 'bg-[#0E1B1D] border-teal-900/40 text-teal-50'
                          : 'bg-[#171120] border-purple-900/40 text-purple-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSal
                                ? 'bg-orange-400'
                                : isChloe
                                ? 'bg-teal-400'
                                : 'bg-purple-400'
                            }`}
                          ></span>
                          <span
                            className={`font-black text-[11px] ${
                              isSal
                                ? 'text-orange-300'
                                : isChloe
                                ? 'text-teal-300'
                                : 'text-purple-300'
                            }`}
                          >
                            {turn.speaker}
                          </span>
                        </div>

                        {turn.stageDirection && (
                          <span className="text-[10px] text-slate-400 italic bg-black/40 px-2 py-0.5 rounded-md border border-slate-800">
                            [{turn.stageDirection.replace(/[\[\]]/g, '')}]
                          </span>
                        )}
                      </div>

                      <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed pl-2 border-l-2 border-slate-700/60 font-sans">
                        {turn.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strategy Effectiveness Audit Card */}
            <div className="rounded-2xl p-4 bg-[#111827] border border-[#1F2937] space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-300">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      Strategy Effectiveness Audit
                    </h4>
                    <p className="text-[10px] text-slate-400">Game-Theoretic EV & Capital Preservation</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-[9px] text-slate-400 uppercase">Strategy Grade</div>
                    <div className="text-xl font-black text-emerald-400 leading-none">
                      {commentary.strategyAssessment.grade}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-[#0A0E17] p-3 rounded-xl border border-slate-800">
                {commentary.strategyAssessment.summary}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-[#0A0E17] border border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-emerald-400" />
                      Capital Efficiency
                    </span>
                    <span className="font-mono font-bold text-white">
                      {commentary.strategyAssessment.capitalEfficiency}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400"
                      style={{ width: `${Math.min(100, commentary.strategyAssessment.capitalEfficiency)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0A0E17] border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1 mb-0.5">
                    <Target className="w-3 h-3 text-purple-400" />
                    Anchor Discipline
                  </div>
                  <div className="text-xs font-bold text-slate-200 truncate">
                    {commentary.strategyAssessment.anchorDiscipline}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0A0E17] border border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Risk/Leverage Skew:</span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {commentary.strategyAssessment.gameTheoryRiskProfile}
                </span>
              </div>
            </div>

            {/* Tactical Prescriptions for Next Week */}
            <div className="rounded-2xl p-4 bg-[#0F172A] border border-[#1E293B] space-y-2.5">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Tactical Prescriptions (Next Week's Slate)
                </h4>
              </div>

              <div className="space-y-2">
                {commentary.tacticalPrescriptions.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#0B0F17] border border-slate-800 text-xs text-slate-300"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coach & Analyst Soundbites */}
            {(commentary.salQuote || commentary.chloeQuote) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {commentary.salQuote && (
                  <div className="p-3 rounded-xl bg-orange-950/20 border border-orange-900/30 text-xs space-y-1">
                    <div className="text-[10px] font-mono font-bold text-orange-400 uppercase">
                      Coach Sal Soundbite
                    </div>
                    <p className="text-slate-300 italic">"{commentary.salQuote}"</p>
                  </div>
                )}
                {commentary.chloeQuote && (
                  <div className="p-3 rounded-xl bg-teal-950/20 border border-teal-900/30 text-xs space-y-1">
                    <div className="text-[10px] font-mono font-bold text-teal-400 uppercase">
                      Chloe's Model Note
                    </div>
                    <p className="text-slate-300 italic">"{commentary.chloeQuote}"</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 animate-bounce">
              <Radio className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-white">Generating AI Broadcast Commentary...</div>
            <p className="text-xs text-slate-400 max-w-xs">
              Gemini 3.8 Flash is analyzing confidence allocations, straight-up accuracy, and expected point values.
            </p>
          </div>
        )}
      </div>

      {/* Interactive Bottom Bar: Ask the Broadcast Crew */}
      <div className="p-3 sm:p-4 border-t border-[#1E293B] bg-[#0A0F19]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (userQuestion.trim()) {
              generateCommentary(userQuestion.trim());
              setUserQuestion('');
            }
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="Ask Sal & Chloe a question about your picks..."
              className="w-full bg-[#131B2A] border border-[#1E293B] focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none pr-8"
            />
            {userQuestion && (
              <button
                type="button"
                onClick={() => setUserQuestion('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!userQuestion.trim() || isLoading}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-extrabold text-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask Desk</span>
          </button>
        </form>
        <p className="text-[10px] text-slate-500 mt-1.5 text-center">
          Powered by Gemini 3.8 Flash • Real-time confidence mathematics and strategy evaluation
        </p>
      </div>
    </aside>
  );
};
