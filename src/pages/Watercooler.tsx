import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTeam } from '../context/TeamContext';
import { useAudioProfile } from '../context/AudioProfileContext';
import { AUDIO_TRACKS } from '../data/mockData';
import { AudioBroadcastTrack, TalkShowSpeaker } from '../types';
import { EndOfDayRecap } from '../components/EndOfDayRecap';
import { speechEngine } from '../utils/speechEngine';
import {
  Radio,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  Flame,
  MessageSquare,
  Bot,
  Music,
  RefreshCw,
  Download,
  Sliders,
  Mic,
  CheckCircle2,
  FastForward,
  Rewind,
  AlertCircle,
  Film,
  Coffee,
  FileText,
  Eye,
  EyeOff,
  User,
  MapPin,
  Users,
  Cpu,
  Zap,
} from 'lucide-react';

interface VoiceOption {
  id: string;
  name: string;
  label: string;
  gender: string;
  badge: string;
  desc: string;
}

const GEMINI_VOICES: VoiceOption[] = [
  { id: 'Fenrir', name: 'Fenrir', label: 'Coach Ditka (Halsted Beef)', gender: 'Male', badge: 'Ditka Baritone', desc: 'Deep, gravelly South-Side baritone with table slaps, cigar wheezes, and authentic Chicago grit' },
  { id: 'Kore', name: 'Kore', label: 'Dr. Chloe Vance (MIT Analytics)', gender: 'Female', badge: 'Crisp & Sharp', desc: 'Sharp, authoritative analyst dissecting win probability collapse, EPA/play, and confidence allocations' },
  { id: 'Puck', name: 'Puck', label: 'The Commish / Kev Callahan', gender: 'Male', badge: 'Executive Baritone', desc: 'Deadpan commissioner authority or fast-paced AM radio screamer' },
  { id: 'Zephyr', name: 'Zephyr', label: 'Rex "Big Gunslinger" McCoy', gender: 'Male', badge: 'Texas Swagger', desc: 'Deep, booming Southern football booster obsessed with arm talent, quarterbacks, and 60-yard bombs' },
  { id: 'Charon', name: 'Charon', label: 'Rex Vance (Texas Smoker Tailgate)', gender: 'Male', badge: 'Charon (Texas Drawl)', desc: 'Warm, booming Southern drawl with hearty chuckles, hickory smoker swagger, and 16-point chalk locks' },
];

export interface HostPersonaOption {
  id: string;
  name: string;
  title: string;
  role: string;
  archetype: string;
  voiceName: string;
  avatar: string;
  color: string;
  badge: string;
  tagline: string;
  description: string;
  promptBio?: string;
}

export type CoHostOption = HostPersonaOption;

export const SPEAKER_PERSONAS: HostPersonaOption[] = [
  {
    id: 'sal',
    name: 'Sal',
    title: 'Coach Sal "Da Bear" Ditkofsky',
    role: "Proprietor, Vito & Sal's Beef (35th & Halsted) • 1985 Bears Diehard",
    archetype: 'South-Side Beef Counter Legend',
    voiceName: 'Fenrir',
    avatar: '🥩',
    color: '#EA580C',
    badge: 'Fenrir (Ditka Baritone)',
    tagline: 'Run da damn ball 40 times and punch \'em in da mouth!',
    description: 'Passionate South-Side Chicago beef counter legend with table slaps, Ditka swagger, and Bears loyalty.',
    promptBio: 'A 61-year-old South-Side Chicago Italian beef proprietor and 1985 Bears diehard. Speaks with a thick Mike Ditka accent ("da", "dis", "dat", "wit"), loves running the ball, slaps the table, scoffs at computers and fancy analytics.',
  },
  {
    id: 'rex',
    name: 'Rex Vance',
    title: 'Rex "Big Chalk" Vance',
    role: 'Texas Oilman, AT&T Stadium Smoker Master & 16-Pt Chalk Bettor',
    archetype: 'Texas Big-Chalk Tailgate',
    voiceName: 'Charon',
    avatar: '🤠',
    color: '#8B5CF6',
    badge: 'Charon (Texas Drawl)',
    tagline: 'When the Cowboys are laying three and a hook, slam 16 points and don\'t look back!',
    description: 'Boisterous Dallas tailgater with hickory smoke, booming laughter, and 16-point chalk locks.',
    promptBio: 'A boisterous Dallas oilman and hardcore tailgater outside AT&T Stadium. Speaks with a warm, hearty Southern drawl, bursts into booming laughter, loves slamming 16-point anchors on heavy favorites, scoffs at overthinking, and smells like hickory wood smoke.',
  },
  {
    id: 'chloe',
    name: 'Chloe',
    title: 'Dr. Chloe "The Algorithm" Vance',
    role: 'MIT Sloan Sports Analytics Director & NextGen Stats Lead',
    archetype: 'Ivy League Analytics Prodigy',
    voiceName: 'Kore',
    avatar: '📊',
    color: '#06B6D4',
    badge: 'Kore (Sharp & Articulate)',
    tagline: 'Expected Points Added > Your gut instinct and beef grease.',
    description: 'Sips matcha latte, cites EPA/play, Monte Carlo win probability, and tears apart irrational picks.',
    promptBio: 'A 28-year-old MIT Sloan analytics director who sips matcha latte, cites Expected Points Added (EPA/play), win-probability charts, and dissects football through cold mathematical regression.',
  },
  {
    id: 'commish',
    name: 'The Commish',
    title: 'The Commissioner',
    role: 'Official Custodian of the Initech Invitational Constitution',
    archetype: 'High Table Executive Ruling',
    voiceName: 'Puck',
    avatar: '⚖️',
    color: '#6366F1',
    badge: 'Puck (Deadpan Authority)',
    tagline: 'Retroactive complaints regarding missed locks will be archived directly in the shredder.',
    description: 'Deadpan executive commissioner issuing unbending league memorandums with zero tolerance for whining.',
    promptBio: 'Uncompromising, dry-witted league commissioner. Delivers official league rulings in a deadpan, formal executive baritone with pregnant pauses.',
  },
  {
    id: 'kev',
    name: 'Kev',
    title: 'Kev "The Score" Callahan',
    role: 'AM 670 Sports Radio Screamer & 8-Leg Parlay Degenerate',
    archetype: 'AM Radio Hot-Take Jock',
    voiceName: 'Puck',
    avatar: '⚡',
    color: '#F59E0B',
    badge: 'Puck (High-Tempo Screamer)',
    tagline: 'I put my entire 401(k) on Buffalo! Fire the coordinator!',
    description: 'Rapid-fire, caffeine-fueled caller screaming about blown parlays and calling for every coach to be fired.',
    promptBio: 'A caffeinated, rapid-fire AM 670 sports radio screamer who had heavy confidence on the game, screams about blown picks, interrupts frantically, and demands every coach get fired immediately.',
  },
  {
    id: 'marty',
    name: 'Marty',
    title: 'Marty "The Book" Miller',
    role: 'Vegas Strip Syndicate Sharp & Line Maker',
    archetype: 'Vegas Closing Line Sharp',
    voiceName: 'Charon',
    avatar: '🎲',
    color: '#10B981',
    badge: 'Charon (Gritty Legend)',
    tagline: 'The public buys tickets; the sharps cash the tickets.',
    description: 'Cynical desert oddsmaker tracking steam moves, weather anomalies, and backdoor covers.',
    promptBio: 'A grizzled Las Vegas syndicate oddsmaker who speaks in a low, gravelly rasp about closing line value (CLV), steam chasers, referee tendencies, and backdoor covers.',
  },
];

export const COHOST_OPTIONS: HostPersonaOption[] = SPEAKER_PERSONAS;

interface StylePreset {
  id: string;
  label: string;
  prompt: string;
  icon: string;
}

const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'rapid_crossfire',
    label: 'Rapid-Fire Crosstalk & Gridiron Debate',
    prompt: 'Deliver as a fast-paced, high-voltage sports debate between Coach Sal Ditkofsky (gravelly South-Side Ditka accent, table slaps, gut-instinct grit) and the co-host (rapid-fire, witty, sharp retorts, interrupting each other in comedic sports radio rhythm).',
    icon: '🎙️',
  },
  {
    id: 'score_radio',
    label: 'AM 670 The Score Screamer Meltdown',
    prompt: 'Deliver in a furious, caffeine-fueled sports radio screaming match. Voices cracking with emotion, banging the laminate counter, shouting over the line, demanding coaches be fired, and wailing over blown confidence points.',
    icon: '⚡',
  },
  {
    id: 'blues',
    label: 'South-Side Blues & Choke Lament',
    prompt: 'Deliver in a slow, mournful, world-weary South-Side Chicago blues cadence with deep sighs, soft chuckles, and heartbroken wisdom dissecting the tragic collapse at the goal-line.',
    icon: '🎷',
  },
  {
    id: 'celebratory_85',
    label: '1985 Championship Swagger & Victory Roast',
    prompt: 'Deliver with booming, triumphant 1985 Bears victory energy. Roaring with laughter, slapping the counter, toasting Old Style beer, and relentlessly roasting the weekly loser with thick Chicago swagger.',
    icon: '🏆',
  },
];

