import React, { useState } from 'react';
import { useTeam } from '../context/TeamContext';
import {
  YAHOO_WEEK_GAMES,
  YAHOO_GROUP_PICKS_MATRIX,
  YAHOO_WEEK_1_GAMES,
  YAHOO_WEEK_2_GAMES,
  YAHOO_WEEK_3_GAMES,
  YAHOO_WEEK_1_PICKS_MATRIX,
  YAHOO_WEEK_2_PICKS_MATRIX,
  YAHOO_WEEK_3_PICKS_MATRIX,
} from '../data/mockData';
import {
  Trophy,
  AlertTriangle,
  Flame,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  Radio,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  BarChart3,
  Calendar,
  Lock,
  Mic,
  ArrowRight,
} from 'lucide-react';

interface EndOfDayRecapProps {
  onPlayRecapAudio?: () => void;
  onPostRecapToChat?: () => void;
}

export const EndOfDayRecap: React.FC<EndOfDayRecapProps> = ({
  onPlayRecapAudio,
  onPostRecapToChat,
}) => {
  const { teams, currentTeam, setActiveTab, currentWeek, setCurrentWeek } = useTeam();
  const [filterCategory, setFilterCategory] = useState<'all' | 'user' | 'leaders' | 'high_ceiling'>('all');
  const [selectedPickerId, setSelectedPickerId] = useState<string | null>(null);

  // Completed & pending games data based on selected week
  const completedGames = currentWeek === 3
    ? []
    : currentWeek === 2
    ? YAHOO_WEEK_2_GAMES
    : YAHOO_WEEK_1_GAMES.filter(g => g.status === 'final');
  const pendingGames = currentWeek === 3
    ? YAHOO_WEEK_3_GAMES
    : currentWeek === 2
    ? []
    : YAHOO_WEEK_1_GAMES.filter(g => g.status !== 'final');

  // Detailed picker scorecard analytics derived from the Initech Invitational
  const week1Pickers = [
    {
      teamId: 'team-orange',
      teamName: 'Orange crush',
      ownerName: 'Orange crush',
      rank: 1,
      points: 26,
      avatar: 'O',
      color: '#F97316',
      isCurrentUser: false,
      goodPicks: [
        { game: '#1 SEA vs NE', team: 'Sea', conf: 16, note: 'Pool-high 16 pts on Seattle chalk' },
        { game: '#2 LAR vs SF', team: 'SF', conf: 10, note: '🔥 SOLE SURVIVOR: Only manager in the entire 12-person pool to hit the SF upset!' },
      ],
      badPicks: [],
      netCarnage: '+10 pts vs pool average',
      maxRemaining: 136,
      lossTotal: 0,
      damageGrade: 'A+ (Pristine Sheet)',
      badge: '🎯 Sole Survivor (26 Pts)',
      badgeColor: 'bg-orange-950 text-orange-300 border-orange-500/50',
      outlook: 'Currently in the driver seat with a perfect 26/26 score. Holds the pool’s only untouched maximum possible ceiling of 136 points. As long as top Sunday anchors hold, Orange crush has the highest probability to finish Week 1 in first place.',
    },
    {
      teamId: 'team-shoeman',
      teamName: 'Shoeman',
      ownerName: 'Steve',
      rank: 12,
      points: 4,
      avatar: 'S',
      color: '#EC4899',
      isCurrentUser: false,
      goodPicks: [
        { game: '#1 SEA vs NE', team: 'Sea', conf: 4, note: 'Cautious 4-pt pick on Seattle' },
      ],
      badPicks: [
        { game: '#2 LAR vs SF', team: 'LAR', conf: 16, note: '💀 DEAD CHALK CASUALTY: Assigned maximum 16 confidence points to LAR, suffering the pool’s most catastrophic loss!' },
      ],
      netCarnage: '-16 pts off ceiling',
      maxRemaining: 120,
      lossTotal: 16,
      damageGrade: 'F (Maximum Carnage)',
      badge: '💀 16-Pt Anchor Torched',
      badgeColor: 'bg-red-950 text-red-300 border-red-500/50',
      outlook: 'CATASTROPHIC HIT: Losing your #1 16-point anchor in Game #2 is the mathematical worst-case scenario. Season ceiling immediately clipped down to 120 max points.',
    },
    {
      teamId: 'team-todd',
      teamName: 'CramItUp Your CramHole Lafleur',
      ownerName: 'Todd Reimer',
      rank: 8,
      points: 8,
      avatar: 'C',
      color: '#10B981',
      isCurrentUser: currentTeam.id === 'team-todd',
      goodPicks: [
        { game: '#1 SEA vs NE', team: 'Sea', conf: 8, note: 'Prudent 8-pt allocation on Seattle cashed cleanly' },
      ],
      badPicks: [
        { game: '#2 LAR vs SF', team: 'LAR', conf: 9, note: 'Absorbed 9-point loss on Rams, but successfully protected ALL top 7 anchors!' },
      ],
      netCarnage: 'Only -9 pts (Top 7 Anchors Live)',
      maxRemaining: 127,
      lossTotal: 9,
      damageGrade: 'A (Masterful Structure)',
      badge: '⚡ Sleeping Giant (127 Max)',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/50',
      outlook: 'THE SLEEPING GIANT: While the pool panics over current 8th place, Todd preserved his entire upper echelon! Untouched anchors: LAC (16), JAX (15), DET (14), PHI (13), BAL (12), PIT (11), CIN (10). As heavy favorites cash Sunday, Todd holds the strongest mathematical surge to take #1 overall.',
    },
    {
      teamId: 'team-broncos',
      teamName: 'BroncosCountry (PatN)',
      ownerName: 'PatN',
      rank: 9,
      points: 7,
      avatar: 'B',
      color: '#3B82F6',
      isCurrentUser: currentTeam.id === 'team-broncos',
      goodPicks: [
        { game: '#1 SEA vs NE', team: 'Sea', conf: 7, note: 'Cashed 7 pts on Seattle' },
      ],
      badPicks: [
        { game: '#2 LAR vs SF', team: 'LAR', conf: 1, note: '🛡️ DAMAGE CONTROL GENIUS: Assigned only 1 single point to LAR, dodging 95% of the league carnage!' },
      ],
      netCarnage: 'Only -1 pt lost!',
      maxRemaining: 135,
      lossTotal: 1,
      damageGrade: 'A+ (Damage Control)',
      badge: '🛡️ League-Best Ceiling (135)',
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-500/50',
      outlook: 'MASTERCLASS IN HEDGING: Dropped only a single point (1 pt) on the Rams upset! Holds the highest remaining maximum ceiling (135 pts) of any manager who picked the Rams.',
    },
  ];

  const week2Pickers = [
    {
      teamId: 'team-birdboss',
      teamName: 'Bird Boss',
      ownerName: 'Amy',
      rank: 1,
      points: 104,
      avatar: 'BB',
      color: '#F59E0B',
      isCurrentUser: currentTeam.id === 'team-birdboss',
      goodPicks: [
        { game: 'MIA vs SF', team: 'San Francisco 49ers', conf: 16, note: '🔥 MAXIMUM ANCHOR CASHED: 16 points in 35-13 blowout' },
        { game: 'LV vs LAC', team: 'Las Vegas Raiders', conf: 15, note: '👑 MASTERSTROKE: Only manager to stake 15 pts on the Raiders upset (26-14)!' },
        { game: 'IND vs KC', team: 'Kansas City Chiefs', conf: 11, note: 'Cashed 11 pts in SNF 33-30 OT thriller' },
      ],
      badPicks: [],
      netCarnage: '+104 pts (Week 2 Champion)',
      maxRemaining: 104,
      lossTotal: 32,
      damageGrade: 'A+ (Champion Payout)',
      badge: '🏆 Week 2 Champion (104 Pts)',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-500/50',
      outlook: 'CHAMPIONSHIP PERFORMANCE: Amy captured sole 1st place in Week 2 with 104 points and claimed the entire $25.00 weekly prize. Her bold 15-point confidence anchor on the underdog Las Vegas Raiders over the Chargers separated her from the field.',
    },
    {
      teamId: 'team-shoeman',
      teamName: 'Shoeman',
      ownerName: 'Steve',
      rank: 2,
      points: 99,
      avatar: 'SH',
      color: '#EC4899',
      isCurrentUser: currentTeam.id === 'team-shoeman',
      goodPicks: [
        { game: 'BUF vs DET', team: 'Buffalo Bills', conf: 16, note: 'Cashed 16-pt top anchor on Thursday Night Football (41-31)' },
        { game: 'MIA vs SF', team: 'San Francisco 49ers', conf: 15, note: 'Cashed 15-pt core anchor in 35-13 rout' },
        { game: 'ARI vs SEA', team: 'Seattle Seahawks', conf: 12, note: 'Banked 12 pts in 31-7 blowout' },
      ],
      badPicks: [],
      netCarnage: '+99 pts (Podium Finish)',
      maxRemaining: 99,
      lossTotal: 37,
      damageGrade: 'A (Runner-Up)',
      badge: '🥈 2nd Place (99 Pts)',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/50',
      outlook: 'RUNNER-UP FINISH: Steve had a stellar week with 99 points, nailing his top two anchors on Buffalo [16] and San Francisco [15]. Finished just 5 points shy of the title.',
    },
    {
      teamId: 'team-broncos',
      teamName: 'BroncosCountry (PatN)',
      ownerName: 'Patrick',
      rank: 3,
      points: 96,
      avatar: 'BC',
      color: '#3B82F6',
      isCurrentUser: currentTeam.id === 'team-broncos',
      goodPicks: [
        { game: 'MIA vs SF', team: 'San Francisco 49ers', conf: 16, note: 'Cashed 16 pts on San Francisco' },
        { game: 'CIN vs HOU', team: 'Cincinnati Bengals', conf: 3, note: 'Underdog road cash in 20-6 victory' },
      ],
      badPicks: [],
      netCarnage: '+96 pts (Top 3 Finish)',
      maxRemaining: 96,
      lossTotal: 40,
      damageGrade: 'A- (Bronze Finish)',
      badge: '🥉 3rd Place (96 Pts)',
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-500/50',
      outlook: 'BRONZE FINISH: Patrick locked in 96 points for 3rd place, capitalizing on SF (16) and a sharp 3-point road swing on Cincinnati.',
    },
    {
      teamId: 'team-todd',
      teamName: 'CramItUp Your CramHole Lafleur',
      ownerName: 'Todd Reimer',
      rank: 12,
      points: 69,
      avatar: 'TR',
      color: '#10B981',
      isCurrentUser: currentTeam.id === 'team-todd',
      goodPicks: [
        { game: 'MIA vs SF', team: 'San Francisco 49ers', conf: 16, note: 'Cashed #1 16-point anchor in 35-13 blowout' },
        { game: 'NYG vs LAR', team: 'Los Angeles Rams', conf: 13, note: 'Banked 13 points on MNF 28-6 victory' },
        { game: 'TEN vs PHI', team: 'Philadelphia Eagles', conf: 12, note: 'Cashed 12 points in 24-20 battle' },
        { game: 'IND vs KC', team: 'Kansas City Chiefs', conf: 11, note: 'Banked 11 points in SNF overtime thriller' },
      ],
      badPicks: [
        { game: 'CLE vs TB', team: 'Tampa Bay Buccaneers', conf: 15, note: 'Heavy upset: Browns stun Bucs 23-19 (-15 pts)' },
        { game: 'NO vs BAL', team: 'Baltimore Ravens', conf: 14, note: 'Pool shocker: Saints upset Lamar Jackson 24-17 (-14 pts)' },
      ],
      netCarnage: '-67 pts (Heavy Upsets Absorbed)',
      maxRemaining: 69,
      lossTotal: 67,
      damageGrade: 'B- (Protected Top Anchor)',
      badge: '🛡️ 69 Pts (SF 16 Cashed)',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/50',
      outlook: 'TOUGH WEEK 2 SLATE: Todd weathered brutal league-wide upsets (Browns over Bucs, Saints over Ravens), but protected his top 16-point anchor on San Francisco, and cashed his late 13, 12, and 11 point allocations to finish with 69 points.',
    },
  ];

  const week3Pickers = [
    {
      teamId: 'team-birdboss',
      teamName: 'Bird Boss',
      ownerName: 'Amy',
      rank: 1,
      points: 196,
      avatar: 'BB',
      color: '#F59E0B',
      isCurrentUser: currentTeam.id === 'team-birdboss',
      goodPicks: [
        { game: 'Week 2 Champion', team: 'Las Vegas Raiders', conf: 15, note: '🏆 WEEK 2 PURSE WINNER: Claimed $25.00 first-place prize with 104 points' },
        { game: '#2 BUF vs LAC', team: 'Buffalo Bills', conf: 16, note: 'Week 3 Top Anchor: Locked 16 pts on BUF chalk (-7.0)' },
        { game: '#6 KC vs MIA', team: 'Kansas City Chiefs', conf: 15, note: 'Core Anchor: 15 pts on KC (-11.5)' },
        { game: '#1 GB vs ATL', team: 'Green Bay Packers', conf: 14, note: 'TNF Anchor: 14 pts on Packers (-6.0) at Lambeau' },
      ],
      badPicks: [],
      netCarnage: '196 pts (Season 1st Place)',
      maxRemaining: 136,
      lossTotal: 0,
      damageGrade: 'A+ (Leader In The Clubhouse)',
      badge: '👑 Season Leader (196 Pts)',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-500/50',
      outlook: 'CURRENT SEASON LEADER: Amy holds sole possession of 1st place overall with 196 season points following her dominant Week 2 championship. Her Week 3 card leans heavily on consensus chalk anchors (BUF [16], KC [15], GB [14]) to protect her lead.',
    },
    {
      teamId: 'team-shoeman',
      teamName: 'Shoeman',
      ownerName: 'Steve',
      rank: 2,
      points: 188,
      avatar: 'SH',
      color: '#EC4899',
      isCurrentUser: currentTeam.id === 'team-shoeman',
      goodPicks: [
        { game: 'Week 2 Runner-Up', team: 'Buffalo Bills', conf: 16, note: '🥈 WEEK 2 PODIUM: Finished 2nd with 99 pts, just 5 pts back' },
        { game: '#6 KC vs MIA', team: 'Kansas City Chiefs', conf: 16, note: 'Week 3 Top Anchor: 16 pts on Kansas City (-11.5)' },
        { game: '#1 GB vs ATL', team: 'Green Bay Packers', conf: 15, note: 'TNF Hammer: 15 pts on Green Bay (-6.0)' },
      ],
      badPicks: [],
      netCarnage: '188 pts (8 pts back of 1st)',
      maxRemaining: 136,
      lossTotal: 0,
      damageGrade: 'A (Top Contender)',
      badge: '🥈 Season 2nd (188 Pts)',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/50',
      outlook: 'CHASING THE TITLE: Steve has put together back-to-back strong weeks and sits only 8 points behind Amy. His Week 3 card features heavy stakes on Kansas City [16] and Green Bay [15] with a differential play on Dallas [11] vs Baltimore.',
    },
    {
      teamId: 'team-snap',
      teamName: 'Snap Judgments',
      ownerName: 'Mark',
      rank: 3,
      points: 184,
      avatar: 'SJ',
      color: '#10B981',
      isCurrentUser: currentTeam.id === 'team-snap',
      goodPicks: [
        { game: '#11 SF vs ARI', team: 'San Francisco 49ers', conf: 16, note: 'Week 3 Top Anchor: 16 pts on SF (-8.5) at home' },
        { game: '#6 KC vs MIA', team: 'Kansas City Chiefs', conf: 15, note: 'Core Anchor: 15 pts on KC (-11.5)' },
      ],
      badPicks: [],
      netCarnage: '184 pts (12 pts back)',
      maxRemaining: 136,
      lossTotal: 0,
      damageGrade: 'A (Consistent Pace)',
      badge: '🥉 Season 3rd (184 Pts)',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/50',
      outlook: 'CONSISTENCY MACHINE: Mark ranks 3rd overall with 184 points. Avoiding catastrophic losses has been his trademark. He holds a full 136-point ceiling heading into Week 3.',
    },
    {
      teamId: 'team-bijan',
      teamName: 'Bed Bath & Bijan',
      ownerName: 'Dalton',
      rank: 4,
      points: 181,
      avatar: 'BB',
      color: '#06B6D4',
      isCurrentUser: currentTeam.id === 'team-bijan',
      goodPicks: [
        { game: 'Week 1 Co-Champion', team: 'Seattle Seahawks', conf: 16, note: 'Week 1 Title: Split $25 purse at 102 pts' },
        { game: '#6 KC vs MIA', team: 'Kansas City Chiefs', conf: 16, note: 'Week 3 16-pt Anchor: KC (-11.5)' },
      ],
      badPicks: [],
      netCarnage: '181 pts (15 pts back)',
      maxRemaining: 136,
      lossTotal: 0,
      damageGrade: 'A- (In The Hunt)',
      badge: '⚡ Week 1 Co-Champ (181 Pts)',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-500/50',
      outlook: 'FORMER CO-CHAMP: Dalton split the purse in Week 1 and remains right in the title hunt. Taking Baltimore [10 pts] at Dallas as his key leverage swing play.',
    },
    {
      teamId: 'team-broncos',
      teamName: 'BroncosCountry (PatN)',
      ownerName: 'Patrick',
      rank: 5,
      points: 178,
      avatar: 'BC',
      color: '#3B82F6',
      isCurrentUser: currentTeam.id === 'team-broncos',
      goodPicks: [
        { game: 'Week 2 3rd Place', team: 'San Francisco 49ers', conf: 16, note: 'Week 2 Bronze: Cashed 96 pts' },
        { game: '#2 BUF vs LAC', team: 'Buffalo Bills', conf: 16, note: 'Week 3 Top Anchor: 16 pts on Bills (-7.0)' },
      ],
      badPicks: [],
      netCarnage: '178 pts (18 pts back)',
      maxRemaining: 136,
      lossTotal: 0,
      damageGrade: 'B+ (Steady Climb)',
      badge: '🛡️ Season 5th (178 Pts)',
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-500/50',
      outlook: 'SOLID DEFENSIVE CARD: Patrick sits in 5th place. Known for risk mitigation, his card maximizes chalk equity while taking modest leverage on mid-tier matchups.',
    },
    {
      teamId: 'team-todd',
      teamName: 'CramItUp Your CramHole Lafleur',
      ownerName: 'Todd Reimer',
      rank: 9,
      points: 166,
      avatar: 'TR',
      color: '#10B981',
      isCurrentUser: currentTeam.id === 'team-todd',
      goodPicks: [
        { game: 'Week 2 Top Anchor Cashed', team: 'San Francisco 49ers', conf: 16, note: 'Protected #1 anchor in Week 2 blowout' },
        { game: '#2 BUF vs LAC', team: 'Buffalo Bills', conf: 16, note: 'Week 3 Top Anchor: 16 pts locked on BUF (-7.0)' },
        { game: '#6 KC vs MIA', team: 'Kansas City Chiefs', conf: 15, note: 'Consensus Hammer: 15 pts on KC (-11.5)' },
        { game: '#1 GB vs ATL', team: 'Green Bay Packers', conf: 14, note: 'TNF Hammer: 14 pts on Packers at Lambeau' },
      ],
      badPicks: [],
      netCarnage: '166 pts (136 Max Week 3 Ceiling)',
      maxRemaining: 136,
      lossTotal: 0,
      damageGrade: 'A (High Recovery Ceiling)',
      badge: '🚀 136 Max Runway (Week 3)',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/50',
      outlook: 'PRIME BOUNCEBACK CANDIDATE: Todd weathered Week 2 upset storms to preserve season solvency (166 pts). For Week 3, his slate is perfectly structured: top anchors BUF [16], KC [15], GB [14], DET [13], and SF [12] offer a combined 70 points of elite chalk, while Baltimore [9] provides asymmetric leverage to make up ground on Amy and Steve!',
    },
  ];

  const pickersAnalysis = currentWeek === 3 ? week3Pickers : currentWeek === 2 ? week2Pickers : week1Pickers;

  // Filtered list of pickers
  const filteredPickers = pickersAnalysis.filter(p => {
    if (filterCategory === 'user') return p.isCurrentUser;
    if (filterCategory === 'leaders') return p.rank <= 3;
    if (filterCategory === 'high_ceiling') return p.maxRemaining >= 127;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#121A28] via-[#0E1522] to-[#0A0E17] border border-[#1E293B] p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>Week {currentWeek} End-of-Day Gridiron Recap & Outlook</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                {currentWeek === 3
                  ? 'WEEK 3 ACTIVE SLATE • 16 MATCHUPS LOADED'
                  : currentWeek === 2
                  ? 'ALL 16 OF 16 FINAL • OFFICIAL RESULTS'
                  : '2 OF 16 FINAL'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5">
              <span>
                {currentWeek === 3
                  ? 'Week 3 Strategy Matrix: The Chase for Bird Boss (196 Pts)'
                  : currentWeek === 2
                  ? 'Week 2 Championship Wrap: Bird Boss Takes Title (104 Pts)'
                  : 'The SoFi Upset Bloodbath & Week 1 Trajectory'}
              </span>
              <span className="text-xl">{currentWeek === 3 ? '⚡' : currentWeek === 2 ? '🏆' : '🏈'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {currentWeek === 3
                ? 'Week 2 is official: Amy (Bird Boss) claimed 1st place ($25 purse, 104 pts). Week 3 card is live with 16 matchups: Green Bay vs Atlanta TNF, consensus anchors KC & BUF, and the BAL @ DAL swing battle!'
                : currentWeek === 2
                ? 'Official final recap of all 16 games: Amy (Bird Boss) wins the $25 purse with 104 points, Steve (Shoeman) captures 2nd with 99 pts, and Todd finishes with 69 pts.'
                : 'Recap of the 2 settled games, picker-by-picker carnage analysis (good vs bad picks), and mathematical outlook for the remaining 14 games of Week 1.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('strategist')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 text-slate-950 font-black text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-slate-950" />
              <span>Go to My Strategy Portal ({currentTeam.ownerName})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {onPlayRecapAudio && (
              <button
                onClick={onPlayRecapAudio}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-purple-700 hover:from-orange-500 hover:to-purple-600 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-orange-950/40 cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>Listen to Full Show Recap 🎙️</span>
              </button>
            )}

            {onPostRecapToChat && (
              <button
                onClick={onPostRecapToChat}
                className="px-3.5 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer font-mono"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Drop Commish Recap to Chat 🤖</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Fast-Stat Impact Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900/70 border border-amber-900/40 space-y-1">
            <span className="text-amber-300 text-[11px]">
              {currentWeek === 3 ? 'Week 2 Champion' : currentWeek === 2 ? 'Week 2 Champion' : 'Seattle Chalk Hit Rate'}
            </span>
            <div className="text-base font-black text-amber-400 flex items-center gap-1.5">
              <span>{currentWeek >= 2 ? 'Amy • 104 Pts' : '12 / 12 (100%)'}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-[10px] text-slate-500">
              {currentWeek >= 2 ? '$25.00 Purse Awarded' : '116 total points collected'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-cyan-900/40 space-y-1">
            <span className="text-cyan-300 text-[11px]">
              {currentWeek === 3 ? 'Season Leader' : currentWeek === 2 ? 'Week 2 Runner-Up' : 'Rams Carnage Vaporized'}
            </span>
            <div className="text-base font-black text-cyan-400 flex items-center gap-1.5">
              <span>{currentWeek === 3 ? 'Bird Boss • 196 Pts' : currentWeek === 2 ? 'Shoeman • 99 Pts' : '114 Points Lost'}</span>
              {currentWeek >= 2 ? <TrendingUp className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            </div>
            <span className="text-[10px] text-slate-500">
              {currentWeek === 3 ? 'Holds 8-pt lead over Shoeman' : currentWeek === 2 ? 'Finished 5 pts back' : '11 of 12 managers burned'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-blue-900/40 space-y-1">
            <span className="text-blue-300 text-[11px]">
              {currentWeek === 3 ? 'Week 3 Apex Anchor' : currentWeek === 2 ? 'Week 2 3rd Place' : 'Current Pool Leader'}
            </span>
            <div className="text-base font-black text-blue-400 truncate">
              {currentWeek === 3 ? 'KC -11.5 vs MIA' : currentWeek === 2 ? 'BroncosCountry (96 pts)' : 'Orange crush (26 pts)'}
            </div>
            <span className="text-[10px] text-slate-500">
              {currentWeek === 3 ? '10 of 12 managers 15+ pts' : currentWeek === 2 ? 'Hit SF (16) & CIN (3)' : 'Hit SF Upset (+10 pts)'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-emerald-900/40 space-y-1">
            <span className="text-emerald-300 text-[11px]">
              {currentWeek === 3 ? "Todd's Upside Ceiling" : currentWeek === 2 ? 'Todd Reimer Finish' : "Todd's Max Ceiling"}
            </span>
            <div className="text-base font-black text-emerald-400">
              {currentWeek === 3 ? '136 Points' : currentWeek === 2 ? '69 Points Final' : '127 Points'}
            </div>
            <span className="text-[10px] text-slate-500">
              {currentWeek === 3 ? 'All 16 anchors live on Week 3' : currentWeek === 2 ? 'SF #16 + LAR #13 Cashed' : 'Top 7 anchors 100% intact'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: COMPLETED GAMES SCORECARD */}
      <div className="bg-[#151D2A] border border-[#1E293B] rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm uppercase tracking-wider font-mono">
              1. {currentWeek === 3 ? 'Week 2 Official Wrap & Week 3 Kickoff' : `Completed Game Results & Pool Consequences (Week ${currentWeek})`}
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {currentWeek === 3
              ? 'Week 2 Official Final • Week 3 Kickoffs Thursday 8:15 PM'
              : currentWeek === 2
              ? 'All 16 Games Settled • Official Final Standings'
              : 'Scores finalized • Week 1 Early Slate'}
          </span>
        </div>

        {currentWeek === 3 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Week 2 Settlement Card */}
            <div className="rounded-xl bg-[#0B0F17] border border-amber-500/30 p-4 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  WEEK 2 OFFICIAL FINAL • PURSE PAID
                </span>
                <span className="text-xs font-mono text-slate-400">All 16 Games Settled</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="text-lg font-black text-white flex items-center gap-2">
                    <span className="text-amber-400">Bird Boss (Amy)</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono font-bold border border-amber-500/40">CHAMPION</span>
                  </div>
                  <div className="text-xs text-slate-400">Shoeman (99 pts) • BroncosCountry (96 pts)</div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xl font-black text-amber-400">104 PTS</span>
                  <div className="text-[10px] text-emerald-400 font-bold">$25.00 Purse Awarded</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-900/40 text-xs text-amber-200 flex items-start gap-2">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Championship Decider:</span> Amy's 15-pt confidence hammer on the Las Vegas Raiders upset over the Chargers (26-14) clinched 1st place! Todd finished with 69 pts, cashed his 16-pt SF anchor, and reset the board for Week 3.
                </div>
              </div>
            </div>

            {/* Week 3 TNF Spotlight */}
            <div className="rounded-xl bg-[#0B0F17] border border-emerald-500/30 p-4 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  WEEK 3 OPENER • THURSDAY NIGHT FOOTBALL
                </span>
                <span className="text-xs font-mono text-slate-400">Locks Thursday 8:15 PM ET</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="text-lg font-black text-white flex items-center gap-2">
                    <span className="text-emerald-400">Green Bay Packers</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold border border-emerald-500/40">FAVORED -6.0</span>
                  </div>
                  <div className="text-xs text-slate-400">vs Atlanta Falcons @ Lambeau Field</div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xl font-black text-emerald-400">GB -6.0</span>
                  <div className="text-[10px] text-slate-400">11 of 12 Locked GB</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-xs text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Universal Opening Anchor:</span> Todd loaded 14 points onto Jordan Love and Green Bay at Lambeau. A Packers win unlocks an immediate 14-point base heading into Sunday!
                </div>
              </div>
            </div>
          </div>
        ) : currentWeek === 2 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Game 1: 49ers vs Dolphins */}
            <div className="rounded-xl bg-[#0B0F17] border border-emerald-500/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SUNDAY • UNIVERSAL 16-PT ANCHOR
                </span>
                <span className="text-xs font-mono text-slate-400">San Francisco -8.5</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="text-lg font-black text-white flex items-center gap-2">
                    <span className="text-emerald-400">San Francisco 49ers</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">WINNER</span>
                  </div>
                  <div className="text-xs text-slate-400">vs Miami Dolphins</div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xl font-black text-emerald-400">SF 35 - MIA 13</span>
                  <div className="text-[10px] text-slate-400">Universal Chalk Hit</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-xs text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Heavy Anchors Cashed:</span> Todd (16), Amy (16), Patrick (16), and Gail (16) all locked in max 16 points as the 49ers rolled at Levi’s Stadium.
                </div>
              </div>
            </div>

            {/* Game 2: Raiders vs Chargers - The Championship-Deciding Upset */}
            <div className="rounded-xl bg-[#0B0F17] border border-amber-500/30 p-4 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  DECISIVE UPSET • CHAMPION MAKER
                </span>
                <span className="text-xs font-mono text-slate-400">LV +3.5 vs LAC -3.5</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="text-lg font-black text-white flex items-center gap-2">
                    <span className="text-amber-400">Las Vegas Raiders</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">UPSET</span>
                  </div>
                  <div className="text-xs text-slate-400">vs Los Angeles Chargers</div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xl font-black text-amber-400">LV 26 - LAC 14</span>
                  <div className="text-[10px] text-slate-400">Division Ambush</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-900/40 text-xs text-amber-200 flex items-start gap-2">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Amy's Winning Masterstroke:</span> Bird Boss was the only manager with a 15-point stake on Las Vegas, swinging the entire week and clinching the $25 purse at 104 pts!
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Game 1: Seattle vs Patriots */}
            <div className="rounded-xl bg-[#0B0F17] border border-emerald-500/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  GAME #1 • FINAL (CHALK WIN)
                </span>
                <span className="text-xs font-mono text-slate-400">Seattle -3.5 vs NE +3.5</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="text-lg font-black text-white flex items-center gap-2">
                    <span className="text-emerald-400">Seattle Seahawks</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">WINNER</span>
                  </div>
                  <div className="text-xs text-slate-400">vs New England Patriots</div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xl font-black text-emerald-400">SEA WIN</span>
                  <div className="text-[10px] text-slate-400">Final Score: 26 - 20</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-xs text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">100% League Consensus:</span> All 12 pool members correctly picked Seattle!
                  Confidence allocated ranged from <span className="font-bold">4 pts</span> (Limps, Sacks) up to <span className="font-bold">16 pts</span> (Orange crush). Todd safely cashed 8 points.
                </div>
              </div>
            </div>

            {/* Game 2: LA Rams vs SF 49ers */}
            <div className="rounded-xl bg-[#0B0F17] border border-red-500/40 p-4 space-y-3 shadow-lg shadow-red-950/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                  GAME #2 • FINAL (MAJOR UPSET)
                </span>
                <span className="text-xs font-mono text-slate-400">LAR -3.5 vs SF +3.5</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="text-lg font-black text-white flex items-center gap-2">
                    <span className="text-amber-400">San Francisco 49ers</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">UPSET WINNER</span>
                  </div>
                  <div className="text-xs text-slate-400">def. Los Angeles Rams (Favored -3.5)</div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xl font-black text-amber-400">SF 17 - LAR 13</span>
                  <div className="text-[10px] text-red-400 font-bold">CARNAGE AT SOFI</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-900/40 text-xs text-red-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">11 of 12 Pickers Vaporized:</span> Only <span className="font-bold text-orange-400">Orange crush</span> picked SF (+10 pts)! All other 11 managers suffered heavy losses on LAR, led by <span className="font-bold text-red-300">Shoeman's 16-point anchor disaster</span>.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 1.5: CONFIDENTIAL LOCKER ROOM CALLOUT BANNER */}
      <div className="bg-gradient-to-r from-[#151D2A] via-purple-950/30 to-[#151D2A] border border-purple-800/40 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-950/80 border border-purple-600/60 flex items-center justify-center text-xl shrink-0 shadow-lg shadow-purple-950/60">
            🔒
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-white">
                Confidential Manager Strategy & Audio Briefings
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 border border-purple-700 text-purple-300 font-mono font-bold">
                Private Portal
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Personal audio recaps and upcoming game-by-game leverage recommendations are confidential to each manager. Access your secure locker room in <strong>The Strategist</strong> to review your portfolio strategy for <strong>{currentTeam.ownerName}</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('strategist')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-110 text-slate-950 font-black text-xs transition shrink-0 flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
        >
          <span>Open My Strategy Portal ({currentTeam.ownerName})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* SECTION 2: THE PICKER'S REPORT CARD (GOOD PICKS VS BAD PICKS) */}
      <div className="bg-[#151D2A] border border-[#1E293B] rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#1E293B] pb-3">
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider font-mono flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>2. Picker's Current Good & Bad Picks Report Card</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Individual breakdown of confidence hits, anchor burns, and mathematical damage for all 12 league managers.
            </p>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1 rounded-lg transition ${
                filterCategory === 'all'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All 12 Pickers
            </button>
            <button
              onClick={() => setFilterCategory('user')}
              className={`px-3 py-1 rounded-lg transition ${
                filterCategory === 'user'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Todd (You)
            </button>
            <button
              onClick={() => setFilterCategory('leaders')}
              className={`px-3 py-1 rounded-lg transition ${
                filterCategory === 'leaders'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Top 3 Leaders
            </button>
            <button
              onClick={() => setFilterCategory('high_ceiling')}
              className={`px-3 py-1 rounded-lg transition ${
                filterCategory === 'high_ceiling'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              High Ceilings (&ge;127)
            </button>
          </div>
        </div>

        {/* Picker Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPickers.map(p => {
            const isUser = p.isCurrentUser;
            const isSelected = selectedPickerId === p.teamId;

            return (
              <div
                key={p.teamId}
                onClick={() => setSelectedPickerId(isSelected ? null : p.teamId)}
                className={`rounded-xl border p-4 transition-all duration-200 space-y-3 cursor-pointer ${
                  isUser
                    ? 'bg-[#132225] border-emerald-500/70 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/40'
                    : isSelected
                    ? 'bg-slate-900 border-purple-500/70 ring-1 ring-purple-500/50'
                    : 'bg-[#0B0F17] border-[#1E293B] hover:border-slate-700'
                }`}
              >
                {/* Header Row: Rank, Avatar, Team Name, Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-black shrink-0 shadow font-mono"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          #{p.rank}. {p.teamName}
                        </span>
                        {isUser && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[9px] font-mono font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        Owner: {p.ownerName}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black font-mono text-white">
                      {p.points} <span className="text-xs text-slate-400 font-normal">pts</span>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold inline-block mt-0.5 ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </div>
                </div>

                {/* Good Picks & Bad Picks Breakdown Pills */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  {/* Good Picks */}
                  <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-900/40 space-y-1">
                    <div className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Good Picks ({p.goodPicks.length})</span>
                    </div>
                    {p.goodPicks.map((g, idx) => (
                      <div key={idx} className="text-slate-300 text-[11px] leading-tight">
                        <span className="text-white font-bold">{g.team}</span> ({g.conf} pts)
                        <div className="text-[10px] text-emerald-400/80 font-sans italic">{g.note}</div>
                      </div>
                    ))}
                  </div>

                  {/* Bad Picks */}
                  <div className={`p-2 rounded-lg border space-y-1 ${
                    p.badPicks.length === 0
                      ? 'bg-slate-900/40 border-slate-800'
                      : 'bg-red-950/30 border-red-900/40'
                  }`}>
                    <div className={`font-bold flex items-center gap-1 text-[11px] ${
                      p.badPicks.length === 0 ? 'text-slate-400' : 'text-red-400'
                    }`}>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Bad Picks ({p.badPicks.length})</span>
                    </div>
                    {p.badPicks.length === 0 ? (
                      <div className="text-slate-500 text-[11px] italic">None (Flawless slate)</div>
                    ) : (
                      p.badPicks.map((b, idx) => (
                        <div key={idx} className="text-slate-300 text-[11px] leading-tight">
                          <span className="text-red-300 font-bold">{b.team}</span> ({b.conf} pts lost)
                          <div className="text-[10px] text-red-400/80 font-sans italic">{b.note}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Mathematical Stat Strip */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div>
                    <span>Max Possible: </span>
                    <span className="font-bold text-white">{p.maxRemaining} pts</span>
                  </div>
                  <div>
                    <span>Vaporized: </span>
                    <span className={p.lossTotal > 10 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                      -{p.lossTotal} pts
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Grade: </span>
                    <span className="font-bold text-amber-300">{p.damageGrade}</span>
                  </div>
                </div>

                {/* Outlook Narrative */}
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                  <span className="font-bold font-mono text-[10px] text-amber-400 uppercase mr-1">
                    Week {currentWeek} Outlook:
                  </span>
                  {p.outlook}
                </div>

                {/* Confidential Strategy Link or Restricted Notice */}
                {p.isCurrentUser ? (
                  <button
                    type="button"
                    id={`btn-my-strategy-${p.teamId}`}
                    onClick={() => setActiveTab('strategist')}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-950/70 via-teal-950/50 to-slate-900 hover:from-emerald-900/80 hover:to-teal-900/70 border border-emerald-500/50 text-emerald-300 hover:text-emerald-200 text-xs font-bold font-mono transition shadow cursor-pointer w-full"
                  >
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Open My Private Strategy Portal 🎙️</span>
                    <ArrowRight className="w-3 h-3 text-emerald-400" />
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-900/70 border border-slate-800/80 text-[11px] font-mono text-slate-500">
                    <Lock className="w-3 h-3 text-slate-600" />
                    <span>Confidential Strategy Briefing • Owner Only</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: STRATEGIC OUTLOOK FOR THE REST OF THE WEEK */}
      <div className="bg-[#151D2A] border border-[#1E293B] rounded-2xl p-5 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#1E293B] pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm uppercase tracking-wider font-mono">
              3. Strategic Outlook {currentWeek === 3 ? 'for Week 3 (16 Matchups Loaded)' : currentWeek === 2 ? 'for Week 2 Post-Mortem' : 'for the Rest of Week 1 (14 Games Pending)'}
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {currentWeek === 3 ? 'Locks Thursday 8:15 PM ET (TNF) & Sunday 1:00 PM ET' : currentWeek === 2 ? 'All 16 Games Settled' : 'Kickoffs starting Sunday 1:00 PM ET'}
          </span>
        </div>

        {/* Narrative Strategic Summary Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-emerald-950/40 border border-purple-800/50 space-y-2">
          <div className="flex items-center gap-2 text-white font-bold text-xs">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Why Todd Reimer ("CramItUp Your CramHole Lafleur") Holds the Premier Recovery Path:</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {currentWeek === 3
              ? "Heading into Week 3, Todd holds a pristine 136-point maximum upside. He stacked 58 confidence points on top consensus heavy chalk (BUF, KC, GB, DET), while leveraging Baltimore [9 pts] as a high-EV swing play at Dallas:"
              : currentWeek === 2
              ? "Despite absorbing brutal league-wide shockers on Cleveland and New Orleans, Todd protected his #1 16-point anchor on San Francisco (35-13) and rallied on Monday Night Football to bank 69 points:"
              : "Although Todd sits in 8th place (8 pts) right now, his pick structure is mathematically optimal. He assigned his lower-tier 8 and 9 points to the tricky opening games, leaving his top 7 highest confidence anchors 100% untouched:"}
          </p>
          <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
            {currentWeek === 3 ? (
              <>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold">
                  ⚡ Game 2: BUF (-7.0) vs LAC [16 pts]
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold">
                  ⚡ Game 6: KC (-11.5) vs MIA [15 pts]
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold">
                  ⚡ Game 1: GB (-6.0) vs ATL [14 pts]
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold">
                  ⚡ Game 4: DET (-6.5) vs NYJ [13 pts]
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold">
                  ⚡ Game 11: SF (-8.5) vs ARI [12 pts]
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold">
                  ⚡ Game 9: SEA (-7.0) vs WSH [11 pts]
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold">
                  ⚡ Game 13: BAL (-3.0) @ DAL [9 pts - Leverage Swing]
                </span>
              </>
            ) : currentWeek === 2 ? (
              <>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold">
                  ✅ Game 14: SF (-8.5) vs MIA [16 pts] - Cashed 35-13
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold">
                  ✅ Game 16: LAR (-3.5) @ NYG [13 pts] - Cashed 28-6
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold">
                  ✅ Game 4: PHI (-4.5) vs TEN [12 pts] - Cashed 24-20
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold">
                  ✅ Game 15: KC (-6.5) @ IND [11 pts] - Cashed 33-30 OT
                </span>
              </>
            ) : (
              <>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold">
                  ⚡ Game 14: LAC (-10) vs ARI [16 pts]
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold">
                  ⚡ Game 9: JAX (-8.5) vs CLE [15 pts]
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold">
                  ⚡ Game 4: DET (-7.0) vs NO [14 pts]
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold">
                  ⚡ Game 13: PHI (-5.0) vs WAS [13 pts]
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold">
                  ⚡ Game 6: BAL (-3.5) vs IND [12 pts]
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold">
                  ⚡ Game 7: PIT (-3.5) vs ATL [11 pts]
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold">
                  ⚡ Game 3: CIN (-3.5) vs TB [10 pts]
                </span>
              </>
            )}
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            {currentWeek === 3 ? (
              <span>
                <span className="text-amber-300 font-bold">136 Points Available</span>: Todd's heavy concentration on Buffalo, Kansas City, and Green Bay sets up an ideal foundation to gain on Amy and Steve.
              </span>
            ) : currentWeek === 2 ? (
              <span>
                <span className="text-amber-300 font-bold">69 Points Locked</span>: Survived the carnage and secured official top-anchor solvency.
              </span>
            ) : (
              <span>
                <span className="text-amber-300 font-bold">91 Confidence Points</span> are loaded directly onto the 7 heaviest favorites of the week.
              </span>
            )}
          </p>
        </div>

        {/* 14 Remaining Games Preview Matrix */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-slate-400 font-bold uppercase flex items-center justify-between">
            <span>
              {currentWeek === 3
                ? 'All 16 Week 3 Matchups (Thursday & Sunday Slate)'
                : currentWeek === 2
                ? 'All 16 Games Settled'
                : 'Remaining 14 Matchups (Opponent Picks Locked until Kickoff)'}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <Lock className="w-3 h-3" />
              <span>Yahoo Anti-Cheat Lock Active</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 font-mono text-xs">
            {pendingGames.map(g => {
              // Check Todd's pick for this game
              const matrix = currentWeek === 3 ? YAHOO_WEEK_3_PICKS_MATRIX : currentWeek === 2 ? YAHOO_WEEK_2_PICKS_MATRIX : YAHOO_WEEK_1_PICKS_MATRIX;
              const toddRow = matrix.find(r => r.isCurrentUser);
              const toddPick = toddRow?.picks[g.id];
              const isHeavyFav = g.spread >= 5.0;

              return (
                <div
                  key={g.id}
                  className={`p-3 rounded-xl border transition ${
                    isHeavyFav
                      ? 'bg-[#15222D] border-blue-500/50 shadow'
                      : 'bg-[#0B0F17] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1 mb-1.5">
                    <span>GAME #{g.id}</span>
                    <span className="font-bold text-amber-400">Spread: {g.spread.toFixed(1)}</span>
                  </div>

                  <div className="space-y-0.5">
                    <div className="font-bold text-white flex items-center justify-between">
                      <span className={isHeavyFav ? 'text-blue-300' : ''}>{g.favored} (Fav)</span>
                      <span className="text-[11px] text-slate-400">vs {g.underdog}</span>
                    </div>
                  </div>

                  {/* Todd's Pick Highlight */}
                  {toddPick && (
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Your Pick:</span>
                      <span className="font-bold text-emerald-400">
                        {toddPick.team} ({toddPick.confidence} pts)
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
