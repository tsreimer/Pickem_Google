import React, { useState, useRef, useEffect } from 'react';
import { useTeam } from '../context/TeamContext';
import { speechEngine } from '../utils/speechEngine';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  HelpCircle,
  Radio,
  Sliders,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Zap,
} from 'lucide-react';

export interface CoachAdviceData {
  coach: 'sal' | 'chloe' | 'commish';
  coachName: string;
  teamId: string;
  teamName: string;
  ownerName: string;
  currentRank: number;
  question: string;
  headline: string;
  verbalAdvice: string;
  bulletPoints: string[];
  goldenRule: string;
  recommendedPicks: Array<{
    matchup: string;
    recommendedTeam: string;
    confidenceTier: string;
    rationale: string;
  }>;
  chloePerspective: string;
  source?: string;
  generatedWith?: string;
  timestamp?: string;
}

const PRESET_QUESTIONS = [
  {
    category: 'Anchor Strategy',
    icon: '🎯',
    text: 'How should I allocate my 14 to 16 point anchor picks this week?',
  },
  {
    category: 'Chasing the Lead',
    icon: '🚀',
    text: 'What is the best leverage strategy to catch the pool leader without blowing up my card?',
  },
  {
    category: 'Primetime Games',
    icon: '⚡',
    text: 'How should I handle volatile Thursday night and Monday night games in my confidence ladder?',
  },
  {
    category: 'Chalk Traps',
    icon: '⚠️',
    text: 'How do I identify dead public chalk traps before locking in my picks?',
  },
  {
    category: 'Portfolio Audit',
    icon: '🛡️',
    text: 'Analyze my 16-game confidence portfolio vulnerabilities and where I can gain expected value.',
  },
  {
    category: 'Golden Rule',
    icon: '👑',
    text: 'What is Coach Sal’s number one golden rule for winning high-stakes confidence pools?',
  },
];

interface AskCoachAdviceProps {
  onPostToChat?: (text: string) => void;
  selectedTeamId?: string;
}