export const Watercooler: React.FC = () => {
  const {
    comments,
    addComment,
    addReaction,
    currentTeam,
    teams,
    games,
    activeSweatGame,
    setIsYahooSyncModalOpen,
    currentWeek,
    setCurrentWeek,
  } = useTeam();
  const [playlist, setPlaylist] = useState<AudioBroadcastTrack[]>(AUDIO_TRACKS);
  const [activeTrack, setActiveTrack] = useState<AudioBroadcastTrack>(
    currentWeek === 2 ? AUDIO_TRACKS.find(t => t.id === 'track-1-w2') || AUDIO_TRACKS[0] : AUDIO_TRACKS[0]
  );

  // Audio Playback & Synthesis State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(activeTrack.durationSeconds || 88);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1.0);

  // Talk Show Multi-Speaker Gemini TTS Configuration with persistent localStorage
  const [selectedSpeaker1PersonaId, setSelectedSpeaker1PersonaId] = useState<string>(() => {
    return localStorage.getItem('watercooler_speaker1_persona') || 'sal';
  });
  const [selectedVoice1, setSelectedVoice1] = useState<string>(() => {
    return localStorage.getItem('watercooler_voice1') || 'Fenrir';
  });
  const [selectedVoice2, setSelectedVoice2] = useState<string>(() => {
    return localStorage.getItem('watercooler_voice2') || 'Kore';
  });
  const [selectedCohostId, setSelectedCohostId] = useState<string>(() => {
    return localStorage.getItem('watercooler_cohost') || 'chloe';
  });
  const [selectedStyleId, setSelectedStyleId] = useState<string>(() => {
    return localStorage.getItem('watercooler_style') || 'rapid_crossfire';
  });
  const { profile: activeAudioProfile, primaryHost, coHost, currentModel: activeTtsModel } = useAudioProfile();
  const [commissionerProfile, setCommissionerProfile] = useState<any>(activeAudioProfile);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);
  const [activeModelUsed, setActiveModelUsed] = useState<string>('gemini-3.8-flash-tts');
  const [audioUrlMap, setAudioUrlMap] = useState<Record<string, string>>({});
  const [ttsQuotaExceeded, setTtsQuotaExceeded] = useState<boolean>(false);
  const [isHighDemand, setIsHighDemand] = useState<boolean>(false);
  const [ttsNotice, setTtsNotice] = useState<string | null>(null);

  // Synchronize with active Commissioner Audio Profile immediately
  useEffect(() => {
    if (activeAudioProfile) {
      setCommissionerProfile(activeAudioProfile);
      if (primaryHost?.voiceName) {
        setSelectedVoice1(primaryHost.voiceName);
      }
      if (coHost?.voiceName) {
        setSelectedVoice2(coHost.voiceName);
      }

      const isTexas = activeAudioProfile.id === 'profile-texas-chalk' || activeAudioProfile.name?.toLowerCase().includes('texas');
      const isMit = activeAudioProfile.id === 'profile-mit-sloan' || activeAudioProfile.name?.toLowerCase().includes('mit');
      const isCommish = activeAudioProfile.id === 'profile-commish-ruling' || activeAudioProfile.name?.toLowerCase().includes('commish');

      if (isTexas) {
        setSelectedSpeaker1PersonaId('rex');
      } else if (isMit) {
        setSelectedSpeaker1PersonaId('chloe');
      } else if (isCommish) {
        setSelectedSpeaker1PersonaId('commish');
      } else {
        setSelectedSpeaker1PersonaId('sal');
      }
    }
  }, [activeAudioProfile, primaryHost, coHost]);

  const handleSaveVoiceConfig = () => {
    localStorage.setItem('watercooler_speaker1_persona', selectedSpeaker1PersonaId);
    localStorage.setItem('watercooler_voice1', selectedVoice1);
    localStorage.setItem('watercooler_voice2', selectedVoice2);
    localStorage.setItem('watercooler_cohost', selectedCohostId);
    localStorage.setItem('watercooler_style', selectedStyleId);
    const spk1Obj = dynamicSpeakerPersonas.find(p => p.id === selectedSpeaker1PersonaId) || dynamicSpeakerPersonas[0];
    const cohostObj = dynamicSpeakerPersonas.find(c => c.id === selectedCohostId) || dynamicSpeakerPersonas[1];
    const styleObj = STYLE_PRESETS.find(s => s.id === selectedStyleId) || STYLE_PRESETS[0];
    setSaveFeedback(`✓ Saved: ${spk1Obj.name} (${selectedVoice1}) & ${cohostObj.name} (${selectedVoice2}) • ${styleObj.label}`);
    setTimeout(() => {
      setSaveFeedback(null);
    }, 4000);
  };

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

  // Inspector & Custom Prompting State
  const [showPromptInspector, setShowPromptInspector] = useState<boolean>(false);
  const [showSceneDetails, setShowSceneDetails] = useState<boolean>(true);

  // Show Generation State
  const [isGeneratingShow, setIsGeneratingShow] = useState<boolean>(false);
  const [isGeneratingRoast, setIsGeneratingRoast] = useState<boolean>(false);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [showVoiceStudio, setShowVoiceStudio] = useState<boolean>(false);
  const [watercoolerTab, setWatercoolerTab] = useState<'recap' | 'broadcast' | 'chat' | 'all'>('recap');

  const handlePlayRecapAudio = () => {
    const targetTrackId = currentWeek === 2 ? 'track-1-w2' : 'track-1';
    const recapTrack = playlist.find(t => t.id === targetTrackId) || playlist.find(t => t.id === 'track-1') || playlist[0];
    switchTrack(recapTrack);
    setWatercoolerTab('all');
    setTimeout(() => {
      handlePlayPause();
    }, 150);
    const playerEl = document.getElementById('talk-show-player');
    if (playerEl) {
      playerEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePostRecapToChat = () => {
    if (currentWeek === 2) {
      addComment(
        "🤖 [The Commish AI - Week 2 Official Final Report]: Week 2 is in the books! Amy (Bird Boss) has been crowned Champion with 104 points, taking home the entire $25.00 weekly purse! Her 15-pt Las Vegas upset pick was the masterstroke of the week. Steve (Shoeman) captured 2nd place with 99 pts, while Todd Reimer concluded a turbulent slate at 69 pts with SF (16) and LAR (13) in hand."
      );
    } else {
      addComment(
        "🤖 [The Commish AI - End of Day Carnage Report]: SoFi Stadium claimed 11 of 12 pool managers on the Rams (-114 total pts). Only Orange crush hit San Francisco (+10) to seize 1st place with 26 pts. Meanwhile, Todd Reimer holds a league-leading 127 maximum possible points with all top 7 anchors intact for Sunday!"
      );
    }
    setWatercoolerTab('all');
    setTimeout(() => {
      const chatEl = document.getElementById('trash-talk-chat');
      if (chatEl) {
        chatEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechProgressTimerRef = useRef<number | null>(null);

  const stopAllPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    speechEngine.stop();
    if (speechProgressTimerRef.current) {
      clearInterval(speechProgressTimerRef.current);
      speechProgressTimerRef.current = null;
    }
    setIsPlaying(false);
  };

  const playTrackWithSpeechSynthesis = (track: AudioBroadcastTrack) => {
    stopAllPlayback();
    const textToSpeak = track.scriptText || (track.dialogueTurns ? track.dialogueTurns.map(t => `${t.speaker}: ${t.text}`).join('. ') : track.title);
    const estDuration = Math.max(12, Math.round(textToSpeak.split(' ').length / (2.4 * playbackSpeed)));
    setDuration(estDuration);
    setCurrentTime(0);

    if (track.dialogueTurns && track.dialogueTurns.length > 0) {
      speechEngine.speakDialogue(track.dialogueTurns, {
        speaker1Name: track.speaker1?.name || activeSpeaker1Persona.name,
        speaker2Name: track.speaker2?.name || activeCohost.name,
        speaker1Voice: selectedVoice1,
        speaker2Voice: selectedVoice2,
        styleId: selectedStyleId,
        rate: playbackSpeed,
        volume: isMuted ? 0 : volume,
        onStart: () => setIsPlaying(true),
        onSentenceChange: (idx, _sentence, total) => {
          const progressTime = Math.min(estDuration, Math.round(((idx + 0.5) / total) * estDuration));
          setCurrentTime(progressTime);
        },
        onEnd: () => {
          stopAllPlayback();
          setCurrentTime(0);
        },
        onError: () => stopAllPlayback(),
      });
      return;
    }

    const primarySpeaker = track.speaker1?.name?.toLowerCase().includes('chloe') ? 'chloe' : 'sal';

    speechEngine.speakScript(textToSpeak, {
      speaker: primarySpeaker as 'sal' | 'chloe' | 'commish',
      rate: playbackSpeed,
      volume: isMuted ? 0 : volume,
      onStart: () => {
        setIsPlaying(true);
      },
      onSentenceChange: (idx, _sentence, total) => {
        const progressTime = Math.min(estDuration, Math.round(((idx + 0.5) / total) * estDuration));
        setCurrentTime(progressTime);
      },
      onEnd: () => {
        stopAllPlayback();
        setCurrentTime(0);
      },
      onError: () => {
        stopAllPlayback();
      },
    });
  };
  // Dynamic Speaker Personas list that updates with customized host/co-host names, titles, and voices
  const dynamicSpeakerPersonas = useMemo(() => {
    return SPEAKER_PERSONAS.map(p => {
      if (p.id === 'sal') {
        return {
          ...p,
          name: primaryHost.speaker || p.name,
          title: primaryHost.title || p.title,
          avatar: primaryHost.avatar || p.avatar,
          voiceName: primaryHost.voiceName || p.voiceName,
          role: primaryHost.roleContext || p.role,
        };
      }
      if (p.id === 'chloe') {
        return {
          ...p,
          name: coHost.speaker || p.name,
          title: coHost.title || p.title,
          avatar: coHost.avatar || p.avatar,
          voiceName: coHost.voiceName || p.voiceName,
          role: coHost.roleContext || p.role,
        };
      }
      return p;
    });
  }, [primaryHost, coHost]);

  const activeStyle = STYLE_PRESETS.find(s => s.id === selectedStyleId) || STYLE_PRESETS[0];
  const activeSpeaker1Persona = dynamicSpeakerPersonas.find(p => p.id === selectedSpeaker1PersonaId) || dynamicSpeakerPersonas[0];
  const activeCohost = dynamicSpeakerPersonas.find(c => c.id === selectedCohostId) || dynamicSpeakerPersonas[1];

  // Dynamic speaker detection for live talk show avatar pulse
  const turnsCount = activeTrack.dialogueTurns?.length || 0;
  const activeTurnIndex = turnsCount > 0 && duration > 0
    ? Math.min(turnsCount - 1, Math.floor((currentTime / duration) * turnsCount))
    : -1;
  const activeSpeakerName = activeTurnIndex >= 0 ? activeTrack.dialogueTurns![activeTurnIndex]?.speaker : null;

  // Unique cache key for track + personas + voices + style
  const currentCacheKey = activeTrack.isMultiSpeaker
    ? `${activeTrack.id}-${selectedSpeaker1PersonaId}-${selectedCohostId}-${selectedVoice1}-${selectedVoice2}-${selectedStyleId}`
    : `${activeTrack.id}-${selectedVoice1}-${selectedStyleId}`;

  // Only fall back to pre-recorded track.audioUrl if the active track's voices & style match what's selected!
  const defaultVoicesMatch =
    (!activeTrack.speaker1 || activeTrack.speaker1.voiceName === selectedVoice1) &&
    (!activeTrack.speaker2 || activeTrack.speaker2.voiceName === selectedVoice2) &&
    selectedStyleId === 'rapid_crossfire';

  const currentAudioUrl = audioUrlMap[currentCacheKey] || (defaultVoicesMatch ? activeTrack.audioUrl : undefined);

  // Initialize or clean up HTMLAudioElement
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
    };

    const handleError = () => {
      setIsPlaying(false);
      setSynthesisError('Playback error occurred on audio stream.');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Update playback rate and volume when states change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [playbackSpeed, volume, isMuted]);

  // Request Gemini TTS synthesis for text with rich Chicago Ditka + Multi-Speaker context
  const synthesizeTrackAudio = async (
    track: AudioBroadcastTrack,
    voice1: string = selectedVoice1,
    voice2: string = selectedVoice2,
    stylePrompt: string = activeStyle.prompt
  ): Promise<string | null> => {
    const isMulti = Boolean(track.isMultiSpeaker || track.speaker1 || track.dialogueTurns);
    const key = isMulti
      ? `${track.id}-${selectedSpeaker1PersonaId}-${selectedCohostId}-${voice1}-${voice2}-${selectedStyleId}`
      : `${track.id}-${voice1}-${selectedStyleId}`;

    if (audioUrlMap[key]) {
      return audioUrlMap[key];
    }

    setIsSynthesizing(true);
    setSynthesisError(null);

    try {
      const res = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: track.scriptText,
          voiceName: voice1,
          stylePrompt: stylePrompt,
          characterPersona: track.characterPersona,
          sceneBackstory: track.sceneBackstory,
          directorsNotes: track.directorsNotes || stylePrompt,
          fullPromptPayload: track.fullPromptPayload,
          isMultiSpeaker: isMulti,
          speakerVoiceConfigs: isMulti
            ? [
                { speaker: track.speaker1?.name || activeSpeaker1Persona.name, voiceName: voice1 },
                { speaker: track.speaker2?.name || activeCohost.name, voiceName: voice2 },
              ]
            : undefined,
        }),
      });

      if (!res.ok) {
        setAudioUrlMap(prev => ({ ...prev, [key]: 'SPEECH_SYNTHESIS_FALLBACK' }));
        return 'SPEECH_SYNTHESIS_FALLBACK';
      }

      const data = await res.json();
      const generatedUrl = data.audioUrl;

      if (!generatedUrl || data.fallbackToSpeechSynthesis || data.quotaExceeded) {
        setAudioUrlMap(prev => ({ ...prev, [key]: 'SPEECH_SYNTHESIS_FALLBACK' }));
        if (data.quotaExceeded) {
          setTtsQuotaExceeded(true);
          setTtsNotice(data.message || 'Gemini TTS daily quota limit reached (10 requests/day). Playing with browser speech engine.');
        }
        return 'SPEECH_SYNTHESIS_FALLBACK';
      }

      setTtsQuotaExceeded(false);
      setTtsNotice(null);

      setAudioUrlMap(prev => ({
        ...prev,
        [key]: generatedUrl,
      }));

      if (data.modelUsed) {
        setActiveModelUsed(data.modelUsed);
      }

      if (data.durationSeconds) {
        setDuration(data.durationSeconds);
      }

      return generatedUrl;
    } catch {
      setAudioUrlMap(prev => ({ ...prev, [key]: 'SPEECH_SYNTHESIS_FALLBACK' }));
      return 'SPEECH_SYNTHESIS_FALLBACK';
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Handler to clear rate-limit fallback and retry Gemini Neural TTS directly
  const handleRetryGeminiTts = async () => {
    stopAllPlayback();
    setIsSynthesizing(true);
    setSynthesisError(null);

    // Reset cooldown on server
    try {
      await fetch('/api/tts/reset-cooldown', { method: 'POST' });
    } catch {}

    const key = activeTrack.isMultiSpeaker
      ? `${activeTrack.id}-${selectedVoice1}-${selectedVoice2}-${selectedStyleId}`
      : `${activeTrack.id}-${selectedVoice1}-${selectedStyleId}`;

    // Clear cached fallback token
    setAudioUrlMap(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    try {
      const res = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: activeTrack.scriptText,
          voiceName: selectedVoice1,
          stylePrompt: activeStyle.prompt,
          characterPersona: activeTrack.characterPersona,
          sceneBackstory: activeTrack.sceneBackstory,
          directorsNotes: activeTrack.directorsNotes || activeStyle.prompt,
          fullPromptPayload: activeTrack.fullPromptPayload,
          isMultiSpeaker: Boolean(activeTrack.isMultiSpeaker || activeTrack.speaker1),
          speakerVoiceConfigs: [
            { speaker: activeTrack.speaker1?.name || 'Sal', voiceName: selectedVoice1 },
            { speaker: activeTrack.speaker2?.name || activeCohost.name, voiceName: selectedVoice2 },
          ],
          force: true,
        }),
      });

      const data = await res.json();
      if (data.audioUrl && !data.fallbackToSpeechSynthesis) {
        setAudioUrlMap(prev => ({ ...prev, [key]: data.audioUrl }));
        setTtsQuotaExceeded(false);
        setIsHighDemand(false);
        setTtsNotice(null);
        if (data.modelUsed) setActiveModelUsed(data.modelUsed);

        const audio = audioRef.current;
        if (audio) {
          audio.src = data.audioUrl;
          audio.load();
          await audio.play();
          setIsPlaying(true);
        }
      } else {
        setAudioUrlMap(prev => ({ ...prev, [key]: 'SPEECH_SYNTHESIS_FALLBACK' }));
        setTtsQuotaExceeded(Boolean(data.quotaExceeded));
        setIsHighDemand(Boolean(data.isHighDemand));
        setTtsNotice(
          data.message ||
            (data.isHighDemand
              ? 'Gemini TTS is currently experiencing high demand (temporary traffic spike). Continuing with browser speech engine.'
              : 'Gemini TTS free-tier quota reached. Continuing with browser speech engine.')
        );
        playTrackWithSpeechSynthesis(activeTrack);
      }
    } catch {
      setAudioUrlMap(prev => ({ ...prev, [key]: 'SPEECH_SYNTHESIS_FALLBACK' }));
      playTrackWithSpeechSynthesis(activeTrack);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Play / Pause handler with on-demand Gemini TTS synthesis and speech engine fallback
  const handlePlayPause = async () => {
    if (isPlaying) {
      if (speechEngine.isActive() && !speechEngine.isPaused()) {
        speechEngine.pause();
        setIsPlaying(false);
        return;
      }
      stopAllPlayback();
      return;
    }

    if (speechEngine.isPaused()) {
      speechEngine.resume();
      setIsPlaying(true);
      return;
    }

    let urlToPlay = currentAudioUrl;

    // If audio is not yet synthesized, generate it with Gemini TTS now
    if (!urlToPlay) {
      const synthesized = await synthesizeTrackAudio(activeTrack, selectedVoice1, selectedVoice2, activeStyle.prompt);
      if (!synthesized) return;
      urlToPlay = synthesized;
    }

    if (urlToPlay === 'SPEECH_SYNTHESIS_FALLBACK') {
      playTrackWithSpeechSynthesis(activeTrack);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (audio.src !== urlToPlay) {
        audio.src = urlToPlay;
        audio.load();
      }
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.warn('WAV playback failed, falling back to speech synthesis:', err);
      playTrackWithSpeechSynthesis(activeTrack);
    }
  };

  // Switch to another recap track
  const switchTrack = (track: AudioBroadcastTrack) => {
    stopAllPlayback();
    setActiveTrack(track);
    setCurrentTime(0);
    setSynthesisError(null);

    // If already synthesized, update duration
    const key = track.isMultiSpeaker
      ? `${track.id}-${selectedVoice1}-${selectedVoice2}-${selectedStyleId}`
      : `${track.id}-${selectedVoice1}-${selectedStyleId}`;

    if (audioUrlMap[key] && audioRef.current) {
      audioRef.current.src = audioUrlMap[key];
      audioRef.current.load();
    } else {
      setDuration(track.durationSeconds || 74);
    }
  };

  // Seek bar scrub
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = newTime;
    }
    if (speechEngine.isActive()) {
      const total = speechEngine.getTotalSentences();
      if (total > 0 && duration > 0) {
        const targetSentence = Math.min(total - 1, Math.max(0, Math.floor((newTime / duration) * total)));
        speechEngine.seekToSentence(targetSentence);
      }
    }
  };

  // Skip forward / rewind 5 seconds
  const handleSkip = (seconds: number) => {
    const nextTime = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(nextTime);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = nextTime;
    }
    if (speechEngine.isActive()) {
      const total = speechEngine.getTotalSentences();
      if (total > 0 && duration > 0) {
        const targetSentence = Math.min(total - 1, Math.max(0, Math.floor((nextTime / duration) * total)));
        speechEngine.seekToSentence(targetSentence);
      }
    }
  };

  // Regenerates the script with Gemini LLM AND synthesizes multi-speaker audio based on selected speakers & debate cadence
  const handleApplyAndRegenerateScript = async () => {
    stopAllPlayback();
    setIsGeneratingShow(true);
    setIsSynthesizing(true);
    setSynthesisError(null);

    // Persist user choices immediately
    localStorage.setItem('watercooler_speaker1_persona', selectedSpeaker1PersonaId);
    localStorage.setItem('watercooler_voice1', selectedVoice1);
    localStorage.setItem('watercooler_voice2', selectedVoice2);
    localStorage.setItem('watercooler_cohost', selectedCohostId);
    localStorage.setItem('watercooler_style', selectedStyleId);

    try {
      const sortedTeams = [...teams].sort((a, b) => b.actualPoints - a.actualPoints);
      const topTeam = currentWeek === 2 ? { ownerName: 'Amy', teamName: 'Bird Boss' } : (sortedTeams[0] || currentTeam);
      const secondTeam = currentWeek === 2 ? { ownerName: 'Steve', teamName: 'Shoeman' } : (sortedTeams[1] || currentTeam);
      const sweatMatchup = currentWeek === 2 ? 'LV @ BAL (+15 pt dog upset)' : (activeSweatGame ? `${activeSweatGame.awayTeamCode} vs ${activeSweatGame.homeTeamCode}` : 'BUF vs KC');
      const margin = currentWeek === 2 ? 5 : (activeSweatGame ? Math.abs(activeSweatGame.homeScore - activeSweatGame.awayScore) || 3 : 3);

      const res = await fetch('/api/broadcast/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekNumber: currentWeek || 2,
          winner: `${topTeam.ownerName} (${topTeam.teamName})`,
          chaser: `${secondTeam.ownerName} (${secondTeam.teamName})`,
          sweatGame: sweatMatchup,
          margin,
          leagueGroup: 'The Initech Invitational',
          speaker1Persona: selectedSpeaker1PersonaId,
          speaker2Persona: selectedCohostId,
          speaker1Voice: selectedVoice1,
          speaker2Voice: selectedVoice2,
          cohostArchetype: selectedCohostId,
          debateCadence: activeStyle.label,
          cadencePrompt: activeStyle.prompt,
          stylePrompt: activeStyle.prompt,
          activeProfileId: commissionerProfile?.id || '',
        }),
      });

      if (!res.ok) {
        throw new Error(`Broadcast generation failed with status ${res.status}`);
      }

      const data = await res.json();
      const trackId = `track-${Date.now()}`;

      const speaker1Data: TalkShowSpeaker = {
        id: activeSpeaker1Persona.id,
        name: data.speaker_1?.name || activeSpeaker1Persona.name,
        voiceName: selectedVoice1,
        title: activeSpeaker1Persona.title,
        role: activeSpeaker1Persona.role,
        avatar: activeSpeaker1Persona.avatar,
        color: activeSpeaker1Persona.color,
        tagline: activeSpeaker1Persona.tagline,
        archetype: activeSpeaker1Persona.archetype
      };

      const speaker2Data: TalkShowSpeaker = {
        id: activeCohost.id,
        name: data.speaker_2?.name || activeCohost.name,
        voiceName: selectedVoice2,
        title: activeCohost.title,
        role: activeCohost.role,
        avatar: activeCohost.avatar,
        color: activeCohost.color,
        tagline: activeCohost.tagline,
        archetype: activeCohost.archetype
      };

      const newTrack: AudioBroadcastTrack = {
        id: trackId,
        title: data.headline || `🎙️ Halsted & Ivy: "${data.show_title || 'The Gridiron Dispute'}"`,
        subtitle: `${speaker1Data.name} (${selectedVoice1}) & ${speaker2Data.name} (${selectedVoice2}) • ${activeStyle.label}`,
        duration: data.durationSeconds ? `00:${data.durationSeconds < 10 ? '0' : ''}${data.durationSeconds}` : '01:28',
        durationSeconds: data.durationSeconds || 88,
        category: 'radio',
        accentColor: activeCohost.color || '#EA580C',
        icon: activeCohost.avatar || '🎙️',
        soundStyle: `${activeStyle.label} • (${speaker1Data.name} & ${speaker2Data.name})`,
        scriptText: data.radio_script_text,
        audioUrl: data.audioUrl,
        voiceName: `${selectedVoice1} + ${selectedVoice2}`,
        modelUsed: data.modelUsed || 'gemini-3.8-flash-tts',
        characterPersona: data.character_persona,
        sceneBackstory: data.scene_backstory,
        directorsNotes: `${activeStyle.prompt}. Speaker 1 (${selectedVoice1}) is ${speaker1Data.name}. Speaker 2 (${selectedVoice2}) is ${speaker2Data.name}.`,
        fullPromptPayload: data.full_tts_prompt,
        isMultiSpeaker: true,
        speaker1: speaker1Data,
        speaker2: speaker2Data,
        dialogueTurns: data.dialogue_turns || [
          { speaker: speaker1Data.name, text: `Hold the phone! We got ${speaker2Data.name} in the studio. You see what happened in Week 2? Amy took the whole twenty-five dollar purse with Las Vegas at Baltimore!` },
          { speaker: speaker2Data.name, text: `${speaker1Data.name}, the closing line value was insane. Lamar had them at the goal line, but Gardner Minshew threw fire.` },
          { speaker: speaker1Data.name, text: `Fire? He threw luck into the Chesapeake Bay! Shoeman Steve was sitting pretty until that final field goal!` },
          { speaker: speaker2Data.name, text: `Steve still walks away with second place at ninety-nine points, but Todd Reimer got completely flattened with sixteen points on San Francisco.` },
          { speaker: speaker1Data.name, text: `Sixteen points on Shanahan against Sam Darnold?! Gimme a break! Next week Todd's gonna need a double order of Italian beef just to recover!` }
        ],
      };

      const key = `${trackId}-${selectedSpeaker1PersonaId}-${selectedCohostId}-${selectedVoice1}-${selectedVoice2}-${selectedStyleId}`;
      if (data.audioUrl) {
        setAudioUrlMap(prev => ({
          ...prev,
          [key]: data.audioUrl,
        }));
      }

      setPlaylist(prev => [newTrack, ...prev]);
      setActiveTrack(newTrack);
      setCurrentTime(0);

      if (data.durationSeconds) {
        setDuration(data.durationSeconds);
      }
      if (data.modelUsed) {
        setActiveModelUsed(data.modelUsed);
      }

      setSaveFeedback(`✓ Generated & Applied: ${speaker1Data.name} (${selectedVoice1}) & ${speaker2Data.name} (${selectedVoice2}) in "${activeStyle.label}" cadence!`);

      if (data.audioUrl && !data.fallbackToSpeechSynthesis && audioRef.current) {
        audioRef.current.src = data.audioUrl;
        audioRef.current.load();
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (playErr) {
          console.warn('Playback autoplay was blocked by browser, switching to speech engine:', playErr);
          playTrackWithSpeechSynthesis(newTrack);
        }
      } else {
        // Immediately synthesize using multi-speaker alternating speech engine with selected voices & cadence
        playTrackWithSpeechSynthesis(newTrack);
      }

      addComment(`🎙️ [Halsted & Ivy Studio]: Fresh script generated for ${speaker1Data.name} (${selectedVoice1}) & ${speaker2Data.name} (${selectedVoice2}) in "${activeStyle.label}" cadence!`);
    } catch (e: any) {
      console.error('Failed to regenerate script and broadcast:', e);
      setSynthesisError(e.message || 'Failed to regenerate broadcast show.');
    } finally {
      setIsGeneratingShow(false);
      setIsSynthesizing(false);
    }
  };

  const generateNewShow = handleApplyAndRegenerateScript;
  const handleResynthesize = handleApplyAndRegenerateScript;

  // Generate Commish AI roast directly into chat
  const generateCommishRoast = async () => {
    setIsGeneratingRoast(true);
    try {
      const res = await fetch('/api/roast/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetName: 'Dave (Chalk King)',
          reason: 'blew a 14-point confidence pick on Buffalo at the 2-yard line',
          score: 96,
        }),
      });
      const data = await res.json();
      addComment(`🤖 [AI Commish Stat Roast]: ${data.roast}`);
    } catch {
      addComment("🤖 [AI Commish Stat Roast]: Stat Alert: Dave's closing line luck index has hit an all-time low of -28.4%. The computer models recommend flipping a quarter next Sunday.");
    } finally {
      setIsGeneratingRoast(false);
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    addComment(newCommentText);
    setNewCommentText('');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="border-b border-[#1E293B] pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase">
            <Radio className="w-4 h-4 text-amber-400" />
            <span>Section 7.0 & 8.0 • Automated AI Media & Multi-Speaker Sports Talk Show</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <span>{activeAudioProfile?.name || 'Halsted & Ivy: The Gridiron Talk Show Studio'}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-950 to-purple-950 text-amber-300 border border-orange-700/60 font-mono font-bold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-orange-400" />
              <span>Multi-Speaker Gemini 3.8 TTS</span>
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Prompt-steered dual-host sports debate pairing <span className="text-amber-400 font-bold">{primaryHost.speaker} ({primaryHost.voiceName})</span> with <span className="text-cyan-400 font-bold">{coHost.speaker} ({coHost.voiceName})</span>, powered by <span className="text-purple-400 font-mono">gemini-3.8-flash-tts</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsYahooSyncModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/80 text-purple-200 font-mono text-xs font-semibold transition"
            title="Inspect Initech Invitational and ESPN live score feed"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Grounded: Initech Invitational</span>
          </button>

          <button
            onClick={generateNewShow}
            disabled={isGeneratingShow}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-purple-700 hover:from-orange-500 hover:to-purple-600 disabled:opacity-50 text-white font-bold text-xs transition shadow-lg shadow-orange-900/40 self-start md:self-auto cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isGeneratingShow ? 'animate-spin' : ''}`} />
            <span>{isGeneratingShow ? 'Generating Talk Show Episode...' : 'Record New Talk Show Episode 🎙️'}</span>
          </button>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0D131F] border border-[#1E293B] p-2 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setWatercoolerTab('recap')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              watercoolerTab === 'recap'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-[#151D2A] text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>📊 End-of-Day Gridiron Recap & Outlook</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-mono font-bold">
              2 of 16 Final
            </span>
          </button>

          <button
            onClick={() => setWatercoolerTab('broadcast')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              watercoolerTab === 'broadcast'
                ? 'bg-gradient-to-r from-orange-600 to-purple-700 text-white shadow-lg shadow-orange-950/50'
                : 'bg-[#151D2A] text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>🎙️ Talk Show Studio Broadcast</span>
          </button>

          <button
            onClick={() => setWatercoolerTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              watercoolerTab === 'chat'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-950/50'
                : 'bg-[#151D2A] text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>💬 Trash-Talk Thread</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono">
              {comments.length}
            </span>
          </button>

          <button
            onClick={() => setWatercoolerTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              watercoolerTab === 'all'
                ? 'bg-slate-700 text-white'
                : 'bg-[#151D2A] text-slate-400 hover:text-slate-200'
            }`}
          >
            Show All
          </button>
        </div>

        <div className="flex items-center gap-3 pr-2">
          {/* Week Toggle */}
          <div className="flex items-center bg-[#0B0F17] rounded-lg p-0.5 border border-slate-700/80">
            <button
              onClick={() => setCurrentWeek(1)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                currentWeek === 1
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Wk 1
            </button>
            <button
              onClick={() => setCurrentWeek(2)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                currentWeek === 2
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Wk 2 Final
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Status:</span>
            <span className="text-emerald-400 font-bold">
              {currentWeek === 2 ? 'All 16 Games Final • Bird Boss Champion (104 pts)' : '14 Games Remaining (2 Final)'}
            </span>
          </div>
        </div>
      </div>

      {/* 1. END-OF-DAY RECAP & OUTLOOK */}
      {(watercoolerTab === 'recap' || watercoolerTab === 'all') && (
        <EndOfDayRecap
          onPlayRecapAudio={handlePlayRecapAudio}
          onPostRecapToChat={handlePostRecapToChat}
        />
      )}

      {/* 2. DUAL-HOST TALK SHOW BROADCAST STUDIO */}
      {(watercoolerTab === 'broadcast' || watercoolerTab === 'all') && (
        <div id="talk-show-player" className="space-y-8 animate-in fade-in duration-300">
          {/* DUAL-HOST ON-AIR BROADCAST DECK */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Host 1: Dynamic Character Persona & Profile */}
          <div className={`rounded-xl p-4 border transition-all duration-300 bg-gradient-to-br from-[#121927] to-[#0D121D] ${
            isPlaying && (activeSpeakerName === activeSpeaker1Persona.name || (!activeSpeakerName && currentTime > 0))
              ? 'border-orange-500 shadow-lg shadow-orange-950/50 ring-1 ring-orange-500/50'
              : 'border-slate-800'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl border flex items-center justify-center text-2xl shadow-inner shrink-0"
                  style={{ backgroundColor: `${activeSpeaker1Persona.color}20`, borderColor: activeSpeaker1Persona.color }}
                >
                  {activeSpeaker1Persona.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white tracking-tight">{activeSpeaker1Persona.title}</h4>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded border"
                      style={{ backgroundColor: `${activeSpeaker1Persona.color}20`, borderColor: activeSpeaker1Persona.color, color: activeSpeaker1Persona.color }}
                    >
                      Host 1 • {activeSpeaker1Persona.archetype}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {activeSpeaker1Persona.role}
                  </p>
                </div>
              </div>

              {isPlaying && (activeSpeakerName === activeSpeaker1Persona.name || !activeSpeakerName) && (
                <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-orange-500/20 border border-orange-500/40 text-[10px] font-mono text-orange-300 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                  <span>ON AIR</span>
                </span>
              )}
            </div>

            {/* Host 1 Quick Switcher Pills */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
              <span className="text-slate-400">Switch Speaker 1:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {dynamicSpeakerPersonas.map(p => {
                  const isActive = selectedSpeaker1PersonaId === p.id;
                  return (
                    <button
                      key={`h1-${p.id}`}
                      onClick={() => {
                        setSelectedSpeaker1PersonaId(p.id);
                        setSelectedVoice1(p.voiceName);
                        localStorage.setItem('watercooler_speaker1_persona', p.id);
                        localStorage.setItem('watercooler_voice1', p.voiceName);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition flex items-center gap-1 cursor-pointer ${
                        isActive
                          ? 'bg-orange-950 text-orange-200 border border-orange-500 font-bold shadow'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span>{p.avatar}</span>
                      <span>{p.name}</span>
                    </button>
                  );
                })}

                <button
                  onClick={handleApplyAndRegenerateScript}
                  disabled={isSynthesizing || isGeneratingShow}
                  className="ml-1 px-2.5 py-1 rounded bg-orange-600/90 hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition shadow"
                  title="Regenerate script and audio with newly selected Speaker 1 persona"
                >
                  <RefreshCw className={`w-3 h-3 ${isSynthesizing || isGeneratingShow ? 'animate-spin' : ''}`} />
                  <span>Apply</span>
                </button>
              </div>
            </div>
          </div>

          {/* Host 2: Co-Host Switcher & Profile */}
          <div className={`rounded-xl p-4 border transition-all duration-300 bg-gradient-to-br from-[#121927] to-[#0D121D] ${
            isPlaying && activeSpeakerName === activeCohost.name
              ? 'border-cyan-500 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/50'
              : 'border-slate-800'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl border flex items-center justify-center text-2xl shadow-inner shrink-0"
                  style={{ backgroundColor: `${activeCohost.color}20`, borderColor: activeCohost.color }}
                >
                  {activeCohost.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white tracking-tight">{activeCohost.title}</h4>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded border"
                      style={{ backgroundColor: `${activeCohost.color}20`, borderColor: activeCohost.color, color: activeCohost.color }}
                    >
                      Host 2 • {activeCohost.archetype}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {activeCohost.role}
                  </p>
                </div>
              </div>

              {isPlaying && activeSpeakerName === activeCohost.name && (
                <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>ON AIR</span>
                </span>
              )}
            </div>

            {/* Co-Host Quick Switcher Pills */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
              <span className="text-slate-400">Switch Speaker 2:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {dynamicSpeakerPersonas.map(c => {
                  const isActive = selectedCohostId === c.id;
                  return (
                    <button
                      key={`h2-${c.id}`}
                      onClick={() => {
                        setSelectedCohostId(c.id);
                        setSelectedVoice2(c.voiceName);
                        localStorage.setItem('watercooler_cohost', c.id);
                        localStorage.setItem('watercooler_voice2', c.voiceName);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition flex items-center gap-1 cursor-pointer ${
                        isActive
                          ? 'bg-cyan-950 text-cyan-200 border border-cyan-500 font-bold shadow'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span>{c.avatar}</span>
                      <span>{c.name}</span>
                    </button>
                  );
                })}

                <button
                  onClick={handleApplyAndRegenerateScript}
                  disabled={isSynthesizing || isGeneratingShow}
                  className="ml-1 px-2.5 py-1 rounded bg-orange-600/90 hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition shadow"
                  title="Regenerate script and audio with newly selected co-host and cadence"
                >
                  <RefreshCw className={`w-3 h-3 ${isSynthesizing || isGeneratingShow ? 'animate-spin' : ''}`} />
                  <span>Apply</span>
                </button>
              </div>
            </div>
          </div>
      </div>

      {/* AUTOMATED POSTGAME SHOW PLAYER COMPONENT (Multi-Speaker Gemini TTS Powered) */}
      <div className="bg-[#151D2A] border border-[#1E293B] rounded-2xl p-6 space-y-6 shadow-xl">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-purple-500 animate-pulse"></div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>Talk Show Studio Broadcast</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>Dual-Speaker Gemini TTS</span>
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Speakers: <span className="text-orange-300 font-bold">{activeSpeaker1Persona.name} ({selectedVoice1})</span> + <span className="text-cyan-300 font-bold">{activeCohost.name} ({selectedVoice2})</span> • Style: <span className="text-slate-200">{activeStyle.label}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowVoiceStudio(!showVoiceStudio)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition border ${
                showVoiceStudio
                  ? 'bg-purple-950/80 border-purple-600 text-purple-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Multi-Voice Studio Controls</span>
            </button>

            {currentAudioUrl === 'SPEECH_SYNTHESIS_FALLBACK' || ttsQuotaExceeded || isHighDemand ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-amber-300 bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-800/80 flex items-center gap-1.5 shadow-sm">
                  <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span>
                    {isHighDemand
                      ? 'Browser Speech Engine (Gemini High Demand Spike)'
                      : ttsQuotaExceeded
                      ? 'Browser Speech Engine (Free 10/day quota reached)'
                      : 'Browser Speech Engine Active'}
                  </span>
                </span>
                <button
                  onClick={handleRetryGeminiTts}
                  disabled={isSynthesizing}
                  className="px-2.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                  title="Retry generating neural audio with Gemini 3.1 Flash TTS"
                >
                  <RefreshCw className={`w-3 h-3 ${isSynthesizing ? 'animate-spin' : ''}`} />
                  <span>Retry Gemini TTS</span>
                </button>
              </div>
            ) : (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 px-3 py-1.5 rounded-lg border border-emerald-900/60 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Gemini Neural TTS ({activeModelUsed})</span>
              </span>
            )}
          </div>
        </div>

        {/* Expandable Voice Studio Controls Drawer */}
        {showVoiceStudio && (
          <div className="bg-[#0B0F17] border border-purple-900/40 rounded-xl p-5 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Gemini Multi-Speaker Voice Allocation & Tone Steering
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Assigns independent persona & vocal configs to each debate partner
              </span>
            </div>

            {commissionerProfile && (
              <div className="bg-purple-950/40 border border-purple-800/50 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎙️</span>
                  <div>
                    <span className="text-purple-300 font-bold">Commissioner Audio Profile Synced: </span>
                    <span className="text-white font-semibold">{commissionerProfile.name}</span>
                    <span className="text-purple-400 text-[11px] block sm:inline sm:ml-2">
                      (Configured for {activeSpeaker1Persona.name} • {selectedVoice1})
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const prof = commissionerProfile;
                    const isTexas = prof.id === 'profile-texas-chalk' || prof.name?.toLowerCase().includes('texas');
                    const isMit = prof.id === 'profile-mit-sloan' || prof.name?.toLowerCase().includes('mit');
                    const isCommish = prof.id === 'profile-commish-ruling' || prof.name?.toLowerCase().includes('commish');
                    if (isTexas) {
                      setSelectedSpeaker1PersonaId('rex');
                      setSelectedVoice1(prof.speakerConfigs?.[0]?.voiceName || 'Charon');
                    } else if (isMit) {
                      setSelectedSpeaker1PersonaId('chloe');
                      setSelectedVoice1(prof.speakerConfigs?.[0]?.voiceName || 'Kore');
                    } else if (isCommish) {
                      setSelectedSpeaker1PersonaId('commish');
                      setSelectedVoice1(prof.speakerConfigs?.[0]?.voiceName || 'Puck');
                    }
                    handleSaveVoiceConfig();
                  }}
                  className="px-2.5 py-1 bg-purple-800/60 hover:bg-purple-700 text-purple-200 hover:text-white rounded border border-purple-600/50 text-[11px] font-mono transition self-end sm:self-auto cursor-pointer"
                >
                  Apply Preset to Voice Studio
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Speaker 1 Voice & Persona Selector */}
              <div className="space-y-3">
                {/* Speaker 1 Archetype Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-orange-300 font-mono flex items-center justify-between">
                    <span>SPEAKER 1 CHARACTER PERSONA (LEAD HOST)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Select Lead Persona</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {dynamicSpeakerPersonas.map(p => {
                      const isSelected = selectedSpeaker1PersonaId === p.id;
                      return (
                        <button
                          key={`drawer-spk1-${p.id}`}
                          onClick={() => {
                            setSelectedSpeaker1PersonaId(p.id);
                            setSelectedVoice1(p.voiceName);
                            localStorage.setItem('watercooler_speaker1_persona', p.id);
                            localStorage.setItem('watercooler_voice1', p.voiceName);
                          }}
                          className={`p-2 rounded-lg border transition text-center cursor-pointer ${
                            isSelected
                              ? 'bg-orange-950/80 border-orange-500 text-white font-bold ring-1 ring-orange-500/60 shadow'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="text-base">{p.avatar}</div>
                          <div className="text-[11px] font-bold mt-0.5">{p.name}</div>
                          <div className="text-[9px] text-slate-400 truncate font-mono">{p.archetype.split(' ')[0]}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="text-xs font-bold text-orange-300 font-mono flex items-center justify-between pt-1">
                  <span>SPEAKER 1 VOICE ({activeSpeaker1Persona.name.toUpperCase()})</span>
                  <span className="text-[10px] text-slate-400 font-normal">Gemini Voice Model</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {GEMINI_VOICES.map(v => (
                    <button
                      key={`spk1-${v.id}`}
                      onClick={() => {
                        setSelectedVoice1(v.id);
                        localStorage.setItem('watercooler_voice1', v.id);
                      }}
                      className={`text-left p-2.5 rounded-lg border transition flex items-center justify-between text-xs cursor-pointer ${
                        selectedVoice1 === v.id
                          ? 'bg-orange-950/50 border-orange-500 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold flex items-center gap-2">
                          <span>{v.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                            {v.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{v.desc}</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-900/50 text-orange-300 shrink-0 ml-2">
                        {v.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Speaker 2 Voice & Persona Selector (Co-Host) */}
              <div className="space-y-3">
                {/* Speaker 2 Archetype Selection inside Drawer */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-cyan-300 font-mono flex items-center justify-between">
                    <span>SPEAKER 2 CHARACTER PERSONA (CO-HOST)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Select Debate Partner</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {dynamicSpeakerPersonas.map(c => {
                      const isSelected = selectedCohostId === c.id;
                      return (
                        <button
                          key={`drawer-cohost-${c.id}`}
                          onClick={() => {
                            setSelectedCohostId(c.id);
                            setSelectedVoice2(c.voiceName);
                            localStorage.setItem('watercooler_cohost', c.id);
                            localStorage.setItem('watercooler_voice2', c.voiceName);
                          }}
                          className={`p-2 rounded-lg border transition text-center cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-950/80 border-cyan-400 text-white font-bold ring-1 ring-cyan-500/60 shadow'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="text-base">{c.avatar}</div>
                          <div className="text-[11px] font-bold mt-0.5">{c.name}</div>
                          <div className="text-[9px] text-slate-400 truncate font-mono">{c.archetype.split(' ')[0]}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="text-xs font-bold text-cyan-300 font-mono flex items-center justify-between pt-1">
                  <span>SPEAKER 2 VOICE ({activeCohost.name.toUpperCase()})</span>
                  <span className="text-[10px] text-slate-400 font-normal">Gemini Voice Model</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {GEMINI_VOICES.map(v => (
                    <button
                      key={`spk2-${v.id}`}
                      onClick={() => {
                        setSelectedVoice2(v.id);
                        localStorage.setItem('watercooler_voice2', v.id);
                      }}
                      className={`text-left p-2.5 rounded-lg border transition flex items-center justify-between text-xs cursor-pointer ${
                        selectedVoice2 === v.id
                          ? 'bg-cyan-950/50 border-cyan-500 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold flex items-center gap-2">
                          <span>{v.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                            {v.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{v.desc}</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-900/50 text-cyan-300 shrink-0 ml-2">
                        {v.badge}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Delivery Style / Vocal Direction Selector */}
                <div className="pt-2 space-y-2">
                  <label className="text-xs font-bold text-purple-300 font-mono flex items-center justify-between">
                    <span>DEBATE CADENCE PRESET</span>
                    <span className="text-[10px] text-purple-400 font-normal">Dual-Voice Steering</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {STYLE_PRESETS.map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSelectedStyleId(s.id);
                          localStorage.setItem('watercooler_style', s.id);
                        }}
                        className={`text-left p-2.5 rounded-lg border transition flex items-start gap-2.5 text-xs cursor-pointer ${
                          selectedStyleId === s.id
                            ? 'bg-purple-950/50 border-purple-500 text-white ring-1 ring-purple-500/50'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-base">{s.icon}</span>
                        <div className="space-y-0.5">
                          <div className="font-bold text-purple-300">{s.label}</div>
                          <p className="text-[11px] text-slate-400 italic font-mono leading-relaxed">
                            "{s.prompt}"
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Feedback Banner if saved */}
                  {saveFeedback && (
                    <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-600/70 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{saveFeedback}</span>
                    </div>
                  )}

                  {/* Action Controls & Confirmation */}
                  <div className="pt-3 space-y-2.5">
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Target Config:</span>
                      <span className="text-slate-200 font-bold truncate">
                        {activeSpeaker1Persona.name} ({selectedVoice1}) vs {activeCohost.name} ({selectedVoice2}) • {activeStyle.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={handleSaveVoiceConfig}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Save Voice & Cadence</span>
                      </button>

                      <button
                        onClick={() => {
                          handleSaveVoiceConfig();
                          playTrackWithSpeechSynthesis(activeTrack);
                        }}
                        className="py-2.5 px-3 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-700 text-white text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-purple-300" />
                        <span>Play With Selected Voices</span>
                      </button>
                    </div>

                    <button
                      onClick={handleApplyAndRegenerateScript}
                      disabled={isSynthesizing || isGeneratingShow}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 via-purple-600 to-cyan-600 hover:from-orange-500 hover:to-cyan-500 disabled:opacity-50 text-white text-xs font-bold font-mono transition flex items-center justify-center gap-2 shadow-lg shadow-purple-950/60 cursor-pointer active:scale-[0.99]"
                    >
                      <RefreshCw className={`w-4 h-4 ${isSynthesizing || isGeneratingShow ? 'animate-spin' : ''}`} />
                      <span>
                        {isSynthesizing || isGeneratingShow
                          ? 'Regenerating Script with Gemini & Synthesizing Audio...'
                          : `Apply & Regenerate Script (${activeSpeaker1Persona.name} & ${activeCohost.name} • ${activeStyle.label})`}
                      </span>
                    </button>
                    <p className="text-[10px] text-center text-slate-500 font-mono">
                      Rebuilds dialogue turns to reflect your chosen co-host personality and debate cadence
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Error Alert if Synthesis Failed */}
        {synthesisError && (
          <div className="bg-red-950/40 border border-red-800 rounded-xl p-3.5 flex items-center justify-between text-xs text-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{synthesisError}</span>
            </div>
            <button
              onClick={() => synthesizeTrackAudio(activeTrack, selectedVoice1, selectedVoice2, activeStyle.prompt)}
              className="px-2.5 py-1 bg-red-900/60 hover:bg-red-800 rounded text-[11px] font-mono font-bold transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Informational Status Banner for High Demand / Quota Limit / Speech Engine Bridge */}
        {(ttsQuotaExceeded || isHighDemand || currentAudioUrl === 'SPEECH_SYNTHESIS_FALLBACK') && (
          <div className="bg-amber-950/40 border border-amber-800/70 rounded-xl p-3.5 text-xs font-mono text-amber-200 flex items-start gap-3 shadow-inner">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 w-full">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold text-amber-300">
                  {isHighDemand
                    ? 'Gemini TTS Experiencing High Server Demand (Temporary Traffic Spike)'
                    : ttsQuotaExceeded
                    ? 'Gemini TTS Free-Tier Quota Reached (10 requests/day per project)'
                    : 'Browser Speech Synthesis Bridge Active'}
                </span>
                <button
                  onClick={handleRetryGeminiTts}
                  disabled={isSynthesizing}
                  className="px-2 py-0.5 rounded bg-orange-700 hover:bg-orange-600 disabled:opacity-50 text-white text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
                  <span>Retry Neural Audio</span>
                </button>
              </div>
              <p className="text-[11px] text-amber-200/85 leading-relaxed font-sans">
                {ttsNotice || (isHighDemand
                  ? "The preview Gemini 3.1 Flash TTS model is currently encountering a momentary spike in global server traffic. The audio recap is actively playing using your browser's native SpeechSynthesis engine with Chicago accents and multi-speaker pacing. Click 'Retry Neural Audio' once the spike clears."
                  : "The Gemini 3.1 Flash TTS daily free-tier quota (10 requests/day) has been reached. The audio recap is currently playing using your browser's native SpeechSynthesis engine with Chicago accents and multi-speaker pacing so you don't miss a beat. When your daily quota resets or a paid key is attached, click 'Retry Neural Audio'.")}
              </p>
            </div>
          </div>
        )}

        {/* Media Player Frame */}
        <div className="bg-black/90 rounded-2xl p-6 border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center min-h-[220px] space-y-5">
          
          {/* Animated Audio Equalizer Visualizer */}
          <div className="flex items-end gap-1.5 h-12 py-1">
            {[35, 75, 45, 95, 60, 85, 40, 70, 90, 50, 80, 65, 90, 45, 80, 55, 70, 40, 85, 60].map((h, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full transition-all duration-200 ${
                  isPlaying
                    ? 'bg-gradient-to-t from-orange-500 via-purple-400 to-cyan-400 animate-pulse'
                    : 'bg-slate-800'
                }`}
                style={{
                  height: isPlaying ? `${Math.max(15, (h * (i % 2 === 0 ? 1 : 0.85)))}%` : '20%',
                  animationDelay: `${i * 0.06}s`,
                }}
              ></div>
            ))}
          </div>

          {/* Primary Transport Controls */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => handleSkip(-5)}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Rewind 5s"
            >
              <Rewind className="w-4 h-4" />
            </button>

            {/* Big Play/Pause Button */}
            <button
              onClick={handlePlayPause}
              disabled={isSynthesizing}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-500 hover:to-purple-500 disabled:opacity-50 text-white flex items-center justify-center shadow-xl shadow-purple-900/50 hover:scale-105 active:scale-95 transition cursor-pointer"
              title={isPlaying ? 'Pause Audio' : 'Play Broadcast with Gemini Multi-Speaker TTS'}
            >
              {isSynthesizing ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-7 h-7 fill-white" />
              ) : (
                <Play className="w-7 h-7 fill-white translate-x-0.5" />
              )}
            </button>

            <button
              onClick={() => handleSkip(5)}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Forward 5s"
            >
              <FastForward className="w-4 h-4" />
            </button>
          </div>

          {/* Track Information */}
          <div className="text-center space-y-1 max-w-xl">
            <h4 className="text-sm font-bold text-white tracking-tight">
              "{activeTrack.title}"
            </h4>
            <p className="text-xs text-slate-400 font-mono">
              {activeTrack.subtitle} • {activeTrack.isMultiSpeaker ? `Hosts: ${activeTrack.speaker1?.name || activeSpeaker1Persona.name} (${selectedVoice1}) & ${activeTrack.speaker2?.name || activeCohost.name} (${selectedVoice2})` : `Voice: ${selectedVoice1}`} • Gemini 3.8 Flash TTS
            </p>
          </div>

          {/* Scrub Timeline & Duration */}
          <div className="w-full max-w-lg space-y-1.5">
            <input
              type="range"
              min="0"
              max={duration || 88}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-orange-500 border border-slate-800"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span className="text-slate-500 font-bold flex items-center gap-1.5">
                {isSynthesizing ? (
                  'Synthesizing Multi-Speaker Audio...'
                ) : isPlaying ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                    <span>Streaming Multi-Speaker Talk Show {activeSpeakerName ? `[${activeSpeakerName} speaking]` : ''}</span>
                  </>
                ) : (
                  'Ready to Play'
                )}
              </span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Bottom Audio Toolbar (Speed, Mute, Volume, Download) */}
          <div className="flex flex-wrap items-center justify-between w-full max-w-lg pt-2 border-t border-slate-900 text-xs font-mono text-slate-400">
            {/* Playback Speed */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-500">Speed:</span>
              {[1.0, 1.25, 1.5].map(rate => (
                <button
                  key={rate}
                  onClick={() => setPlaybackSpeed(rate)}
                  className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${
                    playbackSpeed === rate
                      ? 'bg-orange-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Volume / Mute */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={e => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-16 h-1 bg-slate-800 rounded appearance-none accent-orange-500"
              />
            </div>

            {/* Download .wav */}
            {currentAudioUrl && (
              <a
                href={currentAudioUrl}
                download={`${activeTrack.id}-${selectedVoice1}-${selectedVoice2}-talkshow.wav`}
                className="flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 transition"
              >
                <Download className="w-3 h-3" />
                <span>Save .wav</span>
              </a>
            )}
          </div>

        </div>

        {/* Talk Show Scene Setting & Director's Cut Showcase */}
        <div className="bg-[#0B0F17] border border-amber-900/40 rounded-xl overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-amber-950/60 via-orange-950/40 to-slate-900 px-4 py-3 border-b border-amber-900/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🎙️</span>
              <div>
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono flex items-center gap-2">
                  <span>Talk Show Scene Setting & Multi-Speaker Director's Cut</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-orange-900/80 text-orange-200 border border-orange-700">
                    Halsted St. Studio vs. Analytics Soundbooth
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Vocal Clash: Coach Sal's grease-counter Ditka grit vs. {activeTrack.speaker2?.title || activeCohost.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSceneDetails(!showSceneDetails)}
                className="text-xs text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 cursor-pointer"
              >
                {showSceneDetails ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showSceneDetails ? 'Hide Scene Details' : 'View Scene Details'}</span>
              </button>
              <button
                onClick={() => setShowPromptInspector(!showPromptInspector)}
                className={`text-xs font-mono flex items-center gap-1 px-2.5 py-1 rounded border transition cursor-pointer ${
                  showPromptInspector
                    ? 'bg-purple-900/80 border-purple-500 text-purple-200'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <FileText className="w-3 h-3 text-purple-400" />
                <span>Multi-Speaker TTS Inspector</span>
              </button>
            </div>
          </div>

          {/* Scene details collapsible */}
          {showSceneDetails && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs border-b border-slate-900">
              {/* Host 1 Profile */}
              <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-1.5 text-orange-400 font-bold font-mono">
                  <User className="w-3.5 h-3.5" />
                  <span>Host 1: {activeTrack.speaker1?.title || activeSpeaker1Persona.title}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {activeTrack.speaker1?.personalityPrompt || activeSpeaker1Persona.description}
                </p>
              </div>

              {/* Host 2 Profile */}
              <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold font-mono">
                  <User className="w-3.5 h-3.5" />
                  <span>Host 2: {activeTrack.speaker2?.title || activeCohost.title}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {activeTrack.speaker2?.personalityPrompt || activeCohost.description}
                </p>
              </div>

              {/* Director's Vocal Notes & Backstory */}
              <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-1.5 text-purple-400 font-bold font-mono">
                  <Film className="w-3.5 h-3.5" />
                  <span>Director's Multi-Voice Notes</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {activeTrack.directorsNotes ||
                    'Fast-paced talk show banter with comedic tension and distinct vocal personalities. Emphasize physical reactions like table slaps, dry analytical quips, and hot takes.'}
                </p>
              </div>
            </div>
          )}

          {/* Gemini Raw Multi-Speaker Prompt & JSON Config Inspector Drawer */}
          {showPromptInspector && (
            <div className="p-4 bg-slate-950 border-b border-purple-900/40 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-purple-300 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>gemini-3.8-flash-tts Multi-Speaker Configuration</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  MultiSpeakerVoiceConfig Payload
                </span>
              </div>

              {/* Exact multiSpeakerVoiceConfig structure sent to Gemini TTS API */}
              <div className="bg-black/90 p-3 rounded-lg border border-purple-900/50 space-y-2">
                <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">API speechConfig Payload:</span>
                <pre className="text-[11px] text-purple-200 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
{JSON.stringify({
  model: 'gemini-3.8-flash-tts',
  speechConfig: {
    multiSpeakerVoiceConfig: {
      speakerVoiceConfigs: [
        {
          speaker: activeTrack.speaker1?.name || activeSpeaker1Persona.name,
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: selectedVoice1,
            }
          }
        },
        {
          speaker: activeTrack.speaker2?.name || activeCohost.name,
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: selectedVoice2,
            }
          }
        }
      ]
    }
  }
}, null, 2)}
                </pre>
              </div>

              {/* Full script text passed into model.generateContent */}
              <div className="bg-black/90 p-3 rounded-lg border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">Model Input Prompt:</span>
                <pre className="text-[11px] text-amber-200 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-40">
                  {activeTrack.fullPromptPayload || activeTrack.scriptText}
                </pre>
              </div>
            </div>
          )}

          {/* Live Spoken Talk Show Dialogue Teleprompter */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-800 pb-2">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Mic className="w-3 h-3 text-amber-400" />
                <span>Talk Show Teleprompter & Live Dialogue Turns</span>
              </span>
              <span className="text-amber-400">
                Acoustic Style: {activeTrack.soundStyle}
              </span>
            </div>

            {/* If track has dialogue turns, render turn-by-turn cards */}
            {activeTrack.dialogueTurns && activeTrack.dialogueTurns.length > 0 ? (
              <div className="space-y-3">
                {activeTrack.dialogueTurns.map((turn, idx) => {
                  const spk1Name = activeTrack.speaker1?.name || activeSpeaker1Persona.name;
                  const isSpeaker1 = turn.speaker === spk1Name || turn.speaker === 'Sal' || turn.speaker === 'Coach Sal';
                  const isCurrentTurn = isPlaying && activeTurnIndex === idx;

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-all duration-200 ${
                        isCurrentTurn
                          ? isSpeaker1
                            ? 'bg-orange-950/40 border-orange-500 shadow-md shadow-orange-950/50 ring-1 ring-orange-500/40'
                            : 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-500/40'
                          : isSpeaker1
                          ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                          : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{isSpeaker1 ? activeSpeaker1Persona.avatar : activeCohost.avatar}</span>
                          <span className={`font-bold font-mono text-xs ${isSpeaker1 ? 'text-orange-400' : 'text-cyan-400'}`}>
                            {turn.speaker}
                          </span>
                          {turn.stageDirection && (
                            <span className="text-[10px] font-mono text-slate-500 italic bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              {turn.stageDirection}
                            </span>
                          )}
                        </div>

                        {isCurrentTurn && (
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                            isSpeaker1 ? 'bg-orange-500/20 text-orange-300' : 'bg-cyan-500/20 text-cyan-300'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
                            <span>Speaking Turn</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed font-serif italic pl-6 selection:bg-purple-900">
                        "{turn.text}"
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Fallback single-speaker script text */
              <p className="text-xs text-slate-200 leading-relaxed font-serif italic selection:bg-amber-900 p-2">
                "{activeTrack.scriptText}"
              </p>
            )}
          </div>
        </div>

        {/* Audio Playlist Grid (Section 7.0 Specification) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {playlist.map(track => {
            const isSelected = track.id === activeTrack.id;
            const key = track.isMultiSpeaker
              ? `${track.id}-${selectedVoice1}-${selectedVoice2}-${selectedStyleId}`
              : `${track.id}-${selectedVoice1}-${selectedStyleId}`;
            const hasCachedAudio = Boolean(audioUrlMap[key] || track.audioUrl);

            return (
              <div
                key={track.id}
                onClick={() => switchTrack(track)}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-purple-950/30 border-purple-600/80 shadow-md shadow-purple-950/40'
                    : 'bg-[#0B0F17] border-[#1E293B] hover:border-slate-700'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="font-bold text-xs truncate flex items-center gap-1.5" style={{ color: track.accentColor }}>
                    <span>{track.icon}</span>
                    <span className="truncate">{track.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">
                    {track.subtitle}
                  </div>
                  <div className="flex items-center gap-2">
                    {track.isMultiSpeaker && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-950/80 text-orange-300 border border-orange-800/80 font-mono">
                        🎙️ Talk Show (2 Hosts)
                      </span>
                    )}
                    {hasCachedAudio && (
                      <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>Gemini TTS Ready</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSelected) {
                      handlePlayPause();
                    } else {
                      switchTrack(track);
                      setTimeout(() => handlePlayPause(), 50);
                    }
                  }}
                  className={`px-3 py-1.5 rounded text-[11px] font-mono shrink-0 transition cursor-pointer flex items-center gap-1 ${
                    isSelected && isPlaying
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {isSelected && isPlaying ? (
                    <>
                      <Pause className="w-3 h-3 fill-current" />
                      <span>Playing</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>Play</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  )}

  {/* 3. LIVE CHAT & TRASH-TALK THREAD (Section 7.0 Page 3) */}
  {(watercoolerTab === 'chat' || watercoolerTab === 'all') && (
    <div id="trash-talk-chat" className="bg-[#151D2A] border border-[#1E293B] rounded-2xl p-6 space-y-5 shadow-xl animate-in fade-in duration-300">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#1E293B] pb-4">
          <div>
            <h3 className="font-bold text-white text-base">
              The League Trash-Talk Thread
            </h3>
            <p className="text-xs text-slate-400">
              Live banter synchronized across league members with automated Commish AI statistical interjections.
            </p>
          </div>

          <button
            onClick={generateCommishRoast}
            disabled={isGeneratingRoast}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-purple-800/60 text-purple-300 text-xs font-semibold self-start sm:self-auto transition cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>{isGeneratingRoast ? 'Generating Roast...' : 'Request Commish Roast'}</span>
          </button>
        </div>

        {/* Comment Stream */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {comments.map(c => {
            const isBot = Boolean(c.isBot);

            return (
              <div key={c.id} className="flex gap-3.5 items-start">
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-black shrink-0 shadow"
                  style={{ backgroundColor: c.authorColor }}
                >
                  {c.authorAvatar}
                </div>

                {/* Bubble */}
                <div
                  className={`rounded-2xl p-4 flex-1 text-xs space-y-2 border ${
                    isBot
                      ? 'bg-purple-950/20 border-purple-800/80 text-purple-200 shadow-md shadow-purple-950/20'
                      : 'bg-[#0B0F17] border-[#1E293B] text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isBot ? 'text-purple-300' : 'text-white'}`}>
                        {c.authorName}
                      </span>
                      {c.badge && (
                        <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono text-[10px] font-bold border border-purple-700">
                          {c.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{c.timestamp}</span>
                  </div>

                  <p className="leading-relaxed text-slate-300">{c.content}</p>

                  {/* Reaction Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {['🤡', '💀', '🔥', '🏆', '😭', '🍿'].map(emoji => {
                      const count = c.reactions[emoji] || 0;
                      return (
                        <button
                          key={emoji}
                          onClick={() => addReaction(c.id, emoji)}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-mono transition flex items-center gap-1 ${
                            count > 0
                              ? 'bg-slate-800/90 border border-slate-700 text-slate-200'
                              : 'bg-slate-900/60 hover:bg-slate-800 border border-transparent text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <span>{emoji}</span>
                          {count > 0 && <span className="font-bold">{count}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* New Comment Composer */}
        <form onSubmit={handlePostComment} className="pt-3 border-t border-[#1E293B] space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>Posting as:</span>
            <span className="font-bold text-white flex items-center gap-1">
              <span
                className="w-3.5 h-3.5 rounded-full inline-block"
                style={{ backgroundColor: currentTeam.color }}
              ></span>
              {currentTeam.ownerName} ({currentTeam.teamName})
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
              placeholder="Drop a roast, react to Dave's choke, or celebrate the win..."
              className="bg-[#0B0F17] border border-[#1E293B] rounded-xl px-4 py-2.5 text-xs text-slate-200 flex-1 focus:outline-none focus:border-emerald-500 transition font-sans"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-black font-bold text-xs transition flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>

          {/* Quick Banter Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500 self-center mr-1">Quick prompts:</span>
            {[
              "Dave's Buffalo pick was an all-time disaster 😭",
              'Math wins again! KC at 14 points was pure EV 💰',
              'Seattle by 3 on Monday night. Book it! 🏈',
            ].map((text, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setNewCommentText(text)}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                {text}
              </button>
            ))}
          </div>
        </form>

      </div>
    )}

    </div>
  );
};
