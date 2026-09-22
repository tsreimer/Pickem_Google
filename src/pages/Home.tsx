import React, { useState, useEffect, useRef } from 'react';
import { useTeam } from '../context/TeamContext';
import { AUDIO_TRACKS } from '../data/mockData';
import { SeasonPickAccuracyTrends } from '../components/SeasonPickAccuracyTrends';
import { LeagueTreasuryCard } from '../components/LeagueTreasuryCard';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  Flame,
  Cpu,
  Radio,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Users,
  ChevronDown,
  ChevronUp,
  FastForward,
  Clock,
  Waves,
  Zap,
  DollarSign,
} from 'lucide-react';

export const Home: React.FC = () => {
  const { currentTeam, setCurrentTeamId, setActiveTab, teams, currentWeek, setCurrentWeek } = useTeam();

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(94); // Default 94s (01:34)
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeVoiceMode, setActiveVoiceMode] = useState<'dual' | 'sal' | 'chloe' | 'commish'>('dual');
  const [showTranscript, setShowTranscript] = useState(false);
  const [audioSourceType, setAudioSourceType] = useState<'neural' | 'browser'>('neural');
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [recapData, setRecapData] = useState<any>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<number | null>(null);

  // Initialize and check for pre-generated audio on load
  useEffect(() => {
    let isMounted = true;

    async function loadWeeklyRecap() {
      try {
        setIsLoadingAudio(true);
        const res = await fetch('/api/audio/weekly-recap');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        if (isMounted && json.success) {
          setRecapData(json.data);
          if (json.audio?.hasNeuralAudio && json.audio?.audioUrl) {
            setAudioSourceType('neural');
            const audio = new Audio(json.audio.audioUrl);
            audioRef.current = audio;
            audio.onloadedmetadata = () => {
              if (audio.duration && !isNaN(audio.duration)) {
                setDuration(Math.round(audio.duration));
              }
            };
            audio.onended = () => {
              setIsPlaying(false);
              setCurrentTime(0);
            };
          } else {
            setAudioSourceType('browser');
          }
        }
      } catch (err) {
        console.warn('Could not load remote weekly recap:', err);
        setAudioSourceType('browser');
      } finally {
        if (isMounted) setIsLoadingAudio(false);
      }
    }

    loadWeeklyRecap();

    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Update timer during playback
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        if (audioRef.current && audioSourceType === 'neural') {
          setCurrentTime(Math.round(audioRef.current.currentTime));
        } else {
          setCurrentTime((prev) => {
            if (prev >= duration) {
              setIsPlaying(false);
              return 0;
            }
            return prev + 1;
          });
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration, audioSourceType]);

  // Primary Play / Pause Handler
  const handleTogglePlay = async () => {
    if (isPlaying) {
      // Pause
      if (audioRef.current && audioSourceType === 'neural') {
        audioRef.current.pause();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.pause();
      }
      setIsPlaying(false);
    } else {
      // Start or Resume
      if (audioRef.current && audioSourceType === 'neural') {
        try {
          audioRef.current.playbackRate = playbackRate;
          audioRef.current.muted = isMuted;
          await audioRef.current.play();
          setIsPlaying(true);
          return;
        } catch (e) {
          console.warn('Neural audio playback failed, falling back to speech synthesis:', e);
          setAudioSourceType('browser');
        }
      }

      // Fallback: Browser Speech Synthesis
      playSpeechSynthesis();
    }
  };

  // Browser Speech Synthesis Engine
  const playSpeechSynthesis = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    const track = AUDIO_TRACKS[0];
    let textToSpeak = '';

    if (activeVoiceMode === 'sal') {
      textToSpeak = "Dis is Coach Sal Ditkofsky! Good evening Chicago! Eleven out of twelve managers in the league got taken behind the woodshed by San Francisco in SoFi Stadium! Shoeman put his number one sixteen-point anchor right on the Rams! Boom, down goes Frazier! But Todd Reimer held all seven top confidence anchors on heavy favorites. Put double giardiniera on da victory beef!";
    } else if (activeVoiceMode === 'chloe') {
      textToSpeak = "Dr. Chloe Vance reporting from MIT Sloan Analytics. A staggering 114 aggregate confidence points vaporized at SoFi. Orange crush executed the lone 49ers upset for plus-10 to seize first place. However, Todd Reimer preserved 91 confidence points on heavy favorites, giving him the highest Monte Carlo win equity in the league.";
    } else if (activeVoiceMode === 'commish') {
      textToSpeak = "Official Initech Invitational Carnage Report. Eleven of twelve franchises burned on the Rams. Orange crush leads with 26 points. Todd Reimer holds a league-best recovery index with all top seven anchors live for 127 maximum remaining points.";
    } else {
      // Dual show banter
      textToSpeak = track.dialogueTurns
        .map((t) => `${t.speaker === 'Sal' ? 'Coach Sal' : 'Doctor Chloe'} says: ${t.text.replace(/\[.*?\]/g, '')}`)
        .join('. ');
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = playbackRate;
    utterance.pitch = activeVoiceMode === 'sal' ? 0.85 : activeVoiceMode === 'chloe' ? 1.15 : 1.0;

    // Pick suitable voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferred = voices.find((v) => v.lang.startsWith('en')) || voices[0];
      utterance.voice = preferred;
    }

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  // Reset Audio
  const handleResetAudio = () => {
    if (audioRef.current && audioSourceType === 'neural') {
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setCurrentTime(0);
    setIsPlaying(false);
  };

  // Speed Toggle
  const handleSpeedToggle = () => {
    const nextRate = playbackRate === 1.0 ? 1.25 : playbackRate === 1.25 ? 1.5 : 1.0;
    setPlaybackRate(nextRate);
    if (audioRef.current && audioSourceType === 'neural') {
      audioRef.current.playbackRate = nextRate;
    }
    if (isPlaying && audioSourceType === 'browser') {
      window.speechSynthesis.cancel();
      playSpeechSynthesis();
    }
  };

  // Mute Toggle
  const handleMuteToggle = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioRef.current && audioSourceType === 'neural') {
      audioRef.current.muted = nextMute;
    }
  };

  // Seek bar click
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSec = Number(e.target.value);
    setCurrentTime(newSec);
    if (audioRef.current && audioSourceType === 'neural') {
      audioRef.current.currentTime = newSec;
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Team Selection Handler -> Direct to Strategist
  const handleSelectTeamAndNavigate = (teamId: string) => {
    setCurrentTeamId(teamId);
    setActiveTab('strategist');
  };

  const defaultTrack = AUDIO_TRACKS[0];

  return (
    <div className="space-y-10 pb-16">
      {/* =========================================================================
          1. HERO SECTION: Welcoming, Clean, High-Prestige Overview
      ========================================================================= */}
      <section className="text-center max-w-4xl mx-auto pt-4 pb-2">
        {/* League Pill Badges & Global Week Selector */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 p-1.5 px-3 rounded-full bg-[#151D2A] border border-[#1E293B] text-xs font-semibold text-slate-300 shadow-sm">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{currentWeek === 2 ? 'Week 2 Complete (Official Final Standings)' : 'Week 1 Wrap (Final Standings)'}</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-purple-300">The Initech Invitational</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Gemini 3.1 Flash Neural Audio
            </span>
          </div>

          {/* Quick Slate Toggle Pill */}
          <div className="inline-flex items-center gap-1 bg-[#0B0F17] border border-[#1E293B] p-1 rounded-full text-xs font-mono">
            <span className="text-slate-400 px-2 text-[10px] font-bold uppercase">Slate:</span>
            <button
              onClick={() => setCurrentWeek(1)}
              className={`px-3 py-1 rounded-full font-bold text-xs transition cursor-pointer ${
                currentWeek === 1
                  ? 'bg-purple-600 text-white shadow font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Week 1 (Final)
            </button>
            <button
              onClick={() => setCurrentWeek(2)}
              className={`px-3 py-1 rounded-full font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                currentWeek === 2
                  ? 'bg-emerald-500 text-black shadow font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              Week 2 (Final)
            </button>
          </div>
        </div>

        {/* Big Bold Headline */}
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight sm:leading-none mb-4">
          Initech Invitational{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            Gridiron Hub
          </span>
        </h1>

        {/* Narrative Mission Subtext */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          The official high-stakes confidence pool audio dispatch & game-theory intelligence center. Listen to the weekly recap below, or select your franchise to enter your custom war room.
        </p>

        {/* Quick Meta Stats Strip */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-4 border-t border-[#1E293B]/60 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>12 Active Franchises</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Pre-Cached Instant Audio</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>PuLP ILP Solver Engine</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>$600 League Purse ($25/wk)</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. FEATURED CENTERPIECE CARD: The Weekly Audio Recap
      ========================================================================= */}
      <section className="relative rounded-2xl bg-gradient-to-b from-[#161F30] via-[#111827] to-[#0D121D] border-2 border-emerald-500/40 p-6 sm:p-8 shadow-2xl shadow-emerald-950/20 overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          {/* Header Row: On-Air Indicator & Show Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-700/60 text-[11px] font-mono font-bold text-emerald-300 uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  FINAL • {currentWeek === 2 ? 'WEEK 2 CHAMPION CROWNED' : 'WEEK 1 FINAL RECAP'}
                </span>
                <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700">
                  {currentWeek === 2 ? 'Episode 2 • 16 of 16 Games Settled' : 'Episode 1 • 01:34 Pre-Generated'}
                </span>
                <span className="text-xs font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 hidden sm:inline-block">
                  ⚡ 24kHz Neural Audio
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {currentWeek === 2
                  ? 'Halsted & Ivy: Week 2 Official Wrap — Bird Boss Triumphs with 104 Pts'
                  : 'Halsted & Ivy: Week 1 Recap & SoFi Bloodbath'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Featuring <strong className="text-orange-400">Coach Sal Ditkofsky</strong> (Bridgeport Chicago) & <strong className="text-cyan-400">Dr. Chloe Vance</strong> (MIT Sloan Sports Analytics)
              </p>
            </div>

            {/* Host Filter Badges */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl self-start sm:self-center">
              <button
                onClick={() => {
                  setActiveVoiceMode('dual');
                  if (isPlaying) {
                    handleResetAudio();
                  }
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeVoiceMode === 'dual'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Full Dual-Host Broadcast"
              >
                <span>🎙️</span>
                <span>Sal & Chloe</span>
              </button>
              <button
                onClick={() => {
                  setActiveVoiceMode('sal');
                  if (isPlaying) {
                    handleResetAudio();
                  }
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeVoiceMode === 'sal'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Coach Sal Hot Take"
              >
                <span>🥩</span>
                <span className="hidden sm:inline">Coach</span> Sal
              </button>
              <button
                onClick={() => {
                  setActiveVoiceMode('chloe');
                  if (isPlaying) {
                    handleResetAudio();
                  }
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeVoiceMode === 'chloe'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Dr. Chloe MIT Analytics"
              >
                <span>📊</span>
                <span className="hidden sm:inline">Dr.</span> Chloe
              </button>
            </div>
          </div>

          {/* Written Narrative Summary Box */}
          <div className="bg-[#0D131F]/90 rounded-xl border border-[#1E293B] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Waves className="w-4 h-4" />
                <span>Executive Written Recap (Week {currentWeek})</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {currentWeek === 2
                  ? 'All 16 Games Final • Official Yahoo Group ID# 13003 Verified'
                  : 'Carnage Index: 114 Pts Lost in Week 1'}
              </span>
            </div>

            {currentWeek === 2 ? (
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                Week 2 has officially concluded across all 16 games! <strong className="text-amber-400 font-bold">Amy (Bird Boss)</strong> engineered an unbelievable week, capturing sole 1st place with <strong className="text-white font-bold">104 points</strong> and claiming the entire <strong className="text-emerald-400 font-bold">$25.00 weekly purse</strong>. Her winning masterpiece was staking a bold <strong className="text-amber-300">15-point confidence anchor</strong> on the underdog Las Vegas Raiders, while also cashing SF (16) and KC (11). <strong className="text-cyan-300 font-bold">Steve (Shoeman)</strong> captured runner-up at <strong className="text-white">99 points</strong> after cashing Buffalo (16) and SF (15). Todd Reimer weathered heavy pool upsets to finish with <strong className="text-white">69 points</strong>, cashing his top anchor on San Francisco (16) and late anchors on KC (11) and LAR (13).
              </p>
            ) : (
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                What a brutal opening week in the Initech Invitational. Eleven out of twelve managers assigned high confidence to Matthew Stafford and the Rams, only to watch Kyle Shanahan's 49ers pull off a 24–21 road upset that incinerated <strong className="text-red-400 font-bold">114 aggregate confidence points</strong>. Co-Champions Cory & Dalton split the $25 purse with 102 points each.
              </p>
            )}

            {/* Scannable Highlights Grid */}
            {currentWeek === 2 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                  <span className="text-xl">🏆</span>
                  <div>
                    <h4 className="text-xs font-bold text-amber-400">Bird Boss Champion</h4>
                    <p className="text-[11px] text-slate-300">
                      Amy hits 104 pts ($25 purse) powered by a legendary 15-pt Las Vegas underdog cash!
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                  <span className="text-xl">🥈</span>
                  <div>
                    <h4 className="text-xs font-bold text-cyan-400">Shoeman Runner-Up</h4>
                    <p className="text-[11px] text-slate-300">
                      Steve tallies 99 pts, cashing BUF [16], SF [15], and Sea [12] for a strong podium spot.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                  <span className="text-xl">🥉</span>
                  <div>
                    <h4 className="text-xs font-bold text-blue-400">BroncosCountry 3rd</h4>
                    <p className="text-[11px] text-slate-300">
                      Patrick secures 96 pts, nailing SF [16] and grabbing the CIN [3] underdog point swing.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                  <span className="text-xl">💰</span>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400">$25 Purse Awarded</h4>
                    <p className="text-[11px] text-slate-300">
                      Amy claims the full $25 prize with sole possession of first place at 104 pts.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                  <span className="text-xl">🏆</span>
                  <div>
                    <h4 className="text-xs font-bold text-orange-400">Co-Champions Split</h4>
                    <p className="text-[11px] text-slate-300">
                      Cory & Dalton tied at 102 pts each, splitting the $25 Week 1 pot ($12.50 ea).
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                  <span className="text-xl">💀</span>
                  <div>
                    <h4 className="text-xs font-bold text-red-400">Shoeman Crushed</h4>
                    <p className="text-[11px] text-slate-300">
                      Lost #1 16-pt anchor on LAR; finished 8th in Week 1 standings with 83 pts.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                  <span className="text-xl">🥩</span>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400">Todd Reimer 3rd</h4>
                    <p className="text-[11px] text-slate-300">
                      Preserved top anchors on heavy favorites to lock in 98 pts for a strong podium finish.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                  <span className="text-xl">🛡️</span>
                  <div>
                    <h4 className="text-xs font-bold text-blue-400">Master Hedge</h4>
                    <p className="text-[11px] text-slate-300">
                      PatN risked only 1 pt on LAR, finishing top 4 with 96 points.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =====================================================================
              PRIMARY AUDIO PLAYER CONTROLS: Large, Big Button & Scrubber
          ===================================================================== */}
          <div className="p-5 sm:p-6 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Massive Primary Play/Pause Button */}
              <button
                onClick={handleTogglePlay}
                disabled={isLoadingAudio}
                className="w-full sm:w-auto px-6 sm:px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-black font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-6 h-6 text-black fill-current" />
                    <span>Pause Weekly Recap</span>
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 text-black fill-current group-hover:translate-x-0.5 transition-transform" />
                    <span>Listen to Full Weekly Recap</span>
                    <span className="text-xs font-mono font-bold bg-black/20 px-2 py-0.5 rounded text-black ml-1">
                      {defaultTrack.duration}
                    </span>
                  </>
                )}
              </button>

              {/* Player Status & Equalizer Waves */}
              <div className="flex items-center gap-4 text-xs font-mono">
                {isPlaying && (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                    <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span className="w-1.5 h-6 bg-emerald-400 rounded-full animate-pulse delay-75"></span>
                    <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-pulse delay-150"></span>
                    <span className="w-1.5 h-5 bg-emerald-400 rounded-full animate-pulse delay-100"></span>
                    <span className="ml-2 font-bold font-sans">Playing Pre-Cached Audio</span>
                  </div>
                )}

                {/* Auxiliary Controls: Reset, Speed, Mute */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleResetAudio}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Restart Audio"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSpeedToggle}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    title="Toggle Speed"
                  >
                    {playbackRate}x
                  </button>
                  <button
                    onClick={handleMuteToggle}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Audio Timeline Scrubber Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span className="text-slate-500">
                  {audioSourceType === 'neural' ? '⚡ Pre-Cached Gemini Neural Engine' : '🎙️ High-Def Voice Bridge'}
                </span>
                <span>{formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Collapsible Full Transcript Toggle */}
            <div className="pt-2 border-t border-slate-800/60">
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-slate-200 transition py-1"
              >
                <span className="flex items-center gap-1.5">
                  <span>📜</span>
                  <span>{showTranscript ? 'Hide Show Transcript' : 'Read Full Broadcast Transcript'}</span>
                </span>
                {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showTranscript && (
                <div className="mt-3 p-4 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-3 max-h-64 overflow-y-auto">
                  {defaultTrack.dialogueTurns.map((turn, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className={turn.speaker === 'Sal' ? 'text-orange-400 font-bold' : 'text-cyan-400 font-bold'}>
                          {turn.speaker === 'Sal' ? 'Coach Sal Ditkofsky' : 'Dr. Chloe Vance'}
                        </strong>
                        <span className="text-[10px] text-slate-500 italic">[{turn.stageDirection}]</span>
                      </div>
                      <p className="text-slate-300 pl-2 border-l-2 border-slate-700 leading-relaxed">
                        {turn.text.replace(/\[.*?\]/g, '').trim()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. HISTORICAL PICK ACCURACY TRENDS (RECHARTS VISUALIZATION)
      ========================================================================= */}
      <SeasonPickAccuracyTrends />

      {/* =========================================================================
          3b. LEAGUE TREASURY & 2026-2027 PAYOUT SCHEDULE (VENMO @Todd-Reimer)
      ========================================================================= */}
      <LeagueTreasuryCard />

      {/* =========================================================================
          4. "CHOOSE YOUR TEAM" SECTION: Large, Highly-Polished Franchise Cards
      ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4" />
              <span>Step Inside The War Council</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Choose Your Team
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Select your franchise to jump directly into your custom War Room Strategist portal with personalized coach advice, Monte Carlo clinch odds, and confidence math.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400 bg-[#151D2A] border border-[#1E293B] px-3 py-1.5 rounded-lg self-start sm:self-auto">
            12 Franchises in the League
          </div>
        </div>

        {/* The Grid of 12 Team Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {teams.map((team) => {
            const isSelected = currentTeam.id === team.id;

            return (
              <div
                key={team.id}
                className={`relative rounded-xl p-5 transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#152332] border-2 border-emerald-500 shadow-xl shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                    : 'bg-[#121824] border border-[#1E293B] hover:border-slate-600 hover:bg-[#151D2B]'
                }`}
              >
                {/* Active Franchise Badge */}
                {isSelected && (
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider shadow-md">
                    👑 Your Active Team
                  </div>
                )}

                <div>
                  {/* Top Row: Avatar, Team Info, Rank */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-black shadow-md shrink-0"
                        style={{ backgroundColor: team.color }}
                      >
                        {team.avatar}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white leading-tight">
                          {team.teamName}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">
                          Owner: <span className="text-slate-200">{team.ownerName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        Rank #{team.rank}
                      </span>
                      <div className="text-xs font-mono font-bold text-emerald-400 mt-1">
                        {team.lockedPoints} pts
                      </div>
                    </div>
                  </div>

                  {/* Status & Tactical Posture Pill */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                        team.id === 'team-orange'
                          ? 'bg-orange-950/80 border-orange-700 text-orange-300'
                          : team.id === 'team-shoeman'
                          ? 'bg-red-950/80 border-red-700 text-red-300'
                          : team.id === 'team-todd'
                          ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                          : team.id === 'team-broncos'
                          ? 'bg-blue-950/80 border-blue-700 text-blue-300'
                          : 'bg-slate-900/80 border-slate-700 text-slate-300'
                      }`}
                    >
                      {team.statusText}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Max: <strong className="text-white">{team.maxPossible}</strong>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Net EV: <strong className="text-emerald-400">{team.netEV >= 0 ? `+${team.netEV}` : team.netEV}</strong>
                    </span>
                  </div>

                  {/* Fun Flavor Tagline */}
                  <p className="text-xs text-slate-400 italic mb-4">
                    "{team.tagline}"
                  </p>
                </div>

                {/* Big Action Button: Select and enter Strategist */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleSelectTeamAndNavigate(team.id)}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 hover:bg-emerald-500 hover:text-black text-white'
                    }`}
                  >
                    <span>Open Strategist Advice</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTeamId(team.id);
                      setActiveTab('war-room');
                    }}
                    className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition"
                    title="Jump to War Room Sweat"
                  >
                    <Flame className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTeamId(team.id);
                      setActiveTab('watercooler');
                    }}
                    className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-purple-400 transition"
                    title="Jump to Watercooler Show"
                  >
                    <Radio className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          4. FOOTER QUICK NAV: Easy Navigation to Other Sections
      ========================================================================= */}
      <section className="p-6 rounded-xl bg-[#121824] border border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-bold text-white">Looking for deeper analysis?</h4>
          <p className="text-xs text-slate-400">
            Explore live RedZone probability sweat tracking, AI postgame shows, and historic franchise trophies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-center">
          <button
            onClick={() => setActiveTab('war-room')}
            className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>The War Room</span>
          </button>
          <button
            onClick={() => setActiveTab('strategist')}
            className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>The Strategist</span>
          </button>
          <button
            onClick={() => setActiveTab('watercooler')}
            className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5 text-purple-400" />
            <span>The Watercooler</span>
          </button>
        </div>
      </section>
    </div>
  );
};