export const AskCoachAdvice: React.FC<AskCoachAdviceProps> = ({
  onPostToChat,
  selectedTeamId,
}) => {
  const { currentTeam, teams, addComment } = useTeam();

  const activeTeam = teams.find((t) => t.id === (selectedTeamId || currentTeam?.id)) || currentTeam || teams[0];

  const [selectedCoach, setSelectedCoach] = useState<'sal' | 'chloe' | 'commish'>('sal');
  const [questionText, setQuestionText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [adviceData, setAdviceData] = useState<CoachAdviceData | null>(null);

  // Voice recognition (Web Speech API)
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Audio Speech Synthesis Playback
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(-1);
  const [totalSentences, setTotalSentences] = useState<number>(0);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);

  // Setup Web Speech Recognition if available in browser
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuestionText(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice dictation is not supported in this browser. Please type your question.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch {
        setIsListening(false);
      }
    }
  };

  // Submit question to /api/coach/ask-advice
  const handleAskCoach = async (queryToAsk?: string) => {
    const q = (queryToAsk !== undefined ? queryToAsk : questionText).trim();
    if (!q) return;

    setIsLoading(true);
    // Stop any active speech
    speechEngine.stop();
    setIsPlayingAudio(false);
    setActiveSentenceIndex(-1);

    try {
      const res = await fetch('/api/coach/ask-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          coach: selectedCoach,
          teamId: activeTeam.id,
          weekNumber: 2,
        }),
      });

      const data = await res.json();
      if (data.advice) {
        setAdviceData(data.advice);
      }
    } catch (err) {
      console.warn('Error querying coach advice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate initial advice if none exists
  useEffect(() => {
    if (!adviceData) {
      handleAskCoach(PRESET_QUESTIONS[0].text);
    }
  }, [selectedTeamId]);

  // Audio Playback Controls via speechEngine
  const handlePlayAudio = () => {
    if (!adviceData) return;

    if (isPlayingAudio) {
      speechEngine.stop();
      setIsPlayingAudio(false);
      setActiveSentenceIndex(-1);
      return;
    }

    const scriptToSpeak = `${adviceData.headline}. ${adviceData.verbalAdvice}. Golden Rule: ${adviceData.goldenRule}`;

    speechEngine.speakScript(scriptToSpeak, {
      speaker: selectedCoach,
      rate: speechSpeed,
      onStart: () => {
        setIsPlayingAudio(true);
      },
      onSentenceChange: (index, _, total) => {
        setActiveSentenceIndex(index);
        setTotalSentences(total);
      },
      onEnd: () => {
        setIsPlayingAudio(false);
        setActiveSentenceIndex(-1);
      },
      onError: () => {
        setIsPlayingAudio(false);
        setActiveSentenceIndex(-1);
      },
    });
  };

  const handleStopAudio = () => {
    speechEngine.stop();
    setIsPlayingAudio(false);
    setActiveSentenceIndex(-1);
  };

  const handleSpeedToggle = () => {
    const speeds = [1.0, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(speechSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setSpeechSpeed(nextSpeed);
    if (isPlayingAudio && adviceData) {
      speechEngine.stop();
      setTimeout(() => {
        handlePlayAudio();
      }, 100);
    }
  };

  // Share advice to league chat
  const handleShareToWatercooler = () => {
    if (!adviceData) return;

    const message = `🎙️ [COACH'S CHALK TALK] ${adviceData.coachName} on "${adviceData.question}":\n"${adviceData.verbalAdvice}"\n👑 Golden Rule: ${adviceData.goldenRule}`;

    if (onPostToChat) {
      onPostToChat(message);
    } else {
      addComment({
        author: activeTeam.ownerName,
        teamName: activeTeam.teamName,
        teamId: activeTeam.id,
        content: message,
      });
    }

    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  return (
    <div className="bg-[#0B0F17] border-2 border-amber-500/40 rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-6">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Persona Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 animate-pulse text-red-500" />
            <span>Interactive Chalk Talk & Tactical Consultation</span>
            <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/80 text-[10px] text-amber-300">
              Live AI Advisor
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Ask the Coach: Tactical Pick Strategy</span>
          </h3>
          <p className="text-xs text-slate-400">
            Get blunt, decisive pick advice, confidence tiering rules, and matchup breakdowns for{' '}
            <strong className="text-amber-300">{activeTeam.ownerName}</strong> (Rank #{activeTeam.rank || 8}).
          </p>
        </div>

        {/* Coach / Strategist Selector Tabs */}
        <div className="flex items-center gap-2 bg-[#121824] p-1.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setSelectedCoach('sal');
              speechEngine.stop();
              setIsPlayingAudio(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedCoach === 'sal'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/60 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🥩 Coach Sal</span>
            <span className="text-[10px] hidden sm:inline opacity-80">(Chicago Grit)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedCoach('chloe');
              speechEngine.stop();
              setIsPlayingAudio(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedCoach === 'chloe'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-950/60 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📊 Dr. Chloe</span>
            <span className="text-[10px] hidden sm:inline opacity-80">(MIT Analytics)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedCoach('commish');
              speechEngine.stop();
              setIsPlayingAudio(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedCoach === 'commish'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-950/60 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>⚖️ The Commish</span>
            <span className="text-[10px] hidden sm:inline opacity-80">(Official Ruling)</span>
          </button>
        </div>
      </div>

      {/* Preset Strategic Questions Bar (1-Click) */}
      <div className="space-y-2 relative z-10">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>POPULAR STRATEGIC TOPICS (TAP TO ASK):</span>
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">1-Click Tactical Advice</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {PRESET_QUESTIONS.map((pq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuestionText(pq.text);
                handleAskCoach(pq.text);
              }}
              className="p-2.5 rounded-xl bg-[#121926] hover:bg-[#182335] border border-slate-800 hover:border-amber-500/50 text-left transition flex items-start gap-2.5 group cursor-pointer"
            >
              <span className="text-base shrink-0 group-hover:scale-110 transition-transform">
                {pq.icon}
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wide">
                  {pq.category}
                </div>
                <div className="text-xs font-semibold text-slate-300 group-hover:text-white line-clamp-2 leading-snug">
                  {pq.text}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Question Input Form & Speech-to-Text Button */}
      <div className="relative z-10 bg-[#121824] p-3 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAskCoach();
            }}
            placeholder={`Ask ${selectedCoach === 'sal' ? 'Coach Sal' : selectedCoach === 'chloe' ? 'Dr. Chloe' : 'The Commish'} for advice on picks, anchors, matchups, or leverage...`}
            className="flex-1 bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-amber-500 placeholder-slate-500"
          />

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-lg border transition flex items-center justify-center cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white border-red-400 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title={isListening ? 'Listening... click to stop' : 'Click to speak question'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Submit Button */}
          <button
            type="button"
            onClick={() => handleAskCoach()}
            disabled={isLoading || !questionText.trim()}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm transition shadow-lg shadow-amber-950/50 flex items-center gap-1.5 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Strategizing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Ask Coach</span>
              </>
            )}
          </button>
        </div>

        {isListening && (
          <div className="flex items-center gap-2 text-xs text-red-400 font-mono animate-pulse pl-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Listening to your voice... speak your question clearly</span>
          </div>
        )}
      </div>

      {/* Coach Advice Response Display Card */}
      {adviceData && (
        <div className="space-y-5 relative z-10 animate-in fade-in duration-300">
          
          {/* Main Speech & Persona Card */}
          <div className="bg-[#121926] border border-[#1E293B] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
            {/* Top Bar of Response */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">
                  {adviceData.coach === 'sal' ? '🥩' : adviceData.coach === 'chloe' ? '📊' : '⚖️'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-white">{adviceData.coachName}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      On-Air Tactical Briefing
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Question: "{adviceData.question}"
                  </div>
                </div>
              </div>

              {/* Audio Controls & Share Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePlayAudio}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Voice</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Listen to {adviceData.coach === 'sal' ? 'Coach Sal' : 'Speaker'}</span>
                    </>
                  )}
                </button>

                {isPlayingAudio && (
                  <>
                    <button
                      type="button"
                      onClick={handleStopAudio}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                      title="Reset Audio"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleSpeedToggle}
                      className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold"
                      title="Toggle Speed"
                    >
                      {speechSpeed}x
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleShareToWatercooler}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition cursor-pointer"
                  title="Share Coach Advice to League Watercooler"
                >
                  {shareSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Posted!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Post to Chat</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Headline */}
            <h4 className="text-base sm:text-lg font-black text-amber-300 tracking-tight leading-snug">
              {adviceData.headline}
            </h4>

            {/* Verbal Advice Transcript */}
            <div className="bg-[#0B0F17] rounded-xl p-4 border border-slate-800/80 text-sm text-slate-200 leading-relaxed font-sans relative">
              {isPlayingAudio && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800 text-xs font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>ON AIR: Speaking sentence {activeSentenceIndex + 1} of {totalSentences || '...'}</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{adviceData.verbalAdvice}</p>
            </div>

            {/* Tactical Game Plan Rules (Bullet Points) */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Coach's Tactical Pick Directives:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {adviceData.bulletPoints.map((bp, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {i + 1}
                    </span>
                    <span>{bp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Signature Golden Rule Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/60 to-orange-950/40 border border-amber-500/40 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 text-lg">
                👑
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                  Signature Rule of Thumb
                </div>
                <div className="text-xs sm:text-sm font-black text-white">
                  "{adviceData.goldenRule}"
                </div>
              </div>
            </div>

            {/* Recommended Matchup Picks Table */}
            {adviceData.recommendedPicks && adviceData.recommendedPicks.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  <span>Recommended Slate Allocations & Matchup Logic:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {adviceData.recommendedPicks.map((pick, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-slate-400">{pick.matchup}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono font-black text-[10px]">
                          {pick.recommendedTeam}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono font-bold text-amber-400">
                        {pick.confidenceTier}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-snug">
                        {pick.rationale}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dr. Chloe's Quantitative Counter-Note */}
            {adviceData.chloePerspective && (
              <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-800/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-300 shrink-0 text-sm">
                  📊
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] font-mono font-bold text-teal-400 uppercase">
                    Dr. Chloe Vance • Quantitative EV Perspective
                  </div>
                  <div className="text-xs text-teal-200/90 leading-relaxed">
                    {adviceData.chloePerspective}
                  </div>
                </div>
              </div>
            )}

            {/* Metadata Footer */}
            <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
              <span>Advisor: {adviceData.generatedWith || 'Initech Tactical Engine'}</span>
              <span>Updated: {adviceData.timestamp ? new Date(adviceData.timestamp).toLocaleTimeString() : 'Just now'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
