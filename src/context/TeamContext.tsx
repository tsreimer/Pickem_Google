import React, { createContext, useContext, useState, useEffect } from 'react';
import { Team, Game, CommentMessage, PushNotificationItem } from '../types';
import { INITIAL_TEAMS, INITIAL_GAMES, INITIAL_COMMENTS, INITIAL_NOTIFICATIONS } from '../data/mockData';
import { audioPreGenerationService } from '../services/audioPreGenerationService';

interface TeamContextType {
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
  // Simulation Controls
  simulateScenario: (scenario: 'kc_wins' | 'buf_scores_td' | 'reset') => void;
  simulationState: 'kc_leads' | 'buf_ahead' | 'final_kc' | 'final_buf';
  activeTab: 'home' | 'war-room' | 'strategist' | 'watercooler' | 'vault';
  setActiveTab: (tab: 'home' | 'war-room' | 'strategist' | 'watercooler' | 'vault') => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [games, setGames] = useState<Game[]>(INITIAL_GAMES);
  const [comments, setComments] = useState<CommentMessage[]>(INITIAL_COMMENTS);
  const [notifications, setNotifications] = useState<PushNotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isYahooSyncModalOpen, setIsYahooSyncModalOpen] = useState(false);
  const [isCommentarySidebarOpen, setIsCommentarySidebarOpen] = useState(false);
  const toggleCommentarySidebar = () => setIsCommentarySidebarOpen(prev => !prev);
  const [isSyncingLive, setIsSyncingLive] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Live (Auto-polling)');
  const yahooLeagueId = '13003';
  const yahooLeagueUrl = 'https://football.fantasysports.yahoo.com/pickem/13003';

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
  const [simulationState, setSimulationState] = useState<'kc_leads' | 'buf_ahead' | 'final_kc' | 'final_buf'>('kc_leads');
  const [activeTab, setActiveTab] = useState<'home' | 'war-room' | 'strategist' | 'watercooler' | 'vault'>('home');

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

  return (
    <TeamContext.Provider
      value={{
        teams,
        setTeams,
        updateTeamRoster,
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
        simulateScenario,
        simulationState,
        activeTab,
        setActiveTab,
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
