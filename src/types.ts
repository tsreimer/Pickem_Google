export interface Team {
  id: string;
  yahooTeamId: string;
  teamName: string;
  ownerName: string;
  avatar: string;
  color: string;
  tagline: string;
  rank: number;
  rankDelta: number; // +1, -1, 0
  lockedPoints: number;
  activeSweatPoints: number;
  activePickTeam?: string;
  maxPossible: number;
  statusText: string;
  destinyStatus: 'controls_destiny' | 'must_win_pivot' | 'alive' | 'eliminated';
  closingLineEV: number;
  actualPoints: number;
  netEV: number;
  luckQuadrant: 1 | 2 | 3 | 4;
}

export interface Game {
  id: string;
  seasonYear: number;
  weekNumber: number;
  homeTeam: string;
  homeTeamCode: string;
  homeTeamRecord: string;
  awayTeam: string;
  awayTeamCode: string;
  awayTeamRecord: string;
  kickoffTime: string;
  status: 'scheduled' | 'in_progress' | 'final';
  homeScore: number;
  awayScore: number;
  quarter?: string;
  clock?: string;
  possession?: 'home' | 'away';
  situation?: string; // e.g., "4th & Goal at BUF 2"
  consensusSpread: number; // e.g. -4.5
  homeWinProbability: number; // e.g. 0.58
  isSweatGame: boolean;
  spreadString: string;
  network?: string;
}

export interface PickAllocation {
  gameId: string;
  matchup: string;
  selectedTeam: string;
  selectedTeamCode: string;
  confidencePoints: number;
  vegasWinProbability: number;
  publicPickRate: number;
  strategicRating: 'EXTREME VALUE' | 'DEAD CHALK TRAP' | 'LEVERAGE PIVOT' | 'CHALK LOCK';
  recommendation: string;
  laneTarget: 'weekly' | 'season' | 'balanced';
}

export interface CommentMessage {
  id: string;
  teamId?: string;
  authorName: string;
  authorAvatar: string;
  authorColor: string;
  content: string;
  timestamp: string;
  isBot?: boolean;
  badge?: string;
  reactions: Record<string, number>;
}

export interface TalkShowSpeaker {
  id: string;
  name: string;
  title?: string;
  role: string;
  avatar: string;
  voiceName: string;
  color: string;
  tagline: string;
  archetype: string;
  personalityPrompt?: string;
  description?: string;
}

export interface DialogueTurn {
  speaker: string;
  text: string;
  stageDirection?: string;
}

export interface AudioBroadcastTrack {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  durationSeconds: number;
  category: 'anthem' | 'ballad' | 'radio';
  accentColor: string;
  icon: string;
  scriptText: string;
  soundStyle: string;
  audioUrl?: string;
  voiceName?: string;
  modelUsed?: string;
  characterPersona?: string;
  sceneBackstory?: string;
  directorsNotes?: string;
  fullPromptPayload?: string;
  isMultiSpeaker?: boolean;
  speaker1?: TalkShowSpeaker;
  speaker2?: TalkShowSpeaker;
  dialogueTurns?: DialogueTurn[];
}

export interface TrophyBadge {
  id: string;
  icon: string;
  title: string;
  description: string;
  holder: string;
  week: string;
  type: 'glory' | 'shame' | 'chaos';
  borderClass: string;
}

export interface ClinchBranch {
  name: string;
  winnerTeam: string;
  winnerTeamCode: string;
  vegasProb: number;
  leaderScore: number;
  chaserScore: number;
  verdict: string;
  winnerName: string;
  isUpsideSteal: boolean;
}

export interface PushNotificationItem {
  id: string;
  type: 'integrity' | 'sweat' | 'media';
  title: string;
  subtitle: string;
  body: string;
  timeAgo: string;
  read: boolean;
}

export interface YahooGroupGame {
  id: number;
  favored: string;
  spread: number;
  underdog: string;
  winner?: string;
  isLocked: boolean;
  status: 'final' | 'in_progress' | 'scheduled';
}

export interface YahooPickCell {
  team: string;
  confidence?: number;
  status: 'won' | 'lost' | 'pending' | 'hidden';
}

