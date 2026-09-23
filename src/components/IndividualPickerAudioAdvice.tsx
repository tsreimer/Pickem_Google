import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTeam } from '../context/TeamContext';
import { useAudioProfile } from '../context/AudioProfileContext';
import { audioPreGenerationService } from '../services/audioPreGenerationService';
import { speechEngine } from '../utils/speechEngine';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Sliders,
  ShieldCheck,
  Flame,
  Zap,
  Mic,
  Users,
  MessageSquare,
  RefreshCw,
  Radio,
} from 'lucide-react';

import {
  PickerAdviceProfile,
  INDIVIDUAL_PICKERS_ADVICE,
  getPickerAdviceProfile,
  getPickerSpeakerAdvice,
} from '../data/pickerAdviceData';
export type { PickerAdviceProfile };
export { INDIVIDUAL_PICKERS_ADVICE };

interface IndividualPickerAudioAdviceProps {
  initialSelectedPickerId?: string;
  onPostAdviceToChat?: (text: string) => void;
  mode?: 'private_portal' | 'picker_carousel';
  onPickerChange?: (pickerId: string) => void;
  onAskCoachClick?: () => void;
}

export const IndividualPickerAudioAdvice: React.FC<IndividualPickerAudioAdviceProps> = ({
  initialSelectedPickerId = 'team-todd',
  onPostAdviceToChat,
  mode = 'private_portal',
  onPickerChange,
  onAskCoachClick,
}) => {
  const { currentTeam, teams, setCurrentTeamId, addComment } = useTeam();
  const { profile: activeProfile, primaryHost, coHost } = useAudioProfile();
  const [selectedPickerId, setSelectedPickerId] = useState<string>(
    initialSelectedPickerId || currentTeam?.id || 'team-todd'
  );
  const [selectedSpeaker, setSelectedSpeaker] = useState<'sal' | 'chloe' | 'commish'>('sal');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(38);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [isPreloaded, setIsPreloaded] = useState<boolean>(false);
  const [synthesisNotice, setSynthesisNotice] = useState<string | null>(null);
  const [audioUrlCache, setAudioUrlCache] = useState<Record<string, string>>({});
  const [ttsQuotaExceeded, setTtsQuotaExceeded] = useState<boolean>(false);
  const [isHighDemand, setIsHighDemand] = useState<boolean>(false);
  const [ttsNotice, setTtsNotice] = useState<string | null>(null);
  const [activeModelUsed, setActiveModelUsed] = useState<string>('gemini-3.8-flash-tts');
  const [sharedNotice, setSharedNotice] = useState<string | null>(null);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(-1);
  const [totalSentences, setTotalSentences] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const inFlightPreloadsRef = useRef<Set<string>>(new Set());

  // Check TTS engine quota status on load
  useEffect(() => {
    fetch('/api/tts/status')
      .then(res => res.json())
      .then(data => {
        if (data.quotaExceeded) {
          setTtsQuotaExceeded(true);
          setTtsNotice(data.freeTierDailyQuotaNotice || 'Gemini 3.1 Flash TTS free-tier 10 requests/day quota limit reached.');
        }
      })
      .catch(() => {});
  }, []);

  // Sync if initialSelectedPickerId or currentTeam changes
  useEffect(() => {
    if (initialSelectedPickerId && initialSelectedPickerId !== selectedPickerId) {
      setSelectedPickerId(initialSelectedPickerId);
    }
  }, [initialSelectedPickerId]);

  const handleSelectPicker = (id: string) => {
    setSelectedPickerId(id);
    if (onPickerChange) {
      onPickerChange(id);
    }
    // Also update team context so the whole app stays in sync with this manager's identity
    setCurrentTeamId(id);
  };

  const currentProfile =
    INDIVIDUAL_PICKERS_ADVICE.find(p => p.teamId === selectedPickerId) ||
    INDIVIDUAL_PICKERS_ADVICE[0];

  const currentAdvice =
    selectedSpeaker === 'sal'
      ? currentProfile.salAdvice
      : selectedSpeaker === 'chloe'
      ? currentProfile.chloeAdvice
      : currentProfile.commishAdvice;

  // Speaker metadata
  const speakerMeta = {
    sal: {
      name: primaryHost.speaker || 'Coach Sal Ditkofsky',
      title: primaryHost.title || 'South-Side Chicago Beef Stand Owner & 1985 Bears Disciple',
      avatar: primaryHost.avatar || '🥩',
      voiceName: primaryHost.voiceName || 'Fenrir',
      color: '#EA580C',
      styleTag: activeProfile.directorsNotes?.accent || 'Mike Ditka Accent • Tough Love & Intangibles',
    },
    chloe: {
      name: coHost.speaker || 'Dr. Chloe Vance',
      title: coHost.title || 'MIT Sloan Sports Analytics Director & NextGen Stats Lead',
      avatar: coHost.avatar || '📊',
      voiceName: coHost.voiceName || 'Kore',
      color: '#06B6D4',
      styleTag: activeProfile.directorsNotes?.style || 'Ivy League Precision • Expected Points Added & EV',
    },
    commish: {
      name: 'The Commish AI',
      title: 'Initech Invitational Automated Ruling Engine',
      avatar: '🤖',
      voiceName: 'Puck',
      color: '#A855F7',
      styleTag: 'Official League Directive • Statistical Reality Check',
    },
  }[selectedSpeaker];

  // Pre-load audio in background for zero-buffering playback
  const preloadAudio = useCallback(async (speaker: 'sal' | 'chloe' | 'commish', pickerId: string) => {
    const cacheKey = `${pickerId}-${speaker}`;
    if (audioUrlCache[cacheKey]) {
      setIsPreloaded(true);
      return;
    }

    // Check Audio Pre-Generation Service for instantly cached briefing
    const cachedBriefing = audioPreGenerationService.getCachedBriefing(pickerId, speaker);
    if (cachedBriefing) {
      if (cachedBriefing.hasNeuralAudio && cachedBriefing.audioUrl) {
        setAudioUrlCache(prev => ({ ...prev, [cacheKey]: cachedBriefing.audioUrl! }));
        setSynthesisNotice('⚡ Gemini Neural Audio Ready (0ms Buffer Delay)');
        if (audioRef.current && selectedSpeaker === speaker && selectedPickerId === pickerId) {
          audioRef.current.src = cachedBriefing.audioUrl!;
        }
      } else {
        setAudioUrlCache(prev => ({ ...prev, [cacheKey]: 'SPEECH_SYNTHESIS_READY' }));
        setSynthesisNotice(`🎙️ High-Definition Voice Ready (${speakerMeta.name})`);
        if (audioRef.current && selectedSpeaker === speaker && selectedPickerId === pickerId) {
          audioRef.current.src = '';
        }
      }
      setIsPreloaded(true);
      setDuration(cachedBriefing.durationSeconds || 32);
      return;
    }

    if (inFlightPreloadsRef.current.has(cacheKey)) {
      return;
    }
    inFlightPreloadsRef.current.add(cacheKey);

    try {
      // Trigger pre-generation service to calculate briefing with exact matching transcript
      const advice = getPickerSpeakerAdvice(pickerId, speaker);
      const pregen = await audioPreGenerationService.pregenerateBriefing(
        pickerId,
        speaker,
        advice.script,
        advice.stageDirections,
        advice.headline,
        advice.title
      );
      if (pregen) {
        if (pregen.hasNeuralAudio && pregen.audioUrl) {
          setAudioUrlCache(prev => ({ ...prev, [cacheKey]: pregen.audioUrl! }));
          setSynthesisNotice('⚡ Gemini Neural Audio Ready (0ms Buffer Delay)');
          if (audioRef.current && selectedSpeaker === speaker && selectedPickerId === pickerId) {
            audioRef.current.src = pregen.audioUrl!;
          }
        } else {
          setAudioUrlCache(prev => ({ ...prev, [cacheKey]: 'SPEECH_SYNTHESIS_READY' }));
          setSynthesisNotice(`🎙️ High-Definition Voice Ready (${speakerMeta.name})`);
          if (audioRef.current && selectedSpeaker === speaker && selectedPickerId === pickerId) {
            audioRef.current.src = '';
          }
        }
        setIsPreloaded(true);
        setDuration(pregen.durationSeconds || 32);
        return;
      }

      // Fallback to speech synthesis ready
      setAudioUrlCache(prev => ({ ...prev, [cacheKey]: 'SPEECH_SYNTHESIS_READY' }));
      setIsPreloaded(true);
      setSynthesisNotice(`🎙️ Voice Engine Active (${speakerMeta.name})`);
    } catch {
      setAudioUrlCache(prev => ({ ...prev, [cacheKey]: 'SPEECH_SYNTHESIS_READY' }));
      setIsPreloaded(true);
      setSynthesisNotice(`🎙️ Voice Engine Active (${speakerMeta.name})`);
    } finally {
      inFlightPreloadsRef.current.delete(cacheKey);
    }
  }, [audioUrlCache, selectedPickerId, selectedSpeaker, speakerMeta.name]);

  // Listen to background pre-generation events
  useEffect(() => {
    const unsub = audioPreGenerationService.onBriefingReady((teamId, speaker, briefing) => {
      const key = `${teamId}-${speaker}`;
      if (briefing.hasNeuralAudio && briefing.audioUrl) {
        setAudioUrlCache(prev => ({ ...prev, [key]: briefing.audioUrl! }));
        if (teamId === selectedPickerId && speaker === selectedSpeaker) {
          setIsPreloaded(true);
          setDuration(briefing.durationSeconds || 32);
          if (audioRef.current) {
            audioRef.current.src = briefing.audioUrl!;
          }
          setSynthesisNotice('⚡ Gemini Neural Audio Ready (0ms Buffer Delay)');
        }
      } else {
        setAudioUrlCache(prev => ({ ...prev, [key]: 'SPEECH_SYNTHESIS_READY' }));
        if (teamId === selectedPickerId && speaker === selectedSpeaker) {
          setIsPreloaded(true);
          setDuration(briefing.durationSeconds || 32);
          setSynthesisNotice(`🎙️ High-Definition Voice Ready (${speakerMeta.name})`);
        }
      }
    });
    return unsub;
  }, [selectedPickerId, selectedSpeaker, speakerMeta.name]);

  // Pre-generate / Pre-load default Coach Sal audio on mount and when manager changes
  useEffect(() => {
    setIsPreloaded(false);
    preloadAudio(selectedSpeaker, selectedPickerId);
  }, [selectedPickerId, selectedSpeaker, preloadAudio]);

  // Initialize Audio
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setActiveSentenceIndex(-1);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      speechEngine.stop();
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  // Sync speed & volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [playbackSpeed, volume, isMuted]);

  // When picker or speaker changes, pause
  useEffect(() => {
    stopCurrentPlayback();
    setCurrentTime(0);
    setActiveSentenceIndex(-1);
    const est = Math.max(12, Math.round(currentAdvice.script.split(' ').length / (2.4 * playbackSpeed)));
    setDuration(est);
  }, [selectedPickerId, selectedSpeaker, playbackSpeed, currentAdvice.script]);

  const stopCurrentPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    speechEngine.stop();
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setIsPlaying(false);
    setActiveSentenceIndex(-1);
  };

  // Synthesize advice with Gemini 3.1 Flash Neural TTS on demand
  const synthesizeAndPlayWithGemini = async (force: boolean = false) => {
    const cacheKey = `${selectedPickerId}-${selectedSpeaker}`;
    stopCurrentPlayback();
    setIsSynthesizing(true);
    setSynthesisNotice(`⚡ Synthesizing ${speakerMeta.name} with Gemini 3.1 Flash Neural TTS...`);

    if (force) {
      try {
        await fetch('/api/tts/reset-cooldown', { method: 'POST' });
      } catch {}
      setAudioUrlCache(prev => {
        const next = { ...prev };
        delete next[cacheKey];
        return next;
      });
      setTtsQuotaExceeded(false);
      setTtsNotice(null);
    }

    try {
      const persona =
        selectedSpeaker === 'sal'
          ? 'Coach Sal Ditkofsky, passionate 1985 Bears disciple and South-Side Chicago beef stand operator'
          : selectedSpeaker === 'chloe'
          ? 'Dr. Chloe Vance, MIT Sloan Sports Analytics director, high-speed articulate data scientist'
          : 'The Commish AI, automated pool commissioner, official Initech Invitational ruling engine';

      const directorsNotes =
        selectedSpeaker === 'sal'
          ? 'Deliver with authentic South-Side Chicago Ditka swagger, slapping laminate counter, intense conviction, hearty laughter, and vocal enthusiasm'
          : selectedSpeaker === 'chloe'
          ? 'Deliver with fast-paced MIT Ivy League precision, crisp articulation, sharp statistical focus, and analytical swagger'
          : 'Deliver with official league commissioner broadcast authority, mechanical chime, and precise statistical ruling';

      const res = await fetch('/api/audio/synthesize-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: selectedPickerId,
          speaker: selectedSpeaker,
          force,
          script: currentAdvice.script,
          stageDirections: currentAdvice.stageDirections,
          headline: currentAdvice.headline,
          title: currentAdvice.title,
        }),
      });

      const data = await res.json();

      if (data.hasNeuralAudio && data.audioUrl && !data.fallbackToSpeechSynthesis) {
        setAudioUrlCache(prev => ({ ...prev, [cacheKey]: data.audioUrl }));
        setTtsQuotaExceeded(false);
        setIsHighDemand(false);
        setTtsNotice(null);
        if (data.modelUsed) setActiveModelUsed(data.modelUsed);
        if (data.durationSeconds) setDuration(data.durationSeconds);

        if (audioRef.current) {
          audioRef.current.src = data.audioUrl;
          audioRef.current.load();
          await audioRef.current.play();
          setIsPlaying(true);
          setSynthesisNotice(`⚡ Playing Gemini Neural Audio (${speakerMeta.voiceName} • ${data.modelUsed || 'gemini-3.8-flash-tts'})`);
        }
        return;
      }

      // If fallback due to high demand (503 traffic spike), quota (10 requests/day), or cooldown
      setAudioUrlCache(prev => ({ ...prev, [cacheKey]: 'SPEECH_SYNTHESIS_FALLBACK' }));
      setTtsQuotaExceeded(Boolean(data.quotaExceeded));
      setIsHighDemand(Boolean(data.isHighDemand));
      setTtsNotice(
        data.message ||
          (data.isHighDemand
            ? 'Gemini TTS is experiencing high server demand (temporary spike). Playing with browser speech engine.'
            : 'Gemini TTS daily quota reached (10 requests/day). Playing with browser speech engine.')
      );
      setSynthesisNotice(`🎙️ Browser Speech Engine Active (${speakerMeta.name})`);
      playWithSpeechEngine();
    } catch (err) {
      console.info('Synthesis fallback triggered, using speech engine:', err);
      setAudioUrlCache(prev => ({ ...prev, [cacheKey]: 'SPEECH_SYNTHESIS_FALLBACK' }));
      playWithSpeechEngine();
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Playback handler: Zero-wait instant playback with Gemini Neural TTS on demand
  const handlePlayPause = async () => {
    if (isPlaying) {
      if (speechEngine.isActive() && !speechEngine.isPaused()) {
        speechEngine.pause();
        setIsPlaying(false);
        return;
      }
      stopCurrentPlayback();
      return;
    }

    if (speechEngine.isPaused()) {
      speechEngine.resume();
      setIsPlaying(true);
      return;
    }

    const cacheKey = `${selectedPickerId}-${selectedSpeaker}`;
    const cachedUrl = audioUrlCache[cacheKey];

    // If genuine neural audio data URL exists, play via HTMLAudioElement
    if (cachedUrl && (cachedUrl.startsWith('data:audio') || cachedUrl.startsWith('http')) && audioRef.current) {
      try {
        if (audioRef.current.src !== cachedUrl) {
          audioRef.current.src = cachedUrl;
          audioRef.current.load();
        }
        await audioRef.current.play();
        setIsPlaying(true);
        setSynthesisNotice(`⚡ Playing Gemini Neural Audio (${speakerMeta.voiceName} • ${activeModelUsed})`);
        return;
      } catch (err) {
        console.warn('Audio play failed, falling back to speech engine:', err);
      }
    }

    // If already marked as fallback (e.g. quota limit reached), play with speech engine
    if (cachedUrl === 'SPEECH_SYNTHESIS_FALLBACK') {
      playWithSpeechEngine();
      return;
    }

    // Otherwise, generate with Gemini Neural TTS on demand!
    await synthesizeAndPlayWithGemini(false);
  };

  const playWithSpeechEngine = () => {
    stopCurrentPlayback();
    const estDuration = Math.max(14, Math.round(currentAdvice.script.split(' ').length / (2.4 * playbackSpeed)));
    setDuration(estDuration);
    setCurrentTime(0);

    setSynthesisNotice(`🎙️ Voice Engine Active: ${speakerMeta.name}`);

    speechEngine.speakScript(currentAdvice.script, {
      speaker: selectedSpeaker,
      rate: playbackSpeed,
      volume: isMuted ? 0 : volume,
      onStart: () => {
        setIsPlaying(true);
      },
      onSentenceChange: (sentenceIdx, currentSentence, total) => {
        setActiveSentenceIndex(sentenceIdx);
        setTotalSentences(total);
        const progressTime = Math.min(estDuration, Math.round(((sentenceIdx + 0.5) / total) * estDuration));
        setCurrentTime(progressTime);
      },
      onEnd: () => {
        stopCurrentPlayback();
        setCurrentTime(0);
        setActiveSentenceIndex(-1);
      },
      onError: () => {
        stopCurrentPlayback();
        setActiveSentenceIndex(-1);
      },
    });
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = newTime;
    }
    if (speechEngine.isActive()) {
      const total = speechEngine.getTotalSentences() || totalSentences;
      if (total > 0 && duration > 0) {
        const targetSentence = Math.min(total - 1, Math.max(0, Math.floor((newTime / duration) * total)));
        setActiveSentenceIndex(targetSentence);
        speechEngine.seekToSentence(targetSentence);
      }
    }
  };

  const handleShareToChat = () => {
    const chatMessage = `🎙️ [Personal Advice from ${speakerMeta.name} for ${currentProfile.teamName} (${currentProfile.ownerName})]: "${currentAdvice.headline}" — ${currentAdvice.script.slice(0, 180)}...`;
    
    if (onPostAdviceToChat) {
      onPostAdviceToChat(chatMessage);
    } else {
      addComment(chatMessage);
    }

    setSharedNotice(`Dispatched ${currentProfile.ownerName}'s personal advice to the league trash-talk thread!`);
    setTimeout(() => setSharedNotice(null), 3500);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      id="individual-picker-audio-advice-studio"
      className="bg-[#0B0F17] border border-amber-500/40 rounded-2xl p-5 space-y-6 shadow-2xl relative overflow-hidden"
    >
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-[#1E293B] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase font-bold">
            <Mic className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>
              {mode === 'private_portal'
                ? '🔒 Confidential Locker Room Voice Briefing'
                : 'Individual Picker Audio Advice Studio'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px] flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>{isPreloaded ? 'Pre-buffered (Instant Play)' : 'Pre-generating Audio'}</span>
            </span>
          </div>
          <h3 className="text-xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <span>
              {mode === 'private_portal'
                ? `Strategy Voice Briefing for ${currentProfile.ownerName}`
                : 'Direct Voice Briefing for Individual Pickers'}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {mode === 'private_portal'
              ? 'Private audio roadmap analyzing your cashed picks, Rams loss absorption, and game-by-game Sunday strategy.'
              : 'Select any league manager below to hear Coach Sal Ditkofsky, Dr. Chloe Vance, or Commish AI break down their completed game damage and roadmap.'}
          </p>
        </div>

        {/* Identity & Pre-load controls */}
        <div className="flex items-center flex-wrap gap-2">
          {mode === 'private_portal' ? (
            <div className="flex items-center gap-2 bg-[#121927] border border-slate-800 rounded-xl p-1.5 px-3">
              <span className="text-[11px] font-mono text-slate-400">Locker Room:</span>
              <select
                id="select-active-locker-room"
                value={selectedPickerId}
                onChange={(e) => handleSelectPicker(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-lg px-2.5 py-1 font-mono cursor-pointer hover:border-amber-500 focus:outline-none focus:border-amber-400"
              >
                {INDIVIDUAL_PICKERS_ADVICE.map((p) => (
                  <option key={p.teamId} value={p.teamId}>
                    {p.ownerName} ({p.teamName}) {p.isCurrentUser ? '★ You' : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <button
              onClick={() => handleSelectPicker('team-todd')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
                selectedPickerId === 'team-todd'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 ring-1 ring-emerald-400'
                  : 'bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/60 text-emerald-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Todd Reimer (You)</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. PICKER SELECTOR CAROUSEL / PILLS (Only displayed in picker_carousel mode) */}
      {mode === 'picker_carousel' && (
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 flex items-center justify-between">
            <span className="font-bold text-slate-300">1. CHOOSE LEAGUE MANAGER TO HEAR DIRECT ADVICE:</span>
            <span className="text-[11px] text-amber-400">12 Pickers Available</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {INDIVIDUAL_PICKERS_ADVICE.map((p) => {
              const isSelected = selectedPickerId === p.teamId;
              return (
                <button
                  key={p.teamId}
                  id={`picker-btn-${p.teamId}`}
                  onClick={() => handleSelectPicker(p.teamId)}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-950/80 via-slate-900 to-purple-950/80 border-amber-400 text-white shadow-lg shadow-amber-950/50 ring-1 ring-amber-400/60'
                      : 'bg-[#121927] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shadow"
                      style={{ backgroundColor: `${p.color}33`, color: p.color, border: `1px solid ${p.color}88` }}
                    >
                      {p.avatar}
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      #{p.rank} ({p.points}p)
                    </span>
                  </div>

                  <div className="truncate font-bold text-xs mt-1">{p.ownerName}</div>
                  <div className="text-[10px] text-slate-400 truncate">{p.teamName}</div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[9px] font-mono">
                    <span className={p.isCurrentUser ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {p.isCurrentUser ? '★ YOU' : `${p.maxRemaining} max`}
                    </span>
                    <span className={p.lossTotal === 0 ? 'text-emerald-400' : p.lossTotal > 10 ? 'text-red-400' : 'text-amber-400'}>
                      {p.lossTotal === 0 ? '0 lost' : `-${p.lossTotal}p`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. SPEAKER PERSONA SELECTOR */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-slate-400 flex items-center justify-between">
          <span className="font-bold text-slate-300">
            {mode === 'private_portal' ? '1. CHOOSE YOUR STRATEGY COMMENTATOR:' : '2. SELECT WHO DELIVERS THE ADVICE:'}
          </span>
          <span className="text-[11px] text-emerald-400 font-bold">
            Default: {primaryHost.speaker || 'Coach Sal Ditkofsky'} (Pre-loaded)
          </span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Coach / Host 1 */}
          <button
            onClick={() => setSelectedSpeaker('sal')}
            className={`p-3 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
              selectedSpeaker === 'sal'
                ? 'bg-orange-950/70 border-orange-500 text-white shadow-md shadow-orange-950/60 ring-1 ring-orange-500/50'
                : 'bg-[#121927] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="text-2xl p-2 rounded-lg bg-orange-900/40 border border-orange-700/60 shrink-0">
              {primaryHost.avatar || '🥩'}
            </div>
            <div className="min-w-0">
              <div className="font-black text-xs text-orange-300 flex items-center gap-1.5">
                <span>{primaryHost.speaker || 'Coach Sal Ditkofsky'}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-950 text-orange-400 border border-orange-800">
                  {primaryHost.voiceName || 'Fenrir'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">{primaryHost.title || '1985 Bears Grit & South-Side Tough Love'}</div>
            </div>
          </button>

          {/* Dr. Chloe / Host 2 */}
          <button
            onClick={() => setSelectedSpeaker('chloe')}
            className={`p-3 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
              selectedSpeaker === 'chloe'
                ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-md shadow-cyan-950/60 ring-1 ring-cyan-500/50'
                : 'bg-[#121927] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="text-2xl p-2 rounded-lg bg-cyan-900/40 border border-cyan-700/60 shrink-0">
              {coHost.avatar || '📊'}
            </div>
            <div className="min-w-0">
              <div className="font-black text-xs text-cyan-300 flex items-center gap-1.5">
                <span>{coHost.speaker || 'Dr. Chloe Vance'}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  {coHost.voiceName || 'Kore'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">{coHost.title || 'MIT Sloan Analytics & NextGen Win Probability'}</div>
            </div>
          </button>

          {/* Commish AI */}
          <button
            onClick={() => setSelectedSpeaker('commish')}
            className={`p-3 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
              selectedSpeaker === 'commish'
                ? 'bg-purple-950/70 border-purple-500 text-white shadow-md shadow-purple-950/60 ring-1 ring-purple-500/50'
                : 'bg-[#121927] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="text-2xl p-2 rounded-lg bg-purple-900/40 border border-purple-700/60 shrink-0">
              🤖
            </div>
            <div className="min-w-0">
              <div className="font-black text-xs text-purple-300 flex items-center gap-1.5">
                <span>The Commish AI</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-400 border border-purple-800">
                  Puck
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">Official Statistical Ruling & Integrity Checks</div>
            </div>
          </button>
        </div>
      </div>

      {/* 3. ACTIVE AUDIO PLAYER & SCRIPT DISPLAY DECK */}
      <div className="bg-[#151D2A] border border-[#1E293B] rounded-2xl p-5 space-y-5 shadow-xl">
        
        {/* Manager Profile Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-inner shrink-0"
              style={{ backgroundColor: `${currentProfile.color}33`, color: currentProfile.color, border: `2px solid ${currentProfile.color}` }}
            >
              {currentProfile.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-black text-white">{currentProfile.ownerName}</h4>
                <span className="text-xs text-slate-400">({currentProfile.teamName})</span>
                {currentProfile.isCurrentUser && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500 font-mono font-bold">
                    YOU
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-mono">
                <span className="text-slate-300 font-bold">Rank #{currentProfile.rank}</span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-400 font-bold">{currentProfile.points} Pts Banked</span>
                <span className="text-slate-500">•</span>
                <span className={currentProfile.lossTotal > 10 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                  -{currentProfile.lossTotal} Pts Lost
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-bold">{currentProfile.maxRemaining} Max Possible</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs px-3 py-1 rounded-full border font-mono font-bold ${currentProfile.badgeColor}`}>
              {currentProfile.badge}
            </span>
          </div>
        </div>

        {/* Audio Player Controls */}
        <div className="p-4 rounded-xl bg-[#0D131F] border border-slate-800 space-y-3">
          {/* TTS Engine Status Badge */}
          {audioUrlCache[`${selectedPickerId}-${selectedSpeaker}`]?.startsWith('data:audio') ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-[11px] font-mono">
              <div className="flex items-center gap-2 text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="font-bold">⚡ Gemini Neural Audio Generated</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-emerald-400 font-bold">{speakerMeta.voiceName} Voice ({activeModelUsed})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 text-[10px]">
                  24kHz 16-bit Neural WAV
                </span>
                <button
                  onClick={() => synthesizeAndPlayWithGemini(true)}
                  disabled={isSynthesizing}
                  className="px-2.5 py-1 rounded bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Re-synthesize audio with Gemini"
                >
                  <RefreshCw className={`w-3 h-3 ${isSynthesizing ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>
          ) : ttsQuotaExceeded || isHighDemand || audioUrlCache[`${selectedPickerId}-${selectedSpeaker}`] === 'SPEECH_SYNTHESIS_FALLBACK' ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 py-2 rounded-lg bg-amber-950/40 border border-amber-500/50 text-[11px] font-mono">
              <div className="flex items-center gap-2 text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span className="font-bold">🎙️ Browser Speech Engine Active</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-amber-200/80 hidden sm:inline">
                  {isHighDemand
                    ? 'Gemini TTS High Demand (Traffic Spike)'
                    : ttsQuotaExceeded
                    ? 'Gemini free-tier (10/day) quota reached'
                    : `${speakerMeta.name} Vocal Engine`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => synthesizeAndPlayWithGemini(true)}
                  disabled={isSynthesizing}
                  className="px-2.5 py-1 rounded bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 disabled:opacity-50 text-white font-bold transition flex items-center gap-1 cursor-pointer shadow text-[11px]"
                >
                  <Sparkles className={`w-3 h-3 ${isSynthesizing ? 'animate-spin' : ''}`} />
                  <span>Retry Gemini Neural TTS</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 py-2 rounded-lg bg-cyan-950/30 border border-cyan-500/40 text-[11px] font-mono">
              <div className="flex items-center gap-2 text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                <span className="font-bold">⚡ Gemini 3.1 Flash Neural Audio</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-slate-400 hidden sm:inline">{speakerMeta.name} ({speakerMeta.voiceName})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => synthesizeAndPlayWithGemini(false)}
                  disabled={isSynthesizing}
                  className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold transition flex items-center gap-1 cursor-pointer shadow text-[11px]"
                >
                  <Sparkles className={`w-3 h-3 ${isSynthesizing ? 'animate-spin' : ''}`} />
                  <span>Generate Neural Audio</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                id="btn-play-individual-advice"
                onClick={handlePlayPause}
                disabled={isSynthesizing}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition shadow-lg cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-slate-950 font-bold hover:brightness-110'
                } disabled:opacity-50`}
              >
                {isSynthesizing ? (
                  <Sparkles className="w-6 h-6 animate-spin text-slate-950" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                )}
              </button>

              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{isPlaying ? 'Now Speaking:' : 'Ready to Listen:'}</span>
                  <span style={{ color: speakerMeta.color }}>{speakerMeta.name}</span>
                  {isPlaying && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>ON AIR</span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {currentAdvice.title} • {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
            </div>

            {/* Controls: Speed, Volume, Share */}
            <div className="flex items-center gap-2">
              {/* Playback Speed selector */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
                {[0.75, 1.0, 1.25, 1.5].map(spd => (
                  <button
                    key={`spd-${spd}`}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-1 rounded transition ${
                      playbackSpeed === spd
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Volume toggle */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Share advice to league trash talk */}
              <button
                onClick={handleShareToChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs font-bold transition cursor-pointer"
                title="Post this customized advice directly into the League Trash-Talk Thread"
              >
                <Share2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Post to Chat</span>
              </button>

              {/* Ask Coach consultation shortcut */}
              {onAskCoachClick && (
                <button
                  type="button"
                  onClick={onAskCoachClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 text-amber-300 text-xs font-bold transition cursor-pointer"
                  title="Ask Coach Sal for specific pick advice, matchups, and analysis"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ask Coach</span>
                </button>
              )}
            </div>
          </div>

          {/* Scrub Bar */}
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>{formatTime(currentTime)}</span>
              <span>{synthesisNotice || `${formatTime(duration)} Total Duration`}</span>
            </div>
          </div>

          {/* High Demand Informational Banner */}
          {isHighDemand && !ttsQuotaExceeded && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-950/30 border border-amber-500/40 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-amber-200 font-bold">
                  Gemini TTS Experiencing High Server Demand (Temporary Traffic Spike)
                </div>
                <div className="text-slate-300 text-[11px] leading-relaxed">
                  The preview Gemini 3.1 Flash TTS model is currently encountering a momentary spike in global server traffic. Your briefing is actively playing via the browser voice engine. You can click 'Retry Gemini Neural Generation' once the traffic spike clears.
                </div>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={() => synthesizeAndPlayWithGemini(true)}
                    disabled={isSynthesizing}
                    className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSynthesizing ? 'animate-spin' : ''}`} />
                    <span>Retry Gemini Neural Generation</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Daily Free-Tier Quota Limit Informational Banner */}
          {ttsQuotaExceeded && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-950/30 border border-amber-500/40 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-amber-200 font-bold">
                  Gemini TTS Free-Tier Quota Limit (10 requests/day)
                </div>
                <div className="text-slate-300 text-[11px] leading-relaxed">
                  Your Google AI Studio key has reached the Gemini 3.1 Flash TTS preview limit of 10 requests per day. The Strategist Portal is playing smoothly using the built-in browser SpeechSynthesis engine with custom vocal profiling.
                </div>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={() => synthesizeAndPlayWithGemini(true)}
                    disabled={isSynthesizing}
                    className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSynthesizing ? 'animate-spin' : ''}`} />
                    <span>Retry Gemini Neural Generation</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Spoken Advice Transcript & Actionable Plan */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-[#101725] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{speakerMeta.avatar}</span>
                <span className="font-bold text-xs text-amber-300 font-mono uppercase tracking-wider">
                  Spoken Advice Transcript ({speakerMeta.name})
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {currentAdvice.stageDirections}
              </span>
            </div>

            {/* Headline */}
            <h5 className="text-sm font-black text-white border-l-2 border-amber-400 pl-3">
              "{currentAdvice.headline}"
            </h5>

            {/* Full Script with real-time sentence synchronization */}
            <div className="text-xs text-slate-200 leading-relaxed font-sans pl-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
              {currentAdvice.script.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g)?.map((sentence, sIdx) => {
                const isCurrent = isPlaying && sIdx === activeSentenceIndex;
                return (
                  <span
                    key={sIdx}
                    className={`transition-all duration-200 rounded px-1 py-0.5 inline ${
                      isCurrent
                        ? 'bg-amber-500/25 text-amber-200 font-semibold ring-1 ring-amber-400/40'
                        : 'text-slate-300'
                    }`}
                  >
                    {sentence}{' '}
                  </span>
                );
              }) || currentAdvice.script}
            </div>
          </div>

          {/* Week 3 Tactical Matchup Directives & Confidence Allocation */}
          {currentProfile.recommendedPicks && currentProfile.recommendedPicks.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
                  <span className="p-1 rounded bg-amber-500/20 text-amber-300">🎯</span>
                  <span className="text-amber-300 uppercase tracking-wide">
                    Week 3 Specific Matchups & Confidence Allocations:
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                  Tailored for {currentProfile.ownerName} ({currentProfile.teamName})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
                {currentProfile.recommendedPicks.map((pick, pIdx) => {
                  const isHighAnchor = pick.confidencePoints >= 14;
                  const isCore = pick.confidencePoints >= 8 && pick.confidencePoints < 14;

                  return (
                    <div
                      key={pIdx}
                      className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-2"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-mono font-bold text-slate-200 truncate">
                            {pick.matchup}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-black bg-emerald-950 border border-emerald-700 text-emerald-300 shrink-0">
                            PICK: {pick.recommendedTeam}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-mono font-black border ${
                              isHighAnchor
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : isCore
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            }`}
                          >
                            {pick.confidencePoints} Points
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            ({pick.spread})
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-300/90 leading-relaxed border-t border-slate-800/80 pt-1.5">
                        {pick.rationale}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tactical Blueprint Bullet Points */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Sunday Actionable Directives for {currentProfile.ownerName}:</span>
            </div>

            <ul className="space-y-1.5 pl-2">
              {currentAdvice.tacticalPointers.map((point, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Shared Notice Banner */}
        {sharedNotice && (
          <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500 text-xs text-emerald-200 font-mono flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{sharedNotice}</span>
          </div>
        )}
      </div>
    </div>
  );
};
