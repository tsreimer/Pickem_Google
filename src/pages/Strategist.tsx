import React, { useState, useMemo } from 'react';
import { useTeam } from '../context/TeamContext';
import { INITIAL_DIVERGENCE_DATA, INITIAL_TEAMS } from '../data/mockData';
import { IndividualPickerAudioAdvice } from '../components/IndividualPickerAudioAdvice';
import { AskCoachAdvice } from '../components/AskCoachAdvice';
import { PickAllocation } from '../types';
import {
  Cpu,
  Sliders,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Lock,
  Share2,
  Zap,
  Mic,
  Trophy,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  BarChart3,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

// Detailed 16-game portfolio for Todd Reimer and league managers (Week 1)
const TODD_16_GAME_PORTFOLIO_WEEK_1 = [
  {
    gameNum: 1,
    matchup: 'SEA Seahawks @ NE Patriots',
    teamPicked: 'Seattle Seahawks',
    teamCode: 'SEA',
    confidencePts: 8,
    status: 'settled_won',
    score: 'SEA 23 - NE 20 (OT)',
    pointsEarned: 8,
    vegasWinProb: 0.62,
    publicPickPct: 0.71,
    strategicRating: 'CASHED WIN',
    strategicInsight: 'Clean bank: 8 points secured to establish baseline floor.',
  },
  {
    gameNum: 2,
    matchup: 'LAR Rams @ SF 49ers',
    teamPicked: 'Los Angeles Rams',
    teamCode: 'LAR',
    confidencePts: 9,
    status: 'settled_lost',
    score: 'SF 24 - LAR 21',
    pointsEarned: 0,
    vegasWinProb: 0.67,
    publicPickPct: 0.91,
    strategicRating: 'ABSORBED LOSS',
    strategicInsight: 'Loss absorbed: Only 9 pts dropped while 100% of top 7 anchors (10-16 pts) survived intact.',
  },
  {
    gameNum: 3,
    matchup: 'CIN Bengals @ CLE Browns',
    teamPicked: 'Cincinnati Bengals',
    teamCode: 'CIN',
    confidencePts: 10,
    status: 'pending',
    score: 'Sun 1:00 PM',
    pointsEarned: null,
    vegasWinProb: 0.64,
    publicPickPct: 0.58,
    strategicRating: 'CORE ANCHOR',
    strategicInsight: 'Divisional road favorite; high EV match against volatile Browns offense.',
  },
  {
    gameNum: 4,
    matchup: 'DET Lions @ GB Packers',
    teamPicked: 'Detroit Lions',
    teamCode: 'DET',
    confidencePts: 14,
    status: 'pending',
    score: 'Sun 1:00 PM',
    pointsEarned: null,
    vegasWinProb: 0.74,
    publicPickPct: 0.68,
    strategicRating: 'HEAVY ANCHOR',
    strategicInsight: 'Trench advantage: Lions offensive line projected to dominate time of possession.',
  },
  {
    gameNum: 5,
    matchup: 'TEN Titans @ CHI Bears',
    teamPicked: 'Tennessee Titans',
    teamCode: 'TEN',
    confidencePts: 2,
    status: 'pending',
    score: 'Sun 1:00 PM',
    pointsEarned: null,
    vegasWinProb: 0.45,
    publicPickPct: 0.22,
    strategicRating: 'LOW RISK FLYER',
    strategicInsight: 'Low 2-pt allocation protects portfolio while capturing rookie QB debut variance.',
  },
  {
    gameNum: 6,
    matchup: 'BAL Ravens @ KC Chiefs',
    teamPicked: 'Baltimore Ravens',
    teamCode: 'BAL',
    confidencePts: 12,
    status: 'pending',
    score: 'Sun 1:00 PM',
    pointsEarned: null,
    vegasWinProb: 0.59,
    publicPickPct: 0.48,
    strategicRating: 'CORE ANCHOR',
    strategicInsight: 'Undervalued road contender with elite ground attack; heavy leverage against crowd.',
  },
  {
    gameNum: 7,
    matchup: 'PIT Steelers @ ATL Falcons',
    teamPicked: 'Pittsburgh Steelers',
    teamCode: 'PIT',
    confidencePts: 11,
    status: 'pending',
    score: 'Sun 1:00 PM',
    pointsEarned: null,
    vegasWinProb: 0.61,
    publicPickPct: 0.54,
    strategicRating: 'CORE ANCHOR',
    strategicInsight: 'Mike Tomlin road underdog/favorite paradigm; elite pass rush matchup.',
  },
  {
    gameNum: 8,
    matchup: 'CHI Bears vs TEN Titans',
    teamPicked: 'Chicago Bears',
    teamCode: 'CHI',
    confidencePts: 3,
    status: 'pending',
    score: 'Sun 1:00 PM',
    pointsEarned: null,
    vegasWinProb: 0.55,
    publicPickPct: 0.78,
    strategicRating: 'DEAD CHALK FADE',
    strategicInsight: 'Public overhyping rookie hype train; keeping confidence strictly at 3 pts.',
  },
  {
    gameNum: 9,
    matchup: 'JAX Jaguars @ MIA Dolphins',
    teamPicked: 'Jacksonville Jaguars',
    teamCode: 'JAX',
    confidencePts: 15,
    status: 'pending',
    score: 'Sun 1:00 PM',
    pointsEarned: null,
    vegasWinProb: 0.78,
    publicPickPct: 0.49,
    strategicRating: 'HEAVY ANCHOR',
    strategicInsight: 'Highest EV spread divergence on the slate. Underowned high-confidence anchor.',
  },
  {
    gameNum: 10,
    matchup: 'BUF Bills vs ARI Cardinals',
    teamPicked: 'Buffalo Bills',
    teamCode: 'BUF',
    confidencePts: 6,
    status: 'pending',
    score: 'Sun 1:00 PM',
    pointsEarned: null,
    vegasWinProb: 0.72,
    publicPickPct: 0.88,
    strategicRating: 'CHALK TRAP BUFFER',
    strategicInsight: 'High public ownership (88%) triggers conservative 6-pt hedge.',
  },
  {
    gameNum: 11,
    matchup: 'LV Raiders @ LAC Chargers',
    teamPicked: 'Las Vegas Raiders',
    teamCode: 'LV',
    confidencePts: 7,
    status: 'pending',
    score: 'Sun 4:05 PM',
    pointsEarned: null,
    vegasWinProb: 0.48,
    publicPickPct: 0.35,
    strategicRating: 'MID LEVERAGE',
    strategicInsight: 'Divisional rivalry game with high turnover variance; 7 pts is optimal balance.',
  },
  {
    gameNum: 12,
    matchup: 'MIN Vikings @ NYG Giants',
    teamPicked: 'Minnesota Vikings',
    teamCode: 'MIN',
    confidencePts: 1,
    status: 'pending',
    score: 'Sun 4:05 PM',
    pointsEarned: null,
    vegasWinProb: 0.52,
    publicPickPct: 0.51,
    strategicRating: 'MINIMUM HEDGE',
    strategicInsight: '1 pt allocation completely insulates standings from backup QB uncertainty.',
  },
  {
    gameNum: 13,
    matchup: 'PHI Eagles @ WAS Commanders',
    teamPicked: 'Philadelphia Eagles',
    teamCode: 'PHI',
    confidencePts: 13,
    status: 'pending',
    score: 'Sun 4:25 PM',
    pointsEarned: null,
    vegasWinProb: 0.71,
    publicPickPct: 0.79,
    strategicRating: 'CORE ANCHOR',
    strategicInsight: 'Elite roster talent disparity; protecting 13 pts as a mandatory Sunday bank.',
  },
  {
    gameNum: 14,
    matchup: 'LAC Chargers vs LV Raiders',
    teamPicked: 'Los Angeles Chargers',
    teamCode: 'LAC',
    confidencePts: 16,
    status: 'pending',
    score: 'Sun 4:25 PM',
    pointsEarned: null,
    vegasWinProb: 0.82,
    publicPickPct: 0.65,
    strategicRating: 'MAXIMUM ANCHOR (16 PTS)',
    strategicInsight: 'Jim Harbaugh ground-and-pound system; pool-winning primary 16-point anchor.',
  },
  {
    gameNum: 15,
    matchup: 'DAL Cowboys @ CLE Browns',
    teamPicked: 'Dallas Cowboys',
    teamCode: 'DAL',
    confidencePts: 4,
    status: 'pending',
    score: 'Sun 4:25 PM',
    pointsEarned: null,
    vegasWinProb: 0.53,
    publicPickPct: 0.72,
    strategicRating: 'VOLATILITY SHIELD',
    strategicInsight: 'Tough road environment against Myles Garrett; small 4-pt hedge.',
  },
  {
    gameNum: 16,
    matchup: 'KC Chiefs vs BAL Ravens (MNF)',
    teamPicked: 'Kansas City Chiefs',
    teamCode: 'KC',
    confidencePts: 5,
    status: 'pending',
    score: 'Mon 8:15 PM',
    pointsEarned: null,
    vegasWinProb: 0.58,
    publicPickPct: 0.66,
    strategicRating: 'ENDGAME LEVERAGE',
    strategicInsight: 'Low 5-pt MNF allocation leaves maximum flexibility for late-game clinch pivot.',
  },
];

// Detailed 16-game portfolio for Todd Reimer (Week 2 Final Settled - 69 pts)
const TODD_16_GAME_PORTFOLIO_WEEK_2 = [
  {
    gameNum: 1,
    matchup: 'BUF Bills @ DET Lions (TNF)',
    teamPicked: 'Detroit Lions',
    teamCode: 'DET',
    confidencePts: 3,
    status: 'settled_lost',
    score: 'BUF 41 - DET 31 (Final)',
    pointsEarned: 0,
    vegasWinProb: 0.42,
    publicPickPct: 0.38,
    strategicRating: 'ABSORBED LOSS',
    strategicInsight: 'Controlled damage: Dropped 3 confidence points on road dog in 41-31 shootout.',
  },
  {
    gameNum: 2,
    matchup: 'CAR Panthers @ ATL Falcons',
    teamPicked: 'Atlanta Falcons',
    teamCode: 'ATL',
    confidencePts: 2,
    status: 'settled_lost',
    score: 'CAR 34 - ATL 3 (Final)',
    pointsEarned: 0,
    vegasWinProb: 0.46,
    publicPickPct: 0.49,
    strategicRating: 'ABSORBED LOSS',
    strategicInsight: 'Panthers blowout 34-3; small 2-pt allocation safely absorbed.',
  },
  {
    gameNum: 3,
    matchup: 'MIN Vikings @ CHI Bears',
    teamPicked: 'Chicago Bears',
    teamCode: 'CHI',
    confidencePts: 10,
    status: 'settled_lost',
    score: 'MIN 9 - CHI 3 (Final)',
    pointsEarned: 0,
    vegasWinProb: 0.69,
    publicPickPct: 0.74,
    strategicRating: 'DEFENSIVE UPSET',
    strategicInsight: 'Defensive grind at Soldier Field: 9-3 Vikings upset dropped 10 points.',
  },
  {
    gameNum: 4,
    matchup: 'TEN Titans @ PHI Eagles',
    teamPicked: 'Philadelphia Eagles',
    teamCode: 'PHI',
    confidencePts: 12,
    status: 'settled_won',
    score: 'PHI 24 - TEN 20 (Final)',
    pointsEarned: 12,
    vegasWinProb: 0.76,
    publicPickPct: 0.82,
    strategicRating: 'CORE ANCHOR CASHED',
    strategicInsight: 'Major 12-point anchor delivers in tight 24-20 battle at Lincoln Financial Field.',
  },
  {
    gameNum: 5,
    matchup: 'PIT Steelers @ NE Patriots',
    teamPicked: 'Pittsburgh Steelers',
    teamCode: 'PIT',
    confidencePts: 4,
    status: 'settled_lost',
    score: 'NE 20 - PIT 3 (Final)',
    pointsEarned: 0,
    vegasWinProb: 0.42,
    publicPickPct: 0.48,
    strategicRating: 'ABSORBED LOSS',
    strategicInsight: 'Patriots defense dominates 20-3; dropped 4 points.',
  },
  {
    gameNum: 6,
    matchup: 'NYJ Jets @ GB Packers',
    teamPicked: 'New York Jets',
    teamCode: 'NYJ',
    confidencePts: 1,
    status: 'settled_lost',
    score: 'GB 20 - NYJ 17 OT (Final)',
    pointsEarned: 0,
    vegasWinProb: 0.35,
    publicPickPct: 0.32,
    strategicRating: 'DAMAGE CONTROL',
    strategicInsight: 'Green Bay walk-off in OT; minimal 1-pt hedge loss.',
  },
  {
    gameNum: 7,
    matchup: 'CLE Browns @ TB Buccaneers',
    teamPicked: 'Tampa Bay Buccaneers',
    teamCode: 'TB',
    confidencePts: 15,
    status: 'settled_lost',
    score: 'CLE 23 - TB 19 (Final)',
    pointsEarned: 0,
    vegasWinProb: 0.74,
    publicPickPct: 0.78,
    strategicRating: 'HEAVY UPSET CASUALTY',
    strategicInsight: 'Massive pool shocker: Browns stun Bucs 23-19, wiping out 15 points.',
  },
  {
    gameNum: 8,
    matchup: 'NO Saints @ BAL Ravens',
    teamPicked: 'Baltimore Ravens',
    teamCode: 'BAL',
    confidencePts: 14,
    status: 'settled_lost',
    score: 'NO 24 - BAL 17 (Final)',
    pointsEarned: 0,
    vegasWinProb: 0.81,
    publicPickPct: 0.87,
    strategicRating: 'MASSIVE UPSET LOSS',
    strategicInsight: 'Week 2 pool wrecker: Saints shock Lamar Jackson 24-17; 87% of all pools took Baltimore.',
  },
  {
    gameNum: 9,
    matchup: 'CIN Bengals @ HOU Texans',
    teamPicked: 'Houston Texans',
    teamCode: 'HOU',
    confidencePts: 5,
    status: 'settled_lost',
    score: 'CIN 20 - HOU 6 (Final)',
    pointsEarned: 0,
    vegasWinProb: 0.45,
    publicPickPct: 0.49,
    strategicRating: 'ABSORBED LOSS',
    strategicInsight: 'Bengals defense limits Texans to 6 points; 5-pt flyer dropped.',
  },
  {
    gameNum: 10,
    matchup: 'JAX Jaguars @ DEN Broncos',
    teamPicked: 'Jacksonville Jaguars',
    teamCode: 'JAX',
    confidencePts: 7,
    status: 'settled_lost',
    score: 'DEN 20 - JAX 13 (Final)',
    pointsEarned: 0,
    vegasWinProb: 0.52,
    publicPickPct: 0.65,
    strategicRating: 'ROAD DOG HIT',
    strategicInsight: 'Mile High altitude grind: Broncos edge Jags 20-13; dropped 7 points.',
  },
  {
    gameNum: 11,
    matchup: 'LV Raiders @ LAC Chargers',
    teamPicked: 'Los Angeles Chargers',
    teamCode: 'LAC',
    confidencePts: 6,
    status: 'settled_lost',
    score: 'LV 26 - LAC 14 (Final)',
    pointsEarned: 0,
    vegasWinProb: 0.72,
    publicPickPct: 0.79,
    strategicRating: 'DIVISIONAL UPSET',
    strategicInsight: 'Raiders ambush Chargers in SoFi 26-14; 6-pt loss absorbed.',
  },
  {
    gameNum: 12,
    matchup: 'WAS Commanders @ DAL Cowboys',
    teamPicked: 'Dallas Cowboys',
    teamCode: 'DAL',
    confidencePts: 8,
    status: 'settled_won',
    score: 'DAL 37 - WAS 20 (Final)',
    pointsEarned: 8,
    vegasWinProb: 0.63,
    publicPickPct: 0.67,
    strategicRating: 'SOLID WIN',
    strategicInsight: 'Offensive explosion at AT&T Stadium: Cashed 8 points in 37-20 rout.',
  },
  {
    gameNum: 13,
    matchup: 'ARI Cardinals @ SEA Seahawks',
    teamPicked: 'Seattle Seahawks',
    teamCode: 'SEA',
    confidencePts: 9,
    status: 'settled_won',
    score: 'SEA 31 - ARI 7 (Final)',
    pointsEarned: 9,
    vegasWinProb: 0.64,
    publicPickPct: 0.66,
    strategicRating: 'SOLID WIN',
    strategicInsight: 'Lumen Field blowout: Seahawks throttle Cardinals 31-7 to lock in 9 points.',
  },
  {
    gameNum: 14,
    matchup: 'MIA Dolphins @ SF 49ers',
    teamPicked: 'San Francisco 49ers',
    teamCode: 'SF',
    confidencePts: 16,
    status: 'settled_won',
    score: 'SF 35 - MIA 13 (Final)',
    pointsEarned: 16,
    vegasWinProb: 0.88,
    publicPickPct: 0.92,
    strategicRating: 'MAX CHALK CASHED',
    strategicInsight: 'Crown jewel anchor cashed: 49ers demolish Miami 35-13 to deliver maximum 16 points.',
  },
  {
    gameNum: 15,
    matchup: 'IND Colts @ KC Chiefs (SNF)',
    teamPicked: 'Kansas City Chiefs',
    teamCode: 'KC',
    confidencePts: 11,
    status: 'settled_won',
    score: 'KC 33 - IND 30 OT (Final)',
    pointsEarned: 11,
    vegasWinProb: 0.71,
    publicPickPct: 0.78,
    strategicRating: 'SNF ANCHOR CASHED',
    strategicInsight: 'Mahomes overtime thriller: 11 points banked on Sunday Night Football.',
  },
  {
    gameNum: 16,
    matchup: 'NYG Giants @ LAR Rams (MNF)',
    teamPicked: 'Los Angeles Rams',
    teamCode: 'LAR',
    confidencePts: 13,
    status: 'settled_won',
    score: 'LAR 28 - NYG 6 (Final)',
    pointsEarned: 13,
    vegasWinProb: 0.74,
    publicPickPct: 0.81,
    strategicRating: 'MNF ANCHOR CASHED',
    strategicInsight: 'Rams cruise 28-6 on Monday Night Football to close out Week 2 with 69 total points.',
  },
];

export const Strategist: React.FC = () => {
  const { currentTeam, teams, setCurrentTeamId, setActiveTab, comments, addComment, currentWeek, setCurrentWeek } = useTeam();
  const [selectedPickerId, setSelectedPickerId] = useState<string>(currentTeam?.id || 'team-todd');
  const [activePortalSection, setActivePortalSection] = useState<'ask_coach' | 'audio' | 'portfolio' | 'optimizer' | 'clinch'>('ask_coach');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Strategic Objective Slider: 0 = Podium Lock, 75 = Weekly Bounty Hunter, 100 = Hail Mary Chaos
  const [sliderValue, setSliderValue] = useState<number>(75);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Active manager profile
  const activeTeam = useMemo(() => {
    return teams.find(t => t.id === selectedPickerId) || currentTeam || teams[0];
  }, [teams, selectedPickerId, currentTeam]);

  // Leader team for clinch calculations
  const leaderTeam = useMemo(() => {
    return teams.find(t => t.rank === 1) || teams[0];
  }, [teams]);

  // Privacy & Access Control: Users can only view their own team's advice unless Admin or posted to chat
  const isOwnTeam = selectedPickerId === currentTeam.id;
  const isAdvicePostedToChat = useMemo(() => {
    const ownerLower = (activeTeam?.ownerName || '').toLowerCase();
    const teamLower = (activeTeam?.teamName || '').toLowerCase();
    return comments.some(c => {
      const commentBody = (c.content || (c as unknown as { text?: string }).text || '').toLowerCase();
      return (
        (ownerLower && commentBody.includes(ownerLower)) || 
        (teamLower && commentBody.includes(teamLower))
      );
    });
  }, [comments, activeTeam]);

  const hasAccess = isOwnTeam || isAdmin || isAdvicePostedToChat;

  // Sync picker selection with team context
  const handleManagerSwitch = (newId: string) => {
    setSelectedPickerId(newId);
    setCurrentTeamId(newId);
  };

  // Dynamic re-allocation of confidence points based on slider
  const optimizedPicks = useMemo(() => {
    const picks = [...INITIAL_DIVERGENCE_DATA];
    return picks.map(p => {
      let confidence = p.confidencePoints;
      if (sliderValue >= 75) {
        if (p.strategicRating === 'EXTREME VALUE') confidence = Math.min(16, p.confidencePoints + 1);
        if (p.strategicRating === 'LEVERAGE PIVOT') confidence = Math.min(16, p.confidencePoints + 2);
        if (p.strategicRating === 'DEAD CHALK TRAP') confidence = Math.max(1, p.confidencePoints - 1);
      } else if (sliderValue <= 25) {
        if (p.strategicRating === 'CHALK LOCK') confidence = Math.min(16, p.confidencePoints + 2);
        if (p.strategicRating === 'LEVERAGE PIVOT') confidence = Math.max(1, p.confidencePoints - 3);
      }
      return {
        ...p,
        confidencePoints: confidence,
      };
    });
  }, [sliderValue]);

  // Monday Night Football Clinch Pick
  const mnfPick = useMemo(() => {
    return optimizedPicks.find(p => p.gameId === 'div-4' || p.matchup.includes('MNF')) || {
      gameId: 'div-4',
      matchup: 'SF 49ers @ SEA Seahawks (MNF)',
      selectedTeam: 'Seattle Seahawks',
      selectedTeamCode: 'SEA',
      confidencePoints: 14,
      vegasWinProbability: 0.320,
      publicPickRate: 0.080,
      strategicRating: 'LEVERAGE PIVOT' as const,
      recommendation: 'Chasers must pivot to Seattle.',
      laneTarget: 'weekly' as const,
    };
  }, [optimizedPicks]);

  const filteredPicks = useMemo(() => {
    if (activeFilter === 'ALL') return optimizedPicks;
    return optimizedPicks.filter(p => p.strategicRating === activeFilter);
  }, [optimizedPicks, activeFilter]);

  const getRatingBadge = (rating: PickAllocation['strategicRating']) => {
    switch (rating) {
      case 'EXTREME VALUE':
        return (
          <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-sans font-bold text-[10px] tracking-wide">
            EXTREME VALUE
          </span>
        );
      case 'DEAD CHALK TRAP':
        return (
          <span className="px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-300 font-sans font-bold text-[10px] tracking-wide">
            DEAD CHALK TRAP
          </span>
        );
      case 'LEVERAGE PIVOT':
        return (
          <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 font-sans font-bold text-[10px] tracking-wide">
            LEVERAGE PIVOT
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-sans font-bold text-[10px] tracking-wide">
            CHALK LOCK
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. CONFIDENTIAL LOCKER ROOM MANAGER HEADER BANNER */}
      <div className="bg-[#0B0F17] border-2 border-emerald-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Confidential Locker Room & Strategy War Room</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px]">
                Private Manager Portal
              </span>
              {isOwnTeam && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-900/70 text-emerald-200 border border-emerald-500/50 text-[10px] font-mono font-bold">
                  ★ Your Team
                </span>
              )}
              {!isOwnTeam && isAdvicePostedToChat && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-mono">
                  🔓 Shared to Chat
                </span>
              )}
              {!isOwnTeam && !isAdvicePostedToChat && !isAdmin && (
                <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Private
                </span>
              )}
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700 text-[10px] font-mono">
                  🛡️ Admin Mode
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {activeTeam?.ownerName || 'Todd Reimer'}'s Strategy Portal
              </h2>
              <span className="text-sm font-semibold text-slate-400">
                ({activeTeam?.teamName || 'CramItUp Your CramHole Lafleur'})
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500 text-xs font-mono font-bold">
                ★ Active Identity
              </span>
            </div>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Welcome to your private Initech Invitational War Room. This portal is strictly confidential to you: analyze your personal 16-game confidence portfolio, listen to Coach Sal's pre-buffered voice strategy briefing, explore dynamic game-by-game recommendations, and map your Monday Night clinch scenarios.
            </p>
          </div>

          {/* Identity Switcher & Watercooler Bridge */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <div className="p-3 rounded-xl bg-[#151D2A] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Active Manager Identity:
                </label>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center bg-[#0B0F17] rounded p-0.5 border border-slate-750">
                    <button
                      type="button"
                      onClick={() => setCurrentWeek(1)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                        currentWeek === 1
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Wk 1
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentWeek(2)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                        currentWeek === 2
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Wk 2 Active
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAdmin(prev => !prev)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded transition cursor-pointer flex items-center gap-1 ${
                      isAdmin
                        ? 'bg-purple-900 text-purple-200 border border-purple-600 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                    }`}
                    title="Toggle Commissioner / Admin Mode"
                  >
                    <Lock className="w-2.5 h-2.5" />
                    <span>Admin: {isAdmin ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>
              <select
                id="select-strategist-manager"
                value={selectedPickerId}
                onChange={(e) => handleManagerSwitch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-lg px-3 py-1.5 font-mono cursor-pointer hover:border-emerald-500 focus:outline-none focus:border-emerald-400"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.ownerName} ({t.teamName}) {t.id === currentTeam.id ? '★ (You)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setActivePortalSection('ask_coach')}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 text-xs text-amber-300 font-bold transition cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Ask Coach Sal</span>
            </button>

            <button
              onClick={() => setActiveTab('watercooler')}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 font-bold transition cursor-pointer"
            >
              <span>Go to Public Watercooler</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Manager KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-[#151D2A] border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Current Rank</div>
            <div className="text-xl font-black text-white mt-0.5">#{activeTeam?.rank || 8}</div>
            <div className="text-[10px] font-mono text-slate-500">Initech Invitational</div>
          </div>

          <div className="p-3 rounded-xl bg-[#151D2A] border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Points Banked</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              {currentWeek === 2 ? 69 : (activeTeam?.lockedPoints || 8)} pts
            </div>
            <div className="text-[10px] font-mono text-emerald-500">
              {currentWeek === 2 ? '6 Wins Settled' : 'Seattle Win Cashed'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#151D2A] border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Loss Absorbed</div>
            <div className="text-xl font-black text-amber-400 mt-0.5">
              {currentWeek === 2 ? '-67 pts' : '-9 pts'}
            </div>
            <div className="text-[10px] font-mono text-amber-500">
              {currentWeek === 2 ? '10 Upsets Absorbed' : 'SoFi Rams Choke'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#151D2A] border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Top Anchors Intact</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              {currentWeek === 2 ? 'SF [16] + LAR [13]' : '100% (7/7)'}
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              {currentWeek === 2 ? 'SF, LAR, PHI, KC Delivered' : '10, 11, 12, 13, 14, 15, 16 Live'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#151D2A] border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Max Possible</div>
            <div className="text-xl font-black text-white mt-0.5">
              {currentWeek === 2 ? '69 pts' : (activeTeam?.maxPossible || 127) + ' pts'}
            </div>
            <div className="text-[10px] font-mono text-cyan-400">
              {currentWeek === 2 ? 'Week 2 Official Final' : '#1 Recovery Runway'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#151D2A] border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Portfolio Grade</div>
            <div className="text-xl font-black text-amber-400 mt-0.5">
              {currentWeek === 2 ? 'Grade B-' : 'Grade A'}
            </div>
            <div className="text-[10px] font-mono text-emerald-500">
              {currentWeek === 2 ? 'Cashed 16-pt Anchor' : 'Masterful Structure'}
            </div>
          </div>
        </div>

        {/* Interactive In-Page Navigation Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-800/80">
          <span className="text-xs font-mono text-slate-400 mr-2">WAR ROOM SECTIONS:</span>
          <button
            onClick={() => setActivePortalSection('ask_coach')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activePortalSection === 'ask_coach'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/50 font-black'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>💬 Ask Coach Sal (Pick Advice)</span>
          </button>

          <button
            onClick={() => setActivePortalSection('audio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activePortalSection === 'audio'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/50'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>🎙️ Confidential Audio Briefing</span>
          </button>

          <button
            onClick={() => setActivePortalSection('portfolio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activePortalSection === 'portfolio'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>📋 My 16-Game Pick Portfolio</span>
          </button>

          <button
            onClick={() => setActivePortalSection('optimizer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activePortalSection === 'optimizer'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-950/50'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>📊 Game Recommendations & ILP Optimizer</span>
          </button>

          <button
            onClick={() => setActivePortalSection('clinch')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activePortalSection === 'clinch'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-950/50'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>⚖️ Monday Night Clinch Solver</span>
          </button>
        </div>
      </div>

      {/* SECTION: ASK COACH SAL FOR PICK ADVICE & TACTICAL ANALYSIS */}
      {activePortalSection === 'ask_coach' && (
        <AskCoachAdvice
          selectedTeamId={selectedPickerId}
          onPostToChat={(msg) => addComment({
            author: activeTeam.ownerName,
            teamName: activeTeam.teamName,
            teamId: activeTeam.id,
            content: msg,
          })}
        />
      )}

      {/* SECTION 2: CONFIDENTIAL AUDIO STRATEGY BRIEFING (PRE-BUFFERED INSTANT PLAYBACK) */}
      {(activePortalSection === 'audio' || activePortalSection === 'portfolio') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="text-lg font-black text-white tracking-tight">
                Confidential Voice Strategy Briefing
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                Coach Sal Ditkofsky (Pre-buffered • Zero Wait)
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Private to {activeTeam?.ownerName}
            </span>
          </div>

          {/* Access Control Barrier: Only allow user's own team, Admin override, or advice posted to chat */}
          {!hasAccess ? (
            <div className="bg-[#0B0F17] border-2 border-amber-500/40 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="text-lg font-black text-white tracking-tight">
                  Confidential Locker Room: {activeTeam.ownerName}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This audio briefing and tactical game-plan is private to <strong className="text-amber-300">{activeTeam.ownerName}</strong> ({activeTeam.teamName}). Individual manager advice is restricted to protect pool fairness unless the manager posts it to the league chat, or commissioner admin override is enabled.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPickerId(currentTeam.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono transition cursor-pointer shadow-lg shadow-emerald-950/60 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Return to My War Room ({currentTeam.ownerName})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdmin(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Commissioner Admin Override</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Unlocked via Public Chat notification if viewing someone else's shared advice */}
              {!isOwnTeam && isAdvicePostedToChat && (
                <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between gap-3 text-xs font-mono text-cyan-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>🔓 Publicly Unlocked: {activeTeam.ownerName} posted this strategy advice to the league trash-talk thread!</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('watercooler')}
                    className="underline hover:text-white shrink-0 cursor-pointer"
                  >
                    View in Chat &rarr;
                  </button>
                </div>
              )}

              {/* Mount IndividualPickerAudioAdvice in private_portal mode with onPostAdviceToChat handler */}
              <IndividualPickerAudioAdvice
                mode="private_portal"
                initialSelectedPickerId={selectedPickerId}
                onPickerChange={(id) => setSelectedPickerId(id)}
                onPostAdviceToChat={(msg) => addComment(msg)}
                onAskCoachClick={() => setActivePortalSection('ask_coach')}
              />
            </>
          )}
        </div>
      )}

      {/* SECTION 3: MY PICK PORTFOLIO (WHAT I'VE PICKED ACROSS ALL 16 GAMES) */}
      {(activePortalSection === 'portfolio' || activePortalSection === 'audio') && (
        <div className="bg-[#151D2A] border border-[#1E293B] rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#1E293B] pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>My Week {currentWeek} Pick Portfolio & Live Confidence Table</span>
              </div>
              <h3 className="font-bold text-white text-base mt-1">
                Complete 16-Game Breakdown for {activeTeam?.ownerName}
              </h3>
              <p className="text-xs text-slate-400">
                Track your settled picks and live strategy across all 16 games with Vegas odds, crowd consensus, and tactical rating.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Status:</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono text-xs font-bold">
                {currentWeek === 2 ? '6 Wins • 10 Losses • 69 Pts Final' : '1 Win • 1 Loss • 14 Pending'}
              </span>
            </div>
          </div>

          {/* Portfolio Integrity Summary Cards */}
          {currentWeek === 2 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">⚡ Heavy Anchors (14–16 pts)</span>
                  <span className="text-amber-400 font-bold font-mono">1 of 3 CASHED (16 pts)</span>
                </div>
                <div className="text-lg font-black text-white">SF #16 CASHED</div>
                <div className="text-[11px] text-slate-400">
                  SF (16) crushed Miami 35-13; TB (15) and BAL (14) dropped in major upsets.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">🎯 Core Anchors (10–13 pts)</span>
                  <span className="text-emerald-400 font-bold font-mono">3 of 4 CASHED (36 pts)</span>
                </div>
                <div className="text-lg font-black text-white">LAR #13, PHI #12, KC #11 WON</div>
                <div className="text-[11px] text-slate-400">
                  LAR (13), PHI (12), and KC (11) all held serve; CHI (10) dropped in 9-3 defensive battle.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">🛡️ Mid & Low Swings (1–9 pts)</span>
                  <span className="text-emerald-400 font-bold font-mono">2 of 9 CASHED (17 pts)</span>
                </div>
                <div className="text-lg font-black text-white">2 Wins • 17 Points Banked</div>
                <div className="text-[11px] text-slate-400">
                  SEA (9) and DAL (8) cashed; JAX (7), LAC (6), HOU (5), PIT (4), DET (3), ATL (2), NYJ (1) absorbed.
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">⚡ Heavy Anchors (14–16 pts)</span>
                  <span className="text-emerald-400 font-bold font-mono">100% INTACT</span>
                </div>
                <div className="text-lg font-black text-white">3 Games • 45 Points Live</div>
                <div className="text-[11px] text-slate-400">
                  LAC (16), JAX (15), DET (14) • Avg Win Prob: 81.3%
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">🎯 Core Anchors (10–13 pts)</span>
                  <span className="text-emerald-400 font-bold font-mono">100% INTACT</span>
                </div>
                <div className="text-lg font-black text-white">4 Games • 46 Points Live</div>
                <div className="text-[11px] text-slate-400">
                  PHI (13), BAL (12), PIT (11), CIN (10) • Avg Win Prob: 68.2%
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">🛡️ Low Leverage Swings (1–7 pts)</span>
                  <span className="text-blue-400 font-bold font-mono">SAFE VARIANCE</span>
                </div>
                <div className="text-lg font-black text-white">7 Games • 28 Points Live</div>
                <div className="text-[11px] text-slate-400">
                  LV (7), BUF (6), KC (5), DAL (4), CHI (3), TEN (2), MIN (1)
                </div>
              </div>
            </div>
          )}

          {/* 16-Game Picks Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-slate-400 border-b border-[#1E293B] font-mono text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-2">Game #</th>
                  <th className="py-3 px-3">Matchup</th>
                  <th className="py-3 px-3">Your Pick</th>
                  <th className="py-3 px-2 text-center">Confidence</th>
                  <th className="py-3 px-3">Result / Status</th>
                  <th className="py-3 px-3">Vegas Win %</th>
                  <th className="py-3 px-3">Public Pick %</th>
                  <th className="py-3 px-3">Strategic Rating</th>
                  <th className="py-3 px-3">Locker Room Directive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B] font-mono text-xs">
                {(currentWeek === 2 ? TODD_16_GAME_PORTFOLIO_WEEK_2 : TODD_16_GAME_PORTFOLIO_WEEK_1).map((item) => (
                  <tr
                    key={item.gameNum}
                    className={`hover:bg-slate-900/40 transition ${
                      item.status === 'settled_won'
                        ? 'bg-emerald-950/20'
                        : item.status === 'settled_lost'
                        ? 'bg-rose-950/20'
                        : item.confidencePts >= 14
                        ? 'bg-amber-950/10'
                        : ''
                    }`}
                  >
                    <td className="py-3 px-2 text-slate-400 font-bold">
                      #{item.gameNum}
                    </td>

                    <td className="py-3 px-3 text-white font-bold font-sans">
                      {item.matchup}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-200">
                        {item.teamPicked}
                      </span>
                    </td>

                    <td className="py-3 px-2 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-md font-black text-xs ${
                          item.confidencePts >= 14
                            ? 'bg-amber-500 text-slate-950'
                            : item.confidencePts >= 10
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.confidencePts} pts
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {item.status === 'settled_won' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>WON (+{item.pointsEarned}p)</span>
                        </span>
                      ) : item.status === 'settled_lost' ? (
                        <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-700 text-rose-300 font-bold flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>LOST (0p)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono">
                          {item.score}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-emerald-400 font-bold">
                      {(item.vegasWinProb * 100).toFixed(0)}%
                    </td>

                    <td className="py-3 px-3 text-slate-400">
                      {(item.publicPickPct * 100).toFixed(0)}%
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-sans ${
                          item.strategicRating.includes('HEAVY') || item.strategicRating.includes('MAXIMUM')
                            ? 'bg-amber-950 text-amber-300 border border-amber-700'
                            : item.strategicRating.includes('CORE')
                            ? 'bg-blue-950 text-blue-300 border border-blue-700'
                            : item.strategicRating.includes('CASHED')
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : item.strategicRating.includes('ABSORBED')
                            ? 'bg-slate-900 text-slate-400 border border-slate-700'
                            : 'bg-slate-900 text-slate-300 border border-slate-800'
                        }`}
                      >
                        {item.strategicRating}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-300 font-sans text-[11px] max-w-xs">
                      {item.strategicInsight}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: STRATEGIC OBJECTIVE CONTROLLER SLIDER & ILP ENGINE */}
      {(activePortalSection === 'optimizer' || activePortalSection === 'portfolio' || activePortalSection === 'audio') && (
        <div className="space-y-6">
          <div className="bg-[#151D2A] border border-[#1E293B] rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase">
                  <Sliders className="w-4 h-4" />
                  <span>Section 7.0 • Integer Linear Programming (ILP)</span>
                </div>
                <h3 className="font-bold text-white text-base mt-1">
                  Strategic Objective Tuning Slider for Rest of Week
                </h3>
                <p className="text-xs text-slate-400">
                  Dynamically balances individual game confidence allocations based on payout profile target.
                </p>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-700 text-xs font-mono text-emerald-300 font-bold self-start sm:self-auto">
                {sliderValue < 30
                  ? 'Active Mode: Podium Lock (Low Variance)'
                  : sliderValue < 70
                  ? 'Active Mode: Balanced Expected Value'
                  : sliderValue <= 85
                  ? `Active Mode: ${sliderValue}% Weekly Bounty Hunter`
                  : 'Active Mode: 100% Hail Mary Chaos'}
              </span>
            </div>

            {/* The Interactive Slider */}
            <div className="space-y-3 pt-2">
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={e => setSliderValue(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <button
                  onClick={() => setSliderValue(10)}
                  className={`hover:text-white transition ${sliderValue <= 25 ? 'text-blue-400 font-bold' : ''}`}
                >
                  0% (Podium Lock / Low Variance)
                </button>
                <button
                  onClick={() => setSliderValue(75)}
                  className={`hover:text-white transition ${sliderValue > 60 && sliderValue <= 85 ? 'text-emerald-400 font-bold' : ''}`}
                >
                  75% (Anti-Correlated Weekly Upside)
                </button>
                <button
                  onClick={() => setSliderValue(100)}
                  className={`hover:text-white transition ${sliderValue > 85 ? 'text-red-400 font-bold' : ''}`}
                >
                  100% (Hail Mary Chaos)
                </button>
              </div>
            </div>

            {/* Preset Quick-Buttons */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#1E293B]">
              <span className="text-xs text-slate-400 self-center mr-1">Quick Strategy Presets:</span>
              <button
                onClick={() => setSliderValue(15)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  sliderValue <= 25
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                🛡️ Season Podium Guardian
              </button>
              <button
                onClick={() => setSliderValue(75)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  sliderValue > 60 && sliderValue <= 85
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                🎯 Weekly Bounty Maximizer
              </button>
              <button
                onClick={() => setSliderValue(95)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  sliderValue > 85
                    ? 'bg-red-600 text-white font-bold'
                    : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                ⚡ Anti-Consensus Chaos
              </button>
            </div>
          </div>

          {/* DUAL-LANE MATHEMATICAL FORMULATION DISPLAY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Lane 1 */}
            <div className="bg-[#151D2A] border border-[#1E293B] rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-emerald-400 uppercase">
                  Lane 1: Weekly Bounty (1st Place)
                </span>
                <span className="px-2 py-0.5 text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-300 rounded font-mono">
                  Variance Maximizer
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Focuses on right-tail 95th-percentile outcomes by penalizing dead chalk and boosting high-leverage underdogs where public pick rate <code className="text-emerald-300 font-mono">q_i &lt;&lt; p_i</code>:
              </p>
              <div className="bg-[#0B0F17] p-3 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto">
                {'max ∑ [ k • z_{i,k} • ( (p_i - λ q_i)x_i + ((1-p_i) - λ(1-q_i))(1-x_i) ) ]'}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                &lambda; = consensus fade penalty factor (currently <span className="text-emerald-400 font-bold">{(sliderValue / 100 * 0.8).toFixed(2)}</span>).
              </p>
            </div>

            {/* Lane 2 */}
            <div className="bg-[#151D2A] border border-[#1E293B] rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-blue-400 uppercase">
                  Lane 2: Season Podium (Top 3)
                </span>
                <span className="px-2 py-0.5 text-[10px] bg-blue-950 border border-blue-800 text-blue-300 rounded font-mono">
                  Risk-Adjusted EV
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Maximizes expected point accumulation while capping game variance based on standing gap to the 3rd-place cutoff:
              </p>
              <div className="bg-[#0B0F17] p-3 rounded-xl font-mono text-xs text-blue-300 border border-slate-800 overflow-x-auto">
                {'max ∑ [ k • z_{i,k} • E[Points_i] ] - β ∑ [ k • σ_i² ]'}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                &beta; scales up as rank approaches 1st; drops to 0 if out of contention.
              </p>
            </div>
          </div>

          {/* VEGAS ODDS VS PUBLIC DIVERGENCE MATRIX */}
          <div className="bg-[#151D2A] border border-[#1E293B] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#1E293B] pb-4">
              <div>
                <h3 className="font-bold text-white text-base">
                  Vegas Odds vs Yahoo Public Divergence Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Live consensus spreads cross-referenced with crowd pick distributions to isolate edge.
                </p>
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                {['ALL', 'EXTREME VALUE', 'DEAD CHALK TRAP', 'LEVERAGE PIVOT', 'CHALK LOCK'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      activeFilter === filter
                        ? 'bg-emerald-500 text-black font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-slate-400 border-b border-[#1E293B] font-mono text-[11px] uppercase">
                  <tr>
                    <th className="py-3 px-2">Matchup</th>
                    <th className="py-3 px-3">Vegas Spread</th>
                    <th className="py-3 px-3">Vegas Win %</th>
                    <th className="py-3 px-3">Yahoo Pick %</th>
                    <th className="py-3 px-3">Recommended Pts</th>
                    <th className="py-3 px-3">Strategic Rating</th>
                    <th className="py-3 px-3">Engine Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B] font-mono text-xs">
                  {filteredPicks.map(pick => {
                    return (
                      <tr key={pick.gameId} className="hover:bg-slate-900/40 transition">
                        <td className="py-3 px-2 text-white font-bold font-sans">
                          {pick.matchup}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {pick.selectedTeamCode} {pick.selectedTeamCode === 'SEA' ? '+5.5' : pick.selectedTeamCode === 'LAC' ? '-4.5' : '-2.5'}
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-400">
                          {(pick.vegasWinProbability * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {(pick.publicPickRate * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 text-emerald-300 font-black text-sm">
                          {pick.confidencePoints} pts
                        </td>
                        <td className="py-3 px-3">
                          {getRatingBadge(pick.strategicRating)}
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-sans text-[11px] max-w-xs">
                          {pick.recommendation}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: DETERMINISTIC CLINCH ENGINE & MNF 2-BRANCH SOLVER */}
      {(activePortalSection === 'clinch' || activePortalSection === 'portfolio' || activePortalSection === 'audio') && (
        <div className="bg-[#151D2A] border border-[#1E293B] rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#1E293B] pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase">
                <Scale className="w-3.5 h-3.5" />
                <span>Section 4.0 • Deterministic Clinch Engine</span>
              </div>
              <h3 className="font-bold text-white text-base mt-1">
                Monday Night Football 2-Branch Decision Node for {activeTeam?.ownerName}
              </h3>
              <p className="text-xs text-slate-400">
                When remaining games R &le; 4, Monte Carlo simulations cease and exact game-tree permutations are mapped.
              </p>
            </div>
            <span className="text-xs text-amber-400 font-mono bg-amber-950/60 px-3 py-1 rounded-lg border border-amber-800 self-start sm:self-auto">
              Slate State: R = 1 (MNF: SF @ SEA)
            </span>
          </div>

          {/* 2-Branch Visual Grid with Dynamic calculations from optimizedPicks */}
          {(() => {
            const chaserName = activeTeam.ownerName;
            const leaderName = leaderTeam.ownerName || 'Dave';
            const leaderBasePts = 106;
            const leaderMnlPts = 12;
            const leaderBranchAPts = leaderBasePts + leaderMnlPts; // 118
            const leaderBranchBPts = leaderBasePts; // 106

            const chaserBasePts = 100;
            const dynamicMnfPts = mnfPick.confidencePoints;
            const chaserBranchAPts = chaserBasePts + dynamicMnfPts;
            const chaserBranchBPts = chaserBasePts + dynamicMnfPts;
            const marginOverLeaderInBranchB = chaserBranchBPts - leaderBranchBPts;

            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Branch A: SF 49ers Win */}
                  <div className="p-5 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white text-sm">Branch A: SF 49ers Win (Favorite)</span>
                      <span className="font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        Vegas {( (1 - mnfPick.vegasWinProbability) * 100 ).toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <span>• Leader {leaderName} picked SF ({leaderMnlPts} pts)</span>
                        <span className="text-white font-bold">&rarr; Final: {leaderBranchAPts} pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Chaser {chaserName} picked SF ({dynamicMnfPts} pts)</span>
                        <span className="text-white font-bold">&rarr; Final: {chaserBranchAPts} pts</span>
                      </div>
                      <div className="font-sans font-semibold pt-2 border-t border-slate-800">
                        {leaderBranchAPts === chaserBranchAPts ? (
                          <span className="text-amber-400">
                            Outcome: Dead Heat ({leaderBranchAPts} pts each). Per official league rules, there are NO tiebreakers &mdash; {leaderName} and {chaserName} split the 1st place prize evenly!
                          </span>
                        ) : leaderBranchAPts > chaserBranchAPts ? (
                          <span className="text-red-400">
                            Outcome: {leaderName} clinches 1st Place ({leaderBranchAPts} vs {chaserBranchAPts}). {chaserName} finishes 2nd ($0 weekly payout).
                          </span>
                        ) : (
                          <span className="text-emerald-400">
                            Outcome: {chaserName} clinches 1st Place ({chaserBranchAPts} vs {leaderBranchAPts}).
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Branch B: Seattle Seahawks Win */}
                  <div className="p-5 rounded-xl bg-[#0B0F17] border-2 border-emerald-600/80 glow-green space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white text-sm">Branch B: SEA Seahawks Win (Underdog Pivot)</span>
                      <span className="font-mono text-amber-400 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                        Vegas {(mnfPick.vegasWinProbability * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <span>• Leader {leaderName} loses (SF {leaderMnlPts} pts)</span>
                        <span className="text-white font-bold">&rarr; Final: {leaderBranchBPts} pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Chaser {chaserName} hits SEA ({dynamicMnfPts} pts)</span>
                        <span className="text-white font-bold">&rarr; Final: {chaserBranchBPts} pts</span>
                      </div>
                      <div className="font-sans font-bold pt-2 border-t border-slate-800">
                        {chaserBranchBPts === leaderBranchBPts ? (
                          <span className="text-amber-400">
                            Outcome: Dead Heat ({chaserBranchBPts} pts each). Per official league rules, there are NO tiebreakers &mdash; {chaserName} and {leaderName} split the 1st place prize evenly!
                          </span>
                        ) : chaserBranchBPts > leaderBranchBPts ? (
                          <span className="text-emerald-400">
                            Outcome: {chaserName} steals 1st Place by +{marginOverLeaderInBranchB} pts ({leaderBranchBPts} &rarr; {chaserBranchBPts})!
                          </span>
                        ) : (
                          <span className="text-red-400">
                            Outcome: {leaderName} holds 1st Place ({leaderBranchBPts} vs {chaserBranchBPts}).
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Automated Pivot Verdict Callout */}
                <div className="p-4 bg-amber-950/40 border border-amber-800/80 rounded-xl text-xs text-amber-200 leading-relaxed flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300 uppercase tracking-wide">Automated Pivot Verdict (Dynamic EV):</strong>{' '}
                    "Chaser {chaserName} has a 0% mathematical chance of 1st place if matching {leaderName} on San Francisco. With the current optimizer setting assigning{' '}
                    <strong className="text-emerald-400">{dynamicMnfPts} confidence points</strong> to Seattle, {chaserName} is formally advised to execute a{' '}
                    <strong className="text-white underline">Forced Underdog Pivot to Seattle</strong> to capture a {(mnfPick.vegasWinProbability * 100).toFixed(0)}% payout equity and surpass {leaderName} by {marginOverLeaderInBranchB} pts ({chaserBranchBPts} vs {leaderBranchBPts})."
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

    </div>
  );
};

