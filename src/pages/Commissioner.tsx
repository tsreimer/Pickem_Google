import React, { useState, useEffect, useRef } from 'react';
import { useTeam } from '../context/TeamContext';
import {
  Shield,
  Radio,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  Lock,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Copy,
  Check,
  Zap,
  Users,
  Send,
  Layers,
  Info,
  Mic,
  MessageSquare,
  Database,
  DollarSign,
  Wand2
} from 'lucide-react';
import { TtsAudioProfile, formatTtsPromptPayload } from '../types';
import { useAudioProfile } from '../context/AudioProfileContext';
import { KickoffCountdown } from '../components/KickoffCountdown';
import { CsvImportExportVault } from '../components/CsvImportExportVault';
import { LeagueTreasuryCard } from '../components/LeagueTreasuryCard';

export const Commissioner: React.FC = () => {
  const {
    yahooLockWindows,
    autoSyncEnabled,
    syncAuditLogs,
    fetchYahooLockWindows,
    syncYahooLockWindow,
    toggleAutoSync,
    isSyncingLockWindow,
    teams
  } = useTeam();

  const {
    profile: activeContextProfile,
    saveProfile: contextSaveProfile,
    resetToDefault: contextResetToDefault,
  } = useAudioProfile();

  const [activeSubTab, setActiveSubTab] = useState<'tts-studio' | 'lock-windows' | 'pool-roster' | 'payout-schedule' | 'pool-csv-vault' | 'governance'>('tts-studio');

  // TTS Profile Studio State (initialized from activeContextProfile)
  const [profile, setProfile] = useState<TtsAudioProfile>(activeContextProfile);

  // Keep local profile state in sync when context profile changes from external update
  useEffect(() => {
    if (activeContextProfile && activeContextProfile.id !== profile.id) {
      setProfile(activeContextProfile);
    }
  }, [activeContextProfile]);

  const [presets, setPresets] = useState<TtsAudioProfile[]>([]);
  const [supportedVoices, setSupportedVoices] = useState<Array<{ voiceName: string; gender: string; tone: string; recommendedFor: string }>>([
    { voiceName: 'Fenrir', gender: 'Male', tone: 'Deep, gravelly baritone (Coach Sal)', recommendedFor: 'Coach Sal, Veteran host' },
    { voiceName: 'Kore', gender: 'Female', tone: 'Crisp, articulate, sharp, analytical', recommendedFor: 'Dr. Chloe, Stats Lead' },
    { voiceName: 'Puck', gender: 'Male', tone: 'Authoritative, deadpan, dry wit', recommendedFor: 'The Commissioner' },
    { voiceName: 'Aoede', gender: 'Female', tone: 'Dynamic, passionate, high-energy', recommendedFor: 'Fast-paced debrief' },
    { voiceName: 'Charon', gender: 'Male', tone: 'Warm, hearty Southern drawl', recommendedFor: 'Rex Vance, Tailgate Master' },
    { voiceName: 'Zephyr', gender: 'Female', tone: 'Relaxed, conversational broadcast', recommendedFor: 'Watercooler Co-Host' },
    { voiceName: 'Leda', gender: 'Female', tone: 'Calm, composed, methodical', recommendedFor: 'Audit Specialist' },
    { voiceName: 'Orus', gender: 'Male', tone: 'Firm, punchy sportscaster cadence', recommendedFor: 'Scoreboard caller' }
  ]);

  const [supportedVocalTags, setSupportedVocalTags] = useState<Array<{ tag: string; label: string; description: string }>>([
    { tag: '[pause]', label: 'Pause', description: 'Natural conversational pause' },
    { tag: '[dramatic pause]', label: 'Dramatic Pause', description: 'Extended pregnant silence' },
    { tag: '[clears throat]', label: 'Clears Throat', description: 'Gravelly throat clear' },
    { tag: '[sighs]', label: 'Sighs', description: 'Audible exhale of exasperation' },
    { tag: '[groans]', label: 'Groans', description: 'Gut-wrenching reaction to bad variance' },
    { tag: '[shouting with passion]', label: 'Shout Passion', description: 'High-volume energetic shout' },
    { tag: '[boisterous laugh]', label: 'Hearty Laugh', description: 'Warm belly laugh' },
    { tag: '[crisp analytical tone]', label: 'Analytical Tone', description: 'Razor-sharp precision' },
    { tag: '[whispering]', label: 'Whisper', description: 'Conspiratorial aside' },
    { tag: '[deadpan]', label: 'Deadpan', description: 'Monotone dry delivery' },
    { tag: '[fast paced]', label: 'Fast Paced', description: 'Rapid-fire tempo burst' },
    { tag: '[emphasized]', label: 'Emphasized', description: 'Punches key words' }
  ]);

  // Player & Synthesis State
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [audioMeta, setAudioMeta] = useState<{ modelUsed?: string; cached?: boolean; voiceName?: string; isFallback?: boolean } | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [showRawPayload, setShowRawPayload] = useState(false);
  const [dispatchPublished, setDispatchPublished] = useState(false);

  // AI Showrunner & Dynamic Persona Architect State
  const [aiPrompt, setAiPrompt] = useState('');
  const [targetScope, setTargetScope] = useState<'full_show' | 'replace_host' | 'replace_cohost' | 'new_scene'>('full_show');
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [blueprintBanner, setBlueprintBanner] = useState<{ title: string; summary: string; icon?: string } | null>(null);
  const [aiPromptError, setAiPromptError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Fetch initial profile & presets from server
  useEffect(() => {
    fetch('/api/commissioner/tts-profile')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.activeProfile) setProfile(data.activeProfile);
          if (data.presets) setPresets(data.presets);
          if (data.supportedVoices) setSupportedVoices(data.supportedVoices);
          if (data.supportedVocalTags) setSupportedVocalTags(data.supportedVocalTags);
        }
      })
      .catch(err => console.warn('Failed to load commissioner TTS profile:', err));
  }, []);

  // Sync audio element time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [audioUrl]);

  // Insert vocal tag into transcript at cursor
  const handleInsertTag = (tag: string) => {
    const textarea = transcriptTextareaRef.current;
    if (!textarea) {
      setProfile(prev => ({ ...prev, transcript: `${prev.transcript} ${tag} ` }));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = profile.transcript;
    const newText = currentText.substring(0, start) + `${tag} ` + currentText.substring(end);

    setProfile(prev => ({ ...prev, transcript: newText }));

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length + 1, start + tag.length + 1);
    }, 50);
  };

  // Load a preset and immediately broadcast to server & league audio (Watercooler & Weekly Recap)
  const handleSelectPreset = async (presetId: string) => {
    const selected = presets.find(p => p.id === presetId);
    if (selected) {
      const updatedProfile = { ...selected };
      setProfile(updatedProfile);
      setAudioUrl(null);
      setAudioMeta(null);
      setIsPlaying(false);

      // Auto-save via AudioProfileContext immediately so Watercooler and Weekly Recap receive it
      setSaveStatus('saving');
      const ok = await contextSaveProfile(updatedProfile);
      setSaveStatus(ok ? 'saved' : 'error');
      if (ok) setTimeout(() => setSaveStatus(null), 3500);
    }
  };

  // Save active profile to server and broadcast
  const handleSaveProfile = async () => {
    setSaveStatus('saving');
    const ok = await contextSaveProfile(profile);
    setSaveStatus(ok ? 'saved' : 'error');
    if (ok) setTimeout(() => setSaveStatus(null), 3500);
  };

  // Reset to default
  const handleResetDefault = async () => {
    await contextResetToDefault();
    setAudioUrl(null);
    setAudioMeta(null);
    setIsPlaying(false);
    setBlueprintBanner(null);
  };

  // AI Showrunner: Dynamically generate & populate all fields based on high-level natural language prompt
  const handleGenerateBlueprint = async (promptOverride?: string) => {
    const query = (promptOverride !== undefined ? promptOverride : aiPrompt).trim();
    if (!query) {
      setAiPromptError('Please describe the persona, accent, or scene (e.g. "urban New Yorker in Todd\'s basement").');
      return;
    }
    setAiPromptError(null);
    setIsGeneratingBlueprint(true);
    try {
      const res = await fetch('/api/commissioner/tts-generate-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: query,
          targetScope,
          currentProfile: profile,
        }),
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setBlueprintBanner({
          title: data.profile.name,
          summary: data.profile.summaryNotes || `Dynamically generated ${data.profile.speakerConfigs[0]?.speaker || 'host'} in ${data.profile.sceneTitle}`,
          icon: data.profile.icon || '🎙️',
        });
        setAudioUrl(null);
        setAudioMeta(null);
        setIsPlaying(false);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 3500);
      } else {
        setAiPromptError(data.error || 'Failed to generate persona blueprint. Please try again.');
      }
    } catch (err: any) {
      setAiPromptError(err?.message || 'Error communicating with AI Showrunner.');
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  // Preview & Synthesize Speech
  const handleSynthesizePreview = async () => {
    setIsSynthesizing(true);
    setAudioUrl(null);
    setIsPlaying(false);

    try {
      const res = await fetch('/api/commissioner/tts-profile/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });

      const data = await res.json();

      if (data.success && data.audioUrl) {
        setAudioUrl(data.audioUrl);
        setAudioDuration(data.durationSeconds || 12);
        setAudioMeta({
          modelUsed: data.modelUsed || 'gemini-3.8-flash-tts',
          cached: data.cached,
          voiceName: data.voiceName,
          isFallback: false,
        });

        // Autoplay preview
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        }, 100);
      } else if (data.fallbackToSpeechSynthesis || 'speechSynthesis' in window) {
        // Graceful browser speech synthesis fallback if rate limited or high demand
        const cleanScript = profile.transcript.replace(/\[[^\]]+\]/g, ' ').replace(/[A-Za-z]+:\s*/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanScript);
        utterance.rate = 1.05;
        utterance.pitch = profile.speakerConfigs[0]?.voiceName === 'Fenrir' ? 0.85 : 1.1;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);

        setAudioMeta({
          modelUsed: 'Browser SpeechSynthesis (Instant Engine)',
          voiceName: profile.speakerConfigs[0]?.voiceName || 'Fenrir',
          isFallback: true,
        });
      }
    } catch (err) {
      console.warn('TTS preview failed:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Play / Pause toggle
  const togglePlayPause = () => {
    if (!audioRef.current && audioMeta?.isFallback) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        handleSynthesizePreview();
      }
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleCopyPayload = () => {
    const payload = formatTtsPromptPayload(profile);
    navigator.clipboard.writeText(payload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  // Publish dispatch to the Watercooler
  const handlePublishDispatch = async () => {
    setDispatchPublished(true);
    await handleSaveProfile();
    setTimeout(() => setDispatchPublished(false), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden HTML Audio Element */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" />}

      {/* Commissioner Dashboard Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border border-amber-500/40 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Shield className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Commissioner&apos;s War Room &amp; Governance
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-400 text-black font-bold">
                    Official High Table
                  </span>
                </h1>
                <p className="text-xs md:text-sm text-slate-400">
                  The Initech Invitational &bull; Gemini 3.1 Flash TTS Prompt Architecture &amp; Automated Kickoff Governance
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Auto-Sync Status */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${autoSyncEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300 font-mono">Yahoo Ingestion:</span>
              <span className={autoSyncEnabled ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {autoSyncEnabled ? 'Daemon Active' : 'Paused'}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs flex items-center gap-2">
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300 font-mono">TTS Model:</span>
              <span className="text-amber-300 font-bold font-mono">3.1 Flash TTS</span>
            </div>

            <button
              onClick={() => toggleAutoSync()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition border border-slate-700"
            >
              {autoSyncEnabled ? 'Pause Daemon' : 'Enable Daemon'}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('tts-studio')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'tts-studio'
              ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/20'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Gemini TTS Audio Studio</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-black uppercase font-mono font-bold">
            Prompt Guide
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('lock-windows')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'lock-windows'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Yahoo Lock Windows ({yahooLockWindows.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pool-roster')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'pool-roster'
              ? 'bg-blue-500 text-black shadow-lg shadow-blue-500/20'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manager Rosters &amp; Picks ({teams.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pool-csv-vault')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'pool-csv-vault'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Database className="w-4 h-4 text-purple-400" />
          <span>CSV &amp; Screenshot Vault</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 uppercase font-mono font-bold border border-purple-800">
            SAFEGUARD &bull; OCR
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('payout-schedule')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'payout-schedule'
              ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/20'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Treasury &amp; Payouts ($600)</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono font-bold">
            VENMO @Todd-Reimer
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('governance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'governance'
              ? 'bg-purple-500 text-black shadow-lg shadow-purple-500/20'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Rulebook &amp; Tiebreakers</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: GEMINI TTS AUDIO PROFILE STUDIO (PROMPT GUIDE WITH TAGS)     */}
      {/* ========================================================================= */}
      {activeSubTab === 'tts-studio' && (
        <div className="space-y-6">
          
          {/* Presets Bar & Action Controls */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Presets:
              </span>
              {presets.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                    profile.id === p.id
                      ? 'bg-amber-400 text-black border-amber-400 font-bold shadow-sm'
                      : 'bg-slate-950 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={handleResetDefault}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                title="Reset to default Halsted & Ivy War Room"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                onClick={handleCopyPayload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                title="Copy formatted markdown prompt guide payload"
              >
                {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPayload ? 'Copied Payload!' : 'Copy Payload'}</span>
              </button>

              <button
                onClick={() => setShowRawPayload(!showRawPayload)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                  showRawPayload ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{showRawPayload ? 'Hide Markdown' : 'View Payload'}</span>
              </button>
            </div>
          </div>

          {/* AI Showrunner & Dynamic Character Architect (Natural Language Studio Generator) */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-cyan-500/10 border border-amber-500/30 shadow-2xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-black shadow-lg shadow-amber-500/25 shrink-0">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>AI Showrunner &amp; Character Architect</span>
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                      High-Level Prompt Driven
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-mono">
                      Gemini 3.8 Intelligence
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Just describe the new host, co-host, accent, or studio location. Gemini automatically re-architects and updates all studio fields, transcripts, voice assignments, and scene descriptions dynamically!
                  </p>
                </div>
              </div>

              {/* Target Scope Tabs */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 text-xs">
                <button
                  type="button"
                  onClick={() => setTargetScope('full_show')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    targetScope === 'full_show'
                      ? 'bg-amber-400 text-black shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Generate a brand new show with custom host, co-host, scene, and dialogue"
                >
                  Full Show
                </button>
                <button
                  type="button"
                  onClick={() => setTargetScope('replace_host')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    targetScope === 'replace_host'
                      ? 'bg-amber-400 text-black shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Replace Lead Host (Speaker 1), keeping Co-Host intact"
                >
                  Replace Host (Spk 1)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetScope('replace_cohost')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    targetScope === 'replace_cohost'
                      ? 'bg-amber-400 text-black shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Replace Co-Host (Speaker 2), keeping Lead Host intact"
                >
                  Replace Co-Host
                </button>
                <button
                  type="button"
                  onClick={() => setTargetScope('new_scene')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    targetScope === 'new_scene'
                      ? 'bg-amber-400 text-black shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Move the broadcast to a brand new acoustic setting (e.g. Todd's basement)"
                >
                  Move Scene
                </button>
              </div>
            </div>

            {/* Natural Language Prompt Input Bar & Generate Action */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !isGeneratingBlueprint) {
                      handleGenerateBlueprint();
                    }
                  }}
                  placeholder="e.g. Urban New Yorker or multicultural London English primary speaker broadcasting live from Todd's basement..."
                  className="w-full bg-slate-950/90 border border-slate-700 hover:border-slate-600 focus:border-amber-400 rounded-xl px-4 py-3 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none transition font-medium pr-10 shadow-inner"
                />
                {aiPrompt && (
                  <button
                    type="button"
                    onClick={() => setAiPrompt('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-sm font-bold"
                  >
                    &times;
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleGenerateBlueprint()}
                disabled={isGeneratingBlueprint}
                className={`px-6 py-3 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition shadow-lg shrink-0 cursor-pointer ${
                  isGeneratingBlueprint
                    ? 'bg-amber-400/50 text-black cursor-wait'
                    : 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-amber-500/20 hover:scale-[1.01]'
                }`}
              >
                {isGeneratingBlueprint ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Architecting Show...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>Generate &amp; Fill Studio</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Inspiration Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                Try Prompt:
              </span>
              {[
                { label: "🗽 Urban New Yorker in Todd's Basement", prompt: "Urban New Yorker primary speaker broadcasting live from Todd's basement in Milwaukee" },
                { label: "🇬🇧 Multicultural London English (MLE)", prompt: "Multicultural London English (MLE) primary speaker broadcasting live from Todd's basement rec room" },
                { label: "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scottish Pub Owner Ranting", prompt: "Fiery Scottish pub owner ripping into coward chalk picks alongside Dr. Chloe" },
                { label: "☘️ Boston Southie Screamer", prompt: "Boston Southie sports radio caller in Todd's cellar screaming over missed kicks" },
                { label: "🤠 Texas Tailgate Master & Smoker", prompt: "Rex Vance boisterous Texas tailgate master with high-stakes chalk bravado" },
                { label: "🌴 Miami Poolside DJ & Vibes", prompt: "Charismatic Miami poolside DJ breaking down survivor sweat with Dr. Chloe" }
              ].map(chip => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    setAiPrompt(chip.prompt);
                    handleGenerateBlueprint(chip.prompt);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {/* Success Banner when blueprint is generated */}
            {blueprintBanner && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-start justify-between gap-3 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{blueprintBanner.icon || '🎙️'}</span>
                  <div>
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-2 flex-wrap">
                      <span>Show Blueprint Loaded: &quot;{blueprintBanner.title}&quot;</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                        All Fields Dynamically Populated
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{blueprintBanner.summary}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleGenerateBlueprint()}
                  disabled={isGeneratingBlueprint}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                  title="Regenerate another creative variation with this description"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              </div>
            )}

            {aiPromptError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{aiPromptError}</span>
              </div>
            )}
          </div>

          {/* Raw Markdown Payload Drawer / Card (When toggled) */}
          {showRawPayload && (
            <div className="p-4 rounded-xl bg-black/80 border border-amber-500/40 space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-400 font-mono font-bold">
                <span>Direct Prompt Payload to gemini-3.8-flash-tts</span>
                <span className="text-slate-400">Formatted per Google TTS Prompt Guide</span>
              </div>
              <pre className="text-xs font-mono text-emerald-300 bg-slate-950 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800 max-h-72">
                {formatTtsPromptPayload(profile)}
              </pre>
            </div>
          )}

          {/* Core Configuration Form: Structured according to the prompt guide */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left 2 Columns: The Official Prompt Guide Schema Sections */}
            <div className="lg:col-span-2 space-y-6">

              {/* Section 1: Audio Profile & Title */}
              <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
                      1
                    </span>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Audio Profile &amp; Broadcast Title
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    # AUDIO PROFILE &bull; ## Title
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span># AUDIO PROFILE Name</span>
                      <span className="text-[10px] text-amber-400 font-mono">Profile Icon &amp; Slug</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={profile.icon || '🎙️'}
                        onChange={e => setProfile({ ...profile, icon: e.target.value })}
                        className="w-11 text-center bg-slate-950 border border-slate-700 rounded-xl py-2 text-base text-white focus:outline-none focus:border-amber-400 shrink-0"
                        title="Profile Emoji Icon (e.g. 🗽, 🇬🇧, 🎙️, 🤠)"
                      />
                      <input
                        type="text"
                        value={profile.name}
                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                        placeholder="e.g. Chicago War Room Dispatch"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      ## Broadcast Episode Title
                    </label>
                    <input
                      type="text"
                      value={profile.title}
                      onChange={e => setProfile({ ...profile, title: e.target.value })}
                      placeholder="e.g. Halsted & Ivy 4th Quarter Sweat"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium"
                    />
                  </div>
                </div>

                {/* Sub-titles / Roles if generated */}
                {(profile.hostTitle || profile.coHostTitle) && (
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                    {profile.hostTitle && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                        Lead Host Role: {profile.hostTitle}
                      </span>
                    )}
                    {profile.coHostTitle && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                        Co-Host Role: {profile.coHostTitle}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Section 2: THE SCENE */}
              <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
                      2
                    </span>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      ## THE SCENE
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Vivid environmental context
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Scene Title
                    </label>
                    <input
                      type="text"
                      value={profile.sceneTitle}
                      onChange={e => setProfile({ ...profile, sceneTitle: e.target.value })}
                      placeholder="e.g. Vito & Sal's Broadcast Studio Booth"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Vivid Description of the Scene
                    </label>
                    <textarea
                      rows={3}
                      value={profile.sceneDescription}
                      onChange={e => setProfile({ ...profile, sceneDescription: e.target.value })}
                      placeholder="Describe acoustic space, ambient sounds, lighting, props..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed font-normal resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: DIRECTOR'S NOTES (Style, Pace, Accent) */}
              <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
                      3
                    </span>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      ### DIRECTOR&apos;S NOTES
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Style &bull; Pace &bull; Accent
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                      <span>Style</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Tone &amp; Energy)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={profile.directorsNotes.style}
                      onChange={e =>
                        setProfile({
                          ...profile,
                          directorsNotes: { ...profile.directorsNotes, style: e.target.value },
                        })
                      }
                      placeholder="e.g. Enthusiastic sports radio debate with punchy delivery..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-y"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                      <span>Pace</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Tempo &amp; Cadence)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={profile.directorsNotes.pace}
                      onChange={e =>
                        setProfile({
                          ...profile,
                          directorsNotes: { ...profile.directorsNotes, pace: e.target.value },
                        })
                      }
                      placeholder="e.g. Rapid-fire tempo with deliberate dramatic pauses..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-y"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                      <span>Accent</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Dialect &amp; Cadence)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={profile.directorsNotes.accent}
                      onChange={e =>
                        setProfile({
                          ...profile,
                          directorsNotes: { ...profile.directorsNotes, accent: e.target.value },
                        })
                      }
                      placeholder="e.g. Authentic Chicago sports radio inflection..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: SAMPLE CONTEXT & SPEAKER ASSIGNMENTS */}
              <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
                      4
                    </span>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      ### SAMPLE CONTEXT &amp; Voice Config
                    </h2>
                  </div>
                  
                  {/* Single vs Multi-Speaker Toggle */}
                  <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setProfile({ ...profile, isMultiSpeaker: false })}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                        !profile.isMultiSpeaker ? 'bg-amber-400 text-black' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Single Voice
                    </button>
                    <button
                      onClick={() => setProfile({ ...profile, isMultiSpeaker: true })}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                        profile.isMultiSpeaker ? 'bg-amber-400 text-black' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Dual Speaker (Crosstalk)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Speaker 1 */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{profile.speakerConfigs[0]?.avatar || '🎙️'}</span>
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                          Primary Speaker (Speaker 1)
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {profile.hostTitle && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                            {profile.hostTitle}
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                          Lead Voice
                        </span>
                      </div>
                    </div>

                    {/* Persona Presets for Speaker 1 */}
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                        Speaker 1 Persona Presets
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {[
                          { name: 'Coach Sal', voice: 'Fenrir', role: 'Gruff, passionate South-Side Chicago beef counter legend & 1985 Bears diehard', avatar: '🥩' },
                          { name: 'Dr. Chloe', voice: 'Kore', role: 'Brilliant MIT Sloan analytics director analyzing EPA/play and win curves', avatar: '📊' },
                          { name: 'Kev Callahan', voice: 'Puck', role: 'AM 670 Sports Radio screamer meltdown caller shouting over bad beats', avatar: '⚡' },
                          { name: 'Rex McCoy', voice: 'Zephyr', role: 'Texas football booster with big belt buckle obsessed with arm talent', avatar: '🤠' },
                          { name: 'Marty Miller', voice: 'Charon', role: 'Grizzled Las Vegas syndicate sharp and closing line oddsmaker', avatar: '🎲' },
                        ].map(p => (
                          <button
                            key={`spk1-p-${p.name}`}
                            type="button"
                            onClick={() => {
                              const updated = [...profile.speakerConfigs];
                              updated[0] = { ...updated[0], speaker: p.name, voiceName: p.voice, roleContext: p.role };
                              setProfile({ ...profile, speakerConfigs: updated });
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border transition flex items-center gap-1 ${
                              profile.speakerConfigs[0]?.speaker === p.name
                                ? 'bg-amber-950 border-amber-500 text-amber-300 font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span>{p.avatar}</span>
                            <span>{p.name.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Speaker Tag</label>
                        <input
                          type="text"
                          value={profile.speakerConfigs[0]?.speaker || 'Coach Sal'}
                          onChange={e => {
                            const updated = [...profile.speakerConfigs];
                            updated[0] = { ...updated[0], speaker: e.target.value };
                            setProfile({ ...profile, speakerConfigs: updated });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Gemini Prebuilt Voice</label>
                        <select
                          value={profile.speakerConfigs[0]?.voiceName || 'Fenrir'}
                          onChange={e => {
                            const updated = [...profile.speakerConfigs];
                            updated[0] = { ...updated[0], voiceName: e.target.value };
                            setProfile({ ...profile, speakerConfigs: updated });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                        >
                          {supportedVoices.map(v => (
                            <option key={v.voiceName} value={v.voiceName}>
                              {v.voiceName} ({v.tone.split('(')[0].trim()})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Role / Persona Description</label>
                      <input
                        type="text"
                        value={profile.speakerConfigs[0]?.roleContext || ''}
                        onChange={e => {
                          const updated = [...profile.speakerConfigs];
                          updated[0] = { ...updated[0], roleContext: e.target.value };
                          setProfile({ ...profile, speakerConfigs: updated });
                        }}
                        placeholder="e.g. Gruff, passionate veteran sports radio host"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Speaker 2 (If Dual Speaker) */}
                  {profile.isMultiSpeaker ? (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{profile.speakerConfigs[1]?.avatar || '📊'}</span>
                          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                            Co-Host / Counterpart (Speaker 2)
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {profile.coHostTitle && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                              {profile.coHostTitle}
                            </span>
                          )}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                            Dual Dialogue
                          </span>
                        </div>
                      </div>

                      {/* Persona Presets for Speaker 2 */}
                      <div className="space-y-1">
                        <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                          Speaker 2 Persona Presets
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {[
                            { name: 'Dr. Chloe', voice: 'Kore', role: 'Brilliant MIT Sloan analytics director analyzing EPA/play and win curves', avatar: '📊' },
                            { name: 'Coach Sal', voice: 'Fenrir', role: 'Gruff, passionate South-Side Chicago beef counter legend & 1985 Bears diehard', avatar: '🥩' },
                            { name: 'Kev Callahan', voice: 'Puck', role: 'AM 670 Sports Radio screamer meltdown caller shouting over bad beats', avatar: '⚡' },
                            { name: 'Rex McCoy', voice: 'Zephyr', role: 'Texas football booster with big belt buckle obsessed with arm talent', avatar: '🤠' },
                            { name: 'Marty Miller', voice: 'Charon', role: 'Grizzled Las Vegas syndicate sharp and closing line oddsmaker', avatar: '🎲' },
                          ].map(p => (
                            <button
                              key={`spk2-p-${p.name}`}
                              type="button"
                              onClick={() => {
                                const updated = [...profile.speakerConfigs];
                                updated[1] = {
                                  speaker: p.name,
                                  voiceName: p.voice,
                                  roleContext: p.role,
                                };
                                setProfile({ ...profile, speakerConfigs: updated });
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono border transition flex items-center gap-1 ${
                                profile.speakerConfigs[1]?.speaker === p.name
                                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <span>{p.avatar}</span>
                              <span>{p.name.split(' ')[0]}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Speaker Tag</label>
                          <input
                            type="text"
                            value={profile.speakerConfigs[1]?.speaker || 'Dr. Chloe'}
                            onChange={e => {
                              const updated = [...profile.speakerConfigs];
                              updated[1] = {
                                speaker: e.target.value,
                                voiceName: updated[1]?.voiceName || 'Kore',
                                roleContext: updated[1]?.roleContext || 'MIT Sloan analytics director',
                              };
                              setProfile({ ...profile, speakerConfigs: updated });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Gemini Prebuilt Voice</label>
                          <select
                            value={profile.speakerConfigs[1]?.voiceName || 'Kore'}
                            onChange={e => {
                              const updated = [...profile.speakerConfigs];
                              updated[1] = {
                                speaker: updated[1]?.speaker || 'Dr. Chloe',
                                voiceName: e.target.value,
                                roleContext: updated[1]?.roleContext || 'MIT Sloan analytics director',
                              };
                              setProfile({ ...profile, speakerConfigs: updated });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                          >
                            {supportedVoices.map(v => (
                              <option key={v.voiceName} value={v.voiceName}>
                                {v.voiceName} ({v.tone.split('(')[0].trim()})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Role / Persona Description</label>
                        <input
                          type="text"
                          value={profile.speakerConfigs[1]?.roleContext || ''}
                          onChange={e => {
                            const updated = [...profile.speakerConfigs];
                            updated[1] = {
                              speaker: updated[1]?.speaker || 'Dr. Chloe',
                              voiceName: updated[1]?.voiceName || 'Kore',
                              roleContext: e.target.value,
                            };
                            setProfile({ ...profile, speakerConfigs: updated });
                          }}
                          placeholder="e.g. Brilliant MIT Sloan analytics director"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center p-4 text-slate-500">
                      <p className="text-xs">Single-speaker broadcast active.</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Toggle &quot;Dual Speaker&quot; above to enable rapid-fire banter between Coach Sal &amp; Dr. Chloe.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Combined ### SAMPLE CONTEXT Block
                  </label>
                  <textarea
                    rows={2}
                    value={profile.sampleContext}
                    onChange={e => setProfile({ ...profile, sampleContext: e.target.value })}
                    placeholder="Role/Persona descriptions for the prompt payload..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono resize-y"
                  />
                </div>
              </div>

              {/* Section 5: #### TRANSCRIPT & Interactive Vocal Tag Toolbar */}
              <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
                      5
                    </span>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      #### TRANSCRIPT &amp; Vocal Direction Tags
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Click tags below to insert at cursor
                  </span>
                </div>

                {/* Vocal Cue Insert Toolbar */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3 h-3" /> Quick-Insert Supported Vocal Cues:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {supportedVocalTags.map(item => (
                      <button
                        key={item.tag}
                        onClick={() => handleInsertTag(item.tag)}
                        title={item.description}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-400 hover:text-black border border-slate-700 text-slate-300 text-[11px] font-mono transition group flex items-center gap-1"
                      >
                        <span className="text-amber-400 group-hover:text-black font-bold">+</span>
                        <span>{item.tag}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transcript Textarea */}
                <div>
                  <textarea
                    ref={transcriptTextareaRef}
                    rows={6}
                    value={profile.transcript}
                    onChange={e => setProfile({ ...profile, transcript: e.target.value })}
                    placeholder="Enter script text. Use bracketed tags like [pause], [clears throat], [shouting with passion], etc."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed font-mono resize-y"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    For multi-speaker dialogue, prefix each line with the speaker tag (e.g. &quot;Coach Sal:&quot; or &quot;Dr. Chloe:&quot;).
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: Audio Synthesis Engine, Player & Dispatch Station */}
            <div className="space-y-6">

              {/* Real-time Synthesis & Audio Player Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-[#0F172A] border border-amber-500/30 space-y-5 shadow-2xl sticky top-24">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    Audio Engine &amp; Synthesis
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    Zero-Wait Ready
                  </span>
                </div>

                {/* Synthesis Trigger Button */}
                <button
                  onClick={handleSynthesizePreview}
                  disabled={isSynthesizing}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2.5 transition shadow-lg cursor-pointer ${
                    isSynthesizing
                      ? 'bg-amber-400/50 text-black cursor-wait'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-amber-500/20 hover:scale-[1.01]'
                  }`}
                >
                  {isSynthesizing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>Synthesizing with Gemini 3.1 Flash TTS...</span>
                    </>
                  ) : (
                    <>
                      <Radio className="w-4 h-4 text-black" />
                      <span>Generate &amp; Preview Audio</span>
                    </>
                  )}
                </button>

                {/* Live Player Section */}
                {(audioUrl || audioMeta) && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={togglePlayPause}
                          className="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center shadow-md transition"
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                        </button>
                        <div>
                          <div className="text-xs font-bold text-white truncate max-w-[180px]">
                            {profile.title || 'Broadcast Preview'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {audioMeta?.modelUsed || 'gemini-3.8-flash-tts'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono text-xs text-amber-300">
                        {Math.floor(currentTime)}s / {Math.floor(audioDuration || 12)}s
                      </div>
                    </div>

                    {/* Simple Progress Bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full transition-all duration-200"
                        style={{ width: `${audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0}%` }}
                      />
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {audioMeta?.cached && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                          Cached On Disk
                        </span>
                      )}
                      {audioMeta?.voiceName && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          Voice: {audioMeta.voiceName}
                        </span>
                      )}
                      {profile.isMultiSpeaker && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                          Multi-Speaker Dual Track
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Commissioner Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={handleSaveProfile}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Save as Active League Broadcast Profile</span>
                  </button>

                  <button
                    onClick={handlePublishDispatch}
                    disabled={dispatchPublished}
                    className="w-full py-2.5 px-4 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-amber-400" />
                    <span>{dispatchPublished ? 'Published to Watercooler Radio!' : 'Broadcast Dispatch to League'}</span>
                  </button>

                  {saveStatus === 'saved' && (
                    <p className="text-xs text-emerald-400 text-center font-semibold animate-pulse">
                      Active profile saved! Commentary across the league will now reflect these notes.
                    </p>
                  )}
                </div>

                {/* Prompt Guide Specifications Reference Card */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-300">
                    <Info className="w-3.5 h-3.5 text-amber-400" />
                    <span>Gemini Prompt Guide Format</span>
                  </div>
                  <p className="leading-relaxed">
                    Per Google AI Studio guidelines, bracketed directives like <code className="text-amber-300 font-mono">[pause]</code> or <code className="text-amber-300 font-mono">[shouting with passion]</code> seamlessly shape pacing, tone, and inflection without triggering content filters.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: YAHOO LOCK WINDOWS & AUTOMATED INGESTION                       */}
      {/* ========================================================================= */}
      {activeSubTab === 'lock-windows' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  Staggered Kickoff Lock Windows (Week 1)
                </h2>
                <p className="text-xs text-slate-400">
                  Automated background daemon checks games every 60 seconds and synchronizes picks upon kickoff.
                </p>
              </div>

              <button
                onClick={() => syncYahooLockWindow()}
                disabled={isSyncingLockWindow}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition flex items-center gap-2 self-start md:self-auto cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLockWindow ? 'animate-spin' : ''}`} />
                <span>{isSyncingLockWindow ? 'Synchronizing...' : 'Force Sync All Windows'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {yahooLockWindows.map(win => (
                <div
                  key={win.id}
                  className={`p-4 rounded-xl border space-y-3 ${
                    win.status === 'synced'
                      ? 'bg-slate-950 border-emerald-500/40'
                      : win.status === 'locked'
                      ? 'bg-slate-950 border-amber-500/40'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{win.name}</span>
                    <KickoffCountdown
                      status={win.status === 'synced' ? 'final' : win.status}
                      compact={true}
                      labelPrefix=""
                      defaultMinutesRemaining={win.id === 'sun_evening' ? 180 : win.id === 'mon_evening' ? 1440 : 0}
                    />
                  </div>

                  <div className="text-xs text-slate-300 font-mono">
                    {win.typicalKickoff} &bull; {win.gamesCount} {win.gamesCount === 1 ? 'Game' : 'Games'}
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-400">
                    {win.gamesList.map((g, idx) => (
                      <div key={idx} className="truncate">
                        &bull; {g}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 truncate max-w-[160px]">
                      {win.lastSyncResult || 'Awaiting lock window'}
                    </span>
                    <button
                      onClick={() => syncYahooLockWindow(win.id)}
                      disabled={isSyncingLockWindow}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                    >
                      Sync Window
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Audit Trail Stream */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Automated Lock Ingestion Audit Trail
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Window</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Trigger Source</th>
                    <th className="py-2.5 px-3">Games Locked</th>
                    <th className="py-2.5 px-3">Revealed Picks</th>
                    <th className="py-2.5 px-3">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {syncAuditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3 text-slate-400">{log.timestamp.split('T')[1]?.slice(0, 8) || log.timestamp}</td>
                      <td className="py-2 px-3 text-white font-bold">{log.windowName}</td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] uppercase">
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-300">{log.triggerSource}</td>
                      <td className="py-2 px-3 text-center">{log.gamesLockedCount}</td>
                      <td className="py-2 px-3 text-center text-amber-300 font-bold">{log.revealedPicksCount}</td>
                      <td className="py-2 px-3 text-slate-400 max-w-xs truncate">{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: POOL ROSTER & PICK INTEGRITY                                   */}
      {/* ========================================================================= */}
      {activeSubTab === 'pool-roster' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  The Initech 12: Manager Roster &amp; Confidence Card Ledger
                </h2>
                <p className="text-xs text-slate-400">
                  Inspect locked points, active sweat game allocations, and closing line expected values.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map(team => (
                <div
                  key={team.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-black shadow"
                      style={{ backgroundColor: team.color }}
                    >
                      {team.avatar}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{team.ownerName}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({team.teamName})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Rank #{team.rank} &bull; Locked: {team.lockedPoints} pts &bull; Max: {team.maxPossible} pts
                      </div>
                      <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                        Status: {team.statusText}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold ${
                        team.destinyStatus === 'controls_destiny'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : team.destinyStatus === 'alive'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {team.destinyStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Shortcut to CSV Vault */}
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Offline Roster Backup &amp; CSV Failover Vault</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                      SAFEGUARD
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Need to manually ingest offline picks, export an immutable kickoff audit receipt, or download the template?
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveSubTab('pool-csv-vault')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 transition cursor-pointer shadow shrink-0"
              >
                <span>Open CSV Vault</span>
                <span className="text-purple-200">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB: POOL CSV BACKUP & INGESTION VAULT                                */}
      {/* ========================================================================= */}
      {activeSubTab === 'pool-csv-vault' && (
        <CsvImportExportVault />
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB: LEAGUE TREASURY & PAYOUT STRUCTURE                               */}
      {/* ========================================================================= */}
      {activeSubTab === 'payout-schedule' && (
        <div className="space-y-6">
          <LeagueTreasuryCard />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: RULEBOOK & TIEBREAKERS                                         */}
      {/* ========================================================================= */}
      {activeSubTab === 'governance' && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              The Initech Invitational Official Constitution &amp; Pool Bylaws
            </h2>
            <p className="text-xs text-slate-400">
              Approved unanimously by the High Table prior to Kickoff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <h3 className="font-bold text-white uppercase text-xs text-amber-400">
                  Article I: Confidence Point Allocation
                </h3>
                <p className="leading-relaxed text-slate-400">
                  Managers must assign unique integer weights from 16 (highest conviction) down to 1 (lowest conviction) across all 16 weekly NFL contests. Duplicate point assignments result in immediate invalid card rejection.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <h3 className="font-bold text-white uppercase text-xs text-amber-400">
                  Article II: Strict Staggered Kickoff Deadlines
                </h3>
                <p className="leading-relaxed text-slate-400">
                  Picks lock strictly at the official kickoff of each respective game. Thursday Night Football locks only Thursday games. Sunday Morning slate locks at 1:00 PM EDT. Late Sunday locks at 4:25 PM EDT. Sunday Night locks at 8:20 PM EDT. Monday Night Football locks at 8:15 PM EDT.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white uppercase text-xs text-amber-400">
                    Article III: No Tiebreakers — Even Prize Split Rule
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono font-bold">
                    OFFICIAL RULE
                  </span>
                </div>
                <p className="leading-relaxed text-slate-300">
                  For this season, there are <strong className="text-white">NO tiebreakers</strong> under any circumstances. If two or more managers finish tied in weekly total points (or season-long pool standings), the winners <strong className="text-amber-400">split the prize evenly</strong>.
                </p>
                <p className="leading-relaxed text-slate-400 text-[11px] pt-1 border-t border-slate-900">
                  Monday Night Football total score projections and secondary anchor picks are completely disregarded for prize allocations. If managers tie, the payout pot is divided equally.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <h3 className="font-bold text-white uppercase text-xs text-amber-400">
                  Article IV: Commissioner Executive Discretion
                </h3>
                <p className="leading-relaxed text-slate-400">
                  The Commissioner reserves the sole prerogative to issue official league audio memorandums and broadcast rulings via the Gemini 3.1 Flash TTS Audio Profile Studio. All rulings posted to the Watercooler are final.
                </p>
              </div>
            </div>

            {/* Article V: Payout Schedule */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white uppercase text-xs text-amber-400">
                  Article V: 2026–2027 Official Prize Fund &amp; Payout Distribution
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  TOTAL FUND: $600
                </span>
              </div>
              <p className="leading-relaxed text-slate-300">
                The league fund is comprised of 12 franchises with $50 entry dues (payable via Venmo <strong className="text-white">@Todd-Reimer</strong>).
                Weekly payouts total <strong className="text-white">$450</strong> ($25/week &times; 18 regular season weeks).
                The overall Playoff champion (most cumulative points across Playoff Weeks 1–4) receives <strong className="text-white">$25</strong>.
                Season-long podium awards: 1st Place Champion receives <strong className="text-white">$50 + Official Trophy</strong>, 2nd Place receives <strong className="text-white">$15</strong>, and 3rd Place receives <strong className="text-white">$10</strong>.
                The remaining $50 is allocated for the league trophy fund and High Table administration.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