export interface YahooGroupTeamRow {
  teamId: string;
  teamName: string;
  ownerName: string;
  points: number;
  isCurrentUser: boolean;
  picks: Record<number, YahooPickCell>;
}

export interface BroadcastDialogueLine {
  speaker: string;
  text: string;
  stageDirection?: string;
}

export interface StrategyAssessment {
  grade: string;
  summary: string;
  capitalEfficiency: number;
  anchorDiscipline: string;
  gameTheoryRiskProfile: string;
}

export interface BroadcastCommentaryData {
  teamId: string;
  teamName: string;
  ownerName: string;
  weekNumber: number;
  persona: 'dual' | 'sal' | 'chloe' | 'commish';
  focusMode: 'full_debrief' | 'strategy_audit' | 'anchor_leverage';
  headline: string;
  broadcastScript: BroadcastDialogueLine[];
  strategyAssessment: StrategyAssessment;
  tacticalPrescriptions: string[];
  keyHighlights: string[];
  salQuote?: string;
  chloeQuote?: string;
  statsSummary: {
    record: string;
    accuracy: number;
    pointsEarned: number;
    pointsPossible: number;
    confidenceEfficiency: number;
    leagueAvgAccuracy: number;
    anchorRecord: string;
    weeklyRank: number;
  };
  generatedWith: string;
  timestamp: string;
}

export type LockWindowId = 'thu_evening' | 'sun_morning' | 'sun_afternoon' | 'sun_evening' | 'mon_evening';

export interface YahooLockWindow {
  id: LockWindowId;
  name: string;
  kickoffLabel: string;
  day: 'Thursday' | 'Sunday' | 'Monday';
  period: 'Morning' | 'Afternoon' | 'Evening';
  typicalKickoff: string;
  status: 'pending' | 'locked' | 'synced';
  gamesCount: number;
  gamesList: string[];
  lockedAt?: string;
  syncedAt?: string;
  lastSyncResult?: string;
  autoSyncTriggered?: boolean;
}

export interface SyncAuditLogEntry {
  id: string;
  timestamp: string;
  windowId: string;
  windowName: string;
  status: 'success' | 'error' | 'in_progress';
  message: string;
  gamesLockedCount: number;
  revealedPicksCount: number;
  triggerSource: 'auto_daemon' | 'manual_request' | 'kickoff_hook';
}

export interface TtsSpeakerConfig {
  speaker: string;
  voiceName: string;
  roleContext: string;
}

export interface TtsDirectorsNotes {
  style: string;
  pace: string;
  accent: string;
}

export interface TtsAudioProfile {
  id: string;
  name: string; // # AUDIO PROFILE: [Name]
  title: string; // ## "[Title]"
  sceneTitle: string; // ## THE SCENE: [Scene Title]
  sceneDescription: string; // [Vivid description of the scene]
  directorsNotes: TtsDirectorsNotes; // ### DIRECTOR'S NOTES: Style, Pace, Accent
  sampleContext: string; // ### SAMPLE CONTEXT: [Role/Persona description]
  transcript: string; // #### TRANSCRIPT: [Script]
  isMultiSpeaker: boolean;
  speakerConfigs: TtsSpeakerConfig[];
  updatedAt?: string;
  isPreset?: boolean;
}

export function formatTtsPromptPayload(profile: TtsAudioProfile): string {
  const parts: string[] = [];
  parts.push(`# AUDIO PROFILE: ${profile.name}`);
  parts.push(`## "${profile.title}"\n`);
  parts.push(`## THE SCENE: ${profile.sceneTitle}`);
  parts.push(`${profile.sceneDescription}\n`);
  parts.push(`### DIRECTOR'S NOTES`);
  parts.push(`Style: ${profile.directorsNotes.style}`);
  parts.push(`Pace: ${profile.directorsNotes.pace}`);
  parts.push(`Accent: ${profile.directorsNotes.accent}\n`);
  parts.push(`### SAMPLE CONTEXT`);
  parts.push(`${profile.sampleContext}\n`);
  parts.push(`#### TRANSCRIPT`);
  parts.push(`${profile.transcript}`);
  return parts.join("\n");
}

