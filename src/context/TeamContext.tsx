import React, { createContext, useContext, useState, useEffect } from 'react';
import { Team, Game, CommentMessage, PushNotificationItem, YahooLockWindow, SyncAuditLogEntry, YahooGroupTeamRow } from '../types';
import { INITIAL_TEAMS, WEEK_1_TEAMS, WEEK_2_TEAMS, INITIAL_GAMES, INITIAL_COMMENTS, INITIAL_NOTIFICATIONS, YAHOO_WEEK_1_PICKS_MATRIX, YAHOO_WEEK_2_PICKS_MATRIX, YAHOO_GROUP_PICKS_MATRIX } from '../data/mockData';
import { audioPreGenerationService } from '../services/audioPreGenerationService';

interface TeamContextType {
  currentWeek: number;
  setCurrentWeek: (week: number) => void;
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  updateTeamRoster: (newTeams: Team[]) => void;
  currentTeam: Team;
  setCurrentTeamId: (id: string) => void;
  games: Game[];
  setGames: React.Dispatch<React.SetStateAction<Game[]>>;
  activeSweatGame: Game;
  comments: CommentMessage[];
  addComment: (content: string) => void;
  addReaction: (commentId: string, emoji: string) => void;
  notifications: PushNotificationItem[];
  markNotificationAsRead: (id: string) => void;
  isIdentityModalOpen: boolean;
  setIsIdentityModalOpen: (open: boolean) => void;
  isSpecModalOpen: boolean;
  setIsSpecModalOpen: (open: boolean) => void;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  isYahooSyncModalOpen: boolean;
  setIsYahooSyncModalOpen: (open: boolean) => void;
  isCommentarySidebarOpen: boolean;
  setIsCommentarySidebarOpen: (open: boolean) => void;
  toggleCommentarySidebar: () => void;
  yahooLeagueId: string;
  yahooLeagueUrl: string;
  fetchLiveEspnGames: () => Promise<boolean>;
  isSyncingLive: boolean;
  lastSyncTime: string;
  // Yahoo Lock Windows & Auto-Sync
  yahooLockWindows: YahooLockWindow[];
  autoSyncEnabled: boolean;
  syncAuditLogs: SyncAuditLogEntry[];
  fetchYahooLockWindows: () => Promise<void>;
  syncYahooLockWindow: (windowId?: string) => Promise<boolean>;
  toggleAutoSync: (enabled?: boolean) => Promise<boolean>;
  isSyncingLockWindow: boolean;
  // Simulation Controls
  simulateScenario: (scenario: 'kc_wins' | 'buf_scores_td' | 'reset') => void;
  simulationState: 'kc_leads' | 'buf_ahead' | 'final_kc' | 'final_buf';
  // Pool Pick Matrix (Yahoo Sync & CSV Vault)
  groupPicksMatrix: YahooGroupTeamRow[];
  updateGroupPicksMatrix: (matrix: YahooGroupTeamRow[]) => void;
  resetGroupPicksMatrix: () => void;
  activeTab: 'home' | 'war-room' | 'strategist' | 'watercooler' | 'vault' | 'commissioner';
  setActiveTab: (tab: 'home' | 'war-room' | 'strategist' | 'watercooler' | 'vault' | 'commissioner') => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWeek, setCurrentWeekState] = useState<number>(2);
  const [teams, setTeams] = useState<Team[]>(WEEK_2_TEAMS);
  const [games, setGames] = useState<Game[]>(INITIAL_GAMES);
  const [comments, setComments] = useState<CommentMessage[]>(INITIAL_COMMENTS);
  const [notifications, setNotifications] = useState<PushNotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [groupPicksMatrix, setGroupPicksMatrix] = useState<YahooGroupTeamRow[]>(YAHOO_WEEK_2_PICKS_MATRIX);

  const setCurrentWeek = (week: number) => {
    setCurrentWeekState(week);
    if (week === 2) {
      setTeams(WEEK_2_TEAMS);
      setGroupPicksMatrix(YAHOO_WEEK_2_PICKS_MATRIX);
    } else if (week === 1) {
      setTeams(WEEK_1_TEAMS);
      setGroupPicksMatrix(YAHOO_WEEK_1_PICKS_MATRIX);
    }
    fetch(`/api/yahoo/matrix?week=${week}`)
      .then(res => res.json())
      .then(mData => {
        if (mData.success) {
          if (Array.isArray(mData.matrix)) setGroupPicksMatrix(mData.matrix);
          if (Array.isArray(mData.teams)) setTeams(mData.teams);
        }
      })
      .catch(() => {});
    fetch('/api/league/week', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekNumber: week }),
    }).catch(err => console.warn('Failed to post week change:', err));
  };

  // Sync active week from backend on mount
  useEffect(() => {
    fetch('/api/league/week')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.currentWeek) {
          setCurrentWeekState(data.currentWeek);
          fetch(`/api/yahoo/matrix?week=${data.currentWeek}`)
            .then(mRes => mRes.json())
            .then(mData => {
              if (mData.success) {
                if (Array.isArray(mData.matrix)) setGroupPicksMatrix(mData.matrix);
                if (Array.isArray(mData.teams)) setTeams(mData.teams);
              } else {
                if (data.currentWeek === 2) {
                  setTeams(WEEK_2_TEAMS);
                  setGroupPicksMatrix(YAHOO_WEEK_2_PICKS_MATRIX);
                } else {
                  setTeams(WEEK_1_TEAMS);
                  setGroupPicksMatrix(YAHOO_WEEK_1_PICKS_MATRIX);
                }
              }
            })
            .catch(() => {
              if (data.currentWeek === 2) {
                setTeams(WEEK_2_TEAMS);
                setGroupPicksMatrix(YAHOO_WEEK_2_PICKS_MATRIX);
              } else {
                setTeams(WEEK_1_TEAMS);
                setGroupPicksMatrix(YAHOO_WEEK_1_PICKS_MATRIX);
              }
            });
        }
      })
      .catch(e => console.warn('League week sync fallback:', e));
  }, []);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isYahooSyncModalOpen, setIsYahooSyncModalOpen] = useState(false);
  const [isCommentarySidebarOpen, setIsCommentarySidebarOpen] = useState(false);
  const toggleCommentarySidebar = () => setIsCommentarySidebarOpen(prev => !prev);
  const [isSyncingLive, setIsSyncingLive] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Live (Auto-polling)');
  const yahooLeagueId = 'initech-invitational';
  const yahooLeagueUrl = 'https://football.fantasysports.yahoo.com/pickem';

  // Fetch real-time live games from ESPN API
  const fetchLiveEspnGames = async (): Promise<boolean> => {
    setIsSyncingLive(true);
    try {
      const res = await fetch('/api/nfl/live');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.games) && data.games.length > 0) {
        setGames(data.games);
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

        // Refresh matrix and scores
        fetch(`/api/yahoo/matrix?week=${currentWeek}`)
          .then(mRes => mRes.json())
          .then(mData => {
            if (mData.success) {
              if (Array.isArray(mData.matrix)) setGroupPicksMatrix(mData.matrix);
              if (Array.isArray(mData.teams)) setTeams(mData.teams);
            }
          })
          .catch(() => {});

        return true;
      }
      return false;
    } catch (err) {
      console.warn('Live ESPN sync fallback:', err);
      return false;
    } finally {
      setIsSyncingLive(false);
    }
  };

  // Yahoo Lock Windows & Automated Sync Pipeline
  const [yahooLockWindows, setYahooLockWindows] = useState<YahooLockWindow[]>([
    {
      id: 'thu_evening',
      name: 'Thursday Evening Lock',
      kickoffLabel: 'Thu 8:15 PM',
      day: 'Thursday',
      period: 'Evening',
      typicalKickoff: 'Thursday 8:15 PM EDT (TNF)',
      status: 'synced',
      gamesCount: 1,
      gamesList: ['DAL @ NYG (Final: DAL 20 - NYG 15)'],
      lockedAt: '2026-09-17T20:15:00-04:00',
      syncedAt: '2026-09-17T20:15:09-04:00',
      lastSyncResult: 'All 12 Initech Invitational manager picks locked & ingested for TNF',
      autoSyncTriggered: true,
    },
    {
      id: 'sun_morning',
      name: 'Sunday Morning Lock',
      kickoffLabel: 'Sun 1:00 PM',
      day: 'Sunday',
      period: 'Morning',
      typicalKickoff: 'Sunday 1:00 PM EDT (Early Slate)',
      status: 'synced',
      gamesCount: 8,
      gamesList: ['GB @ DET (Final: DET 31 - GB 29)', 'CIN @ BAL (Final: BAL 41 - CIN 38)', 'TEN @ NYJ', 'IND @ CHI', 'CLE @ JAX', 'CAR @ TB', 'MIA @ BUF', 'NO @ ATL'],
      lockedAt: '2026-09-20T13:00:00-04:00',
      syncedAt: '2026-09-20T13:00:14-04:00',
      lastSyncResult: 'Early slate locked. 8 matchups revealed across 12 manager cards in matrix.',
      autoSyncTriggered: true,
    },
    {
      id: 'sun_afternoon',
      name: 'Sunday Afternoon Lock',
      kickoffLabel: 'Sun 4:05 PM / 4:25 PM',
      day: 'Sunday',
      period: 'Afternoon',
      typicalKickoff: 'Sunday 4:25 PM EDT (Late Slate)',
      status: 'synced',
      gamesCount: 4,
      gamesList: ['BUF @ KC (Q4 01:18 • Sweat Game)', 'DEN @ LAC (Final: LAC 23 - DEN 16)', 'LAR @ ARI (Final: LAR 27 - ARI 24)', 'WAS @ PHI (Scheduled)'],
      lockedAt: '2026-09-20T16:25:00-04:00',
      syncedAt: '2026-09-20T16:25:08-04:00',
      lastSyncResult: 'Late afternoon slate locked & synced. Active sweat game BUF @ KC streaming live.',
      autoSyncTriggered: true,
    },
    {
      id: 'sun_evening',
      name: 'Sunday Evening Lock',
      kickoffLabel: 'Sun 8:20 PM',
      day: 'Sunday',
      period: 'Evening',
      typicalKickoff: 'Sunday 8:20 PM EDT (SNF)',
      status: 'pending',
      gamesCount: 1,
      gamesList: ['LV @ MIA (Sun 8:20 PM)'],
      lastSyncResult: 'Pending kickoff lock at 8:20 PM EDT. Automated sync will trigger immediately upon lock.',
      autoSyncTriggered: false,
    },
    {
      id: 'mon_evening',
      name: 'Monday Evening Lock',
      kickoffLabel: 'Mon 8:15 PM',
      day: 'Monday',
      period: 'Evening',
      typicalKickoff: 'Monday 8:15 PM EDT (MNF)',
      status: 'pending',
      gamesCount: 2,
      gamesList: ['SF @ SEA (Mon 8:15 PM)', 'BAL @ LAC (Mon 8:15 PM)'],
      lastSyncResult: 'Pending Monday Night Football lock. Automated sync scheduled after kickoff lock.',
      autoSyncTriggered: false,
    },
  ]);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [syncAuditLogs, setSyncAuditLogs] = useState<SyncAuditLogEntry[]>([]);
  const [isSyncingLockWindow, setIsSyncingLockWindow] = useState(false);

  const fetchYahooLockWindows = async () => {
    try {
      const res = await fetch('/api/yahoo/lock-windows');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.windows)) {
          setYahooLockWindows(data.windows);
          setAutoSyncEnabled(Boolean(data.autoSyncEnabled));
          if (Array.isArray(data.recentAuditLogs)) {
            setSyncAuditLogs(data.recentAuditLogs);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch Yahoo lock windows:', e);
    }
  };

  const syncYahooLockWindow = async (windowId?: string): Promise<boolean> => {
    setIsSyncingLockWindow(true);
    try {
      const res = await fetch('/api/yahoo/sync-lock-window', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ windowId, triggerAll: !windowId }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.allWindows)) {
        setYahooLockWindows(data.allWindows);
        if (Array.isArray(data.matrix) && data.matrix.length > 0) {
          setGroupPicksMatrix(data.matrix);
        }
        if (Array.isArray(data.teams) && data.teams.length > 0) {
          setTeams(data.teams);
        }
        await fetchYahooLockWindows();
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Failed to sync Yahoo lock window:', e);
      return false;
    } finally {
      setIsSyncingLockWindow(false);
    }
  };

  const toggleAutoSync = async (enabled?: boolean): Promise<boolean> => {
    try {
      const res = await fetch('/api/yahoo/auto-sync-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      if (data.success) {
        setAutoSyncEnabled(Boolean(data.autoSyncEnabled));
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Failed to toggle auto sync:', e);
      return false;
    }
  };

  // Poll lock windows on mount and every 60s
  useEffect(() => {
    fetchYahooLockWindows();
    const timer = setInterval(() => {
      fetchYahooLockWindows();
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const [simulationState, setSimulationState] = useState<'kc_leads' | 'buf_ahead' | 'final_kc' | 'final_buf'>('kc_leads');
  const [activeTab, setActiveTab] = useState<'home' | 'war-room' | 'strategist' | 'watercooler' | 'vault' | 'commissioner'>('home');

  // Load identity from localStorage
  const [currentTeamId, setCurrentTeamIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('pickem_team_id');
      if (saved && INITIAL_TEAMS.some(t => t.id === saved)) {
        return saved;
      }
    } catch (e) {
      console.warn('localStorage not accessible', e);
    }
    return 'team-todd'; // Default to Todd (Reimer Original)
  });

  const setCurrentTeamId = (id: string) => {
    setCurrentTeamIdState(id);
    try {
      localStorage.setItem('pickem_team_id', id);
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  };

  const currentTeam = teams.find(t => t.id === currentTeamId) || teams[0];
  const activeSweatGame = games.find(g => g.id === 'game-1') || games[0];

  // Pre-generation service: Calculate initial strategist briefing metadata lazily on load
  useEffect(() => {
    if (currentTeam?.id) {
      // Only prepare primary Coach Sal briefing lazily to preserve API quota
      audioPreGenerationService.pregenerateBriefing(currentTeam.id, 'sal');
    }
  }, [currentTeam?.id]);

  // Simulation handler for the War Room
  const simulateScenario = (scenario: 'kc_wins' | 'buf_scores_td' | 'reset') => {
    if (scenario === 'reset') {
      setSimulationState('kc_leads');
      setGames(INITIAL_GAMES);
      setTeams(INITIAL_TEAMS);
      return;
    }

    if (scenario === 'buf_scores_td') {
      setSimulationState('buf_ahead');
      setGames(prev =>
        prev.map(g => {
          if (g.id === 'game-1') {
            return {
              ...g,
              homeScore: 24,
              awayScore: 28,
              clock: '00:42',
              situation: 'BUF Touchdown! Extra Point Good',
              homeWinProbability: 0.16,
              possession: 'home',
            };
          }
          return g;
        })
      );

      // Re-calculate standings: Dave (picked BUF 12) jumps ahead, Todd (picked KC 14) loses points
      setTeams(prev => {
        return [
          {
            ...prev.find(t => t.id === 'team-dave')!,
            rank: 1,
            rankDelta: 1,
            lockedPoints: 108,
            activeSweatPoints: 12,
            statusText: 'Controls Own Destiny',
            destinyStatus: 'controls_destiny',
          },
          {
            ...prev.find(t => t.id === 'team-todd')!,
            rank: 2,
            rankDelta: -1,
            lockedPoints: 98,
            activeSweatPoints: 0,
            statusText: 'Needs Seattle Upset on MNF',
            destinyStatus: 'must_win_pivot',
          },
          ...prev.filter(t => t.id !== 'team-dave' && t.id !== 'team-todd'),
        ].sort((a, b) => (b.lockedPoints + b.activeSweatPoints) - (a.lockedPoints + a.activeSweatPoints));
      });

      // Add a dynamic sweat notification
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          type: 'sweat',
          title: '⚡ REDZONE LEAD FLIP!',
          subtitle: 'Buffalo Touchdown with 0:42 left',
          body: 'Buffalo punches it in from the 2! Dave now leads the weekly pool (108 pts). Todd drops to 2nd.',
          timeAgo: 'Just now',
          read: false,
        },
        ...prev,
      ]);
    } else if (scenario === 'kc_wins') {
      setSimulationState('final_kc');
      setGames(prev =>
        prev.map(g => {
          if (g.id === 'game-1') {
            return {
              ...g,
              homeScore: 24,
              awayScore: 21,
              status: 'final',
              clock: 'FINAL',
              situation: 'Chiefs Goal-Line Stand Ends Game',
              homeWinProbability: 1.0,
            };
          }
          return g;
        })
      );

      // Solidify Todd's 1st place win
      setTeams(prev =>
        prev.map(t => {
          if (t.id === 'team-todd') {
            return {
              ...t,
              rank: 1,
              lockedPoints: 112,
              activeSweatPoints: 0,
              statusText: 'Weekly Winner Clinched',
            };
          }
          if (t.id === 'team-dave') {
            return {
              ...t,
              rank: 2,
              lockedPoints: 96,
              activeSweatPoints: 0,
              statusText: 'Runner Up Locked',
            };
          }
          return t;
        })
      );
    }
  };

  const addComment = (content: string) => {
    if (!content.trim()) return;
    const newComment: CommentMessage = {
      id: `comm-${Date.now()}`,
      teamId: currentTeam.id,
      authorName: `${currentTeam.ownerName} (${currentTeam.teamName})`,
      authorAvatar: currentTeam.avatar,
      authorColor: currentTeam.color,
      content: content.trim(),
      timestamp: 'Just now',
      reactions: {},
    };
    setComments(prev => [newComment, ...prev]);
  };

  const addReaction = (commentId: string, emoji: string) => {
    setComments(prev =>
      prev.map(c => {
        if (c.id === commentId) {
          const currentCount = c.reactions[emoji] || 0;
          return {
            ...c,
            reactions: {
              ...c.reactions,
              [emoji]: currentCount + 1,
            },
          };
        }
        return c;
      })
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const updateTeamRoster = (newTeams: Team[]) => {
    if (Array.isArray(newTeams) && newTeams.length > 0) {
      setTeams(newTeams);
    }
  };

  const updateGroupPicksMatrix = (newMatrix: YahooGroupTeamRow[]) => {
    if (Array.isArray(newMatrix) && newMatrix.length > 0) {
      setGroupPicksMatrix(newMatrix);
    }
  };

  const resetGroupPicksMatrix = () => {
    setGroupPicksMatrix(YAHOO_GROUP_PICKS_MATRIX);
  };

  return (
    <TeamContext.Provider
      value={{
        teams,
        setTeams,
        updateTeamRoster,
        groupPicksMatrix,
        updateGroupPicksMatrix,
        resetGroupPicksMatrix,
        currentTeam,
        setCurrentTeamId,
        games,
        setGames,
        activeSweatGame,
        comments,
        addComment,
        addReaction,
        notifications,
        markNotificationAsRead,
        isIdentityModalOpen,
        setIsIdentityModalOpen,
        isSpecModalOpen,
        setIsSpecModalOpen,
        isNotificationOpen,
        setIsNotificationOpen,
        isYahooSyncModalOpen,
        setIsYahooSyncModalOpen,
        isCommentarySidebarOpen,
        setIsCommentarySidebarOpen,
        toggleCommentarySidebar,
        yahooLeagueId,
        yahooLeagueUrl,
        fetchLiveEspnGames,
        isSyncingLive,
        lastSyncTime,
        yahooLockWindows,
        autoSyncEnabled,
        syncAuditLogs,
        fetchYahooLockWindows,
        syncYahooLockWindow,
        toggleAutoSync,
        isSyncingLockWindow,
        simulateScenario,
        simulationState,
        activeTab,
        setActiveTab,
        currentWeek,
        setCurrentWeek,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};
