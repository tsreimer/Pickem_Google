import React, { useState } from 'react';
import { useTeam } from '../context/TeamContext';
import { YAHOO_WEEK_GAMES, YAHOO_GROUP_PICKS_MATRIX } from '../data/mockData';
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
  const { teams, currentTeam, setActiveTab } = useTeam();
  const [filterCategory, setFilterCategory] = useState<'all' | 'user' | 'leaders' | 'high_ceiling'>('all');
  const [selectedPickerId, setSelectedPickerId] = useState<string | null>(null);

  // Completed games data
  const completedGames = YAHOO_WEEK_GAMES.filter(g => g.status === 'final');
  const pendingGames = YAHOO_WEEK_GAMES.filter(g => g.status !== 'final');

  // Detailed picker scorecard analytics derived from the Initech Invitational
  const pickersAnalysis = [
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
      damageGrade: 'A+ (Perfect)',
      badge: '🏆 Sole SF Survivor',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/50',
      outlook: 'Currently in 1st with a commanding 11-point lead. However, with opponent picks 3–16 hidden, variance will tighten once the Sunday afternoon slate kicks off.',
    },
    {
      teamId: 'team-shoeman',
      teamName: 'Shoeman',
      ownerName: 'Shoeman',
      rank: 2,
      points: 15,
      avatar: 'S',
      color: '#EC4899',
      isCurrentUser: false,
      goodPicks: [
        { game: '#1 SEA vs NE', team: 'Sea', conf: 15, note: 'Cashed 15 pts on Seattle' },
      ],
      badPicks: [
        { game: '#2 LAR vs SF', team: 'LAR', conf: 16, note: '💀 MAXIMUM DAMAGE: Burned his #1 overall 16-point confidence anchor on the Rams loss' },
      ],
      netCarnage: '-16 pts off ceiling',
      maxRemaining: 120,
      lossTotal: 16,
      damageGrade: 'D (Critical Anchor Burn)',
      badge: '💀 16-Pt Anchor Burned',
      badgeColor: 'bg-red-950 text-red-300 border-red-500/50',
      outlook: 'Sitting 2nd for now, but losing a 16-point anchor severely caps maximum point ceiling at 120. Needs massive underdog upsets across Sunday to stay in podium contention.',
    },
    {
      teamId: 'team-3d',
      teamName: '3-D',
      ownerName: '3-D',
      rank: 3,
      points: 13,
      avatar: '3',
      color: '#F59E0B',
      isCurrentUser: false,
      goodPicks: [
        { game: '#1 SEA vs NE', team: 'Sea', conf: 13, note: 'Cashed 13 pts on Seattle' },
      ],
      badPicks: [
        { game: '#2 LAR vs SF', team: 'LAR', conf: 12, note: 'Lost 12 confidence points on Rams' },
      ],
      netCarnage: '-12 pts off ceiling',
      maxRemaining: 124,
      lossTotal: 12,
      damageGrade: 'C+ (Heavy Blow)',
      badge: '⚠️ -12 Pt Casualty',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-500/50',
      outlook: 'Solid 13 points in the bank, but the 12-point hit on LAR leaves very little margin for error on remaining double-digit favorites.',
    },
    {
      teamId: 'team-snap',
      teamName: 'Snap Judgments',
      ownerName: 'Snap Judgments',
      rank: 4,
      points: 12,
      avatar: 'J',
      color: '#14B8A6',
      isCurrentUser: false,
      goodPicks: [
        { game: '#1 SEA vs NE', team: 'Sea', conf: 12, note: 'Cashed 12 pts on Seattle' },
      ],
      badPicks: [
        { game: '#2 LAR vs SF', team: 'LAR', conf: 11, note: 'Lost 11 confidence points on Rams' },
      ],
      netCarnage: '-11 pts off ceiling',
      maxRemaining: 125,
      lossTotal: 11,
      damageGrade: 'C+ (Heavy Blow)',
      badge: '⚠️ -11 Pt Casualty',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-500/50',
      outlook: 'Rank 4 with 12 points. Remains viable if remaining upper-tier picks (13–16) are intact on chalk.',
    },
    {
      teamId: 'team-torts',
      teamName: 'Torts Illustrated',
      ownerName: 'Torts Illustrated',
      rank: 5,
      points: 11,
      avatar: 'T',
      color: '#8B5CF6',
      isCurrentUser: false,
      goodPicks: [
        { game: '#1 SEA vs NE', team: 'Sea', conf: 11, note: 'Cashed 11 pts on Seattle' },
      ],
      badPicks: [
        { game: '#2 LAR vs SF', team: 'LAR', conf: 12, note: 'Lost 12 confidence points on Rams' },
      ],
      netCarnage: '-12 pts off ceiling',
      maxRemaining: 124,
      lossTotal: 12,
      damageGrade: 'C (Significant Loss)',
      badge: '⚠️ -12 Pt Casualty',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-500/50',
      outlook: 'Tied for 5th with 11 points. Must sweep early Sunday window to recover lost ground.',
    },
    {
      teamId: 'team-bijan',
      teamName: 'Bed Bath & Bijan',
      ownerName: 'Bed Bath & Bijan',
      rank: 6,
      points: 11,
      avatar: 'B',
      color: '#06B6D4',
      isCurrentUser: false,
      goodPicks: [
        { game: '#1 SEA vs NE', team: 'Sea', conf: 11, note: 'Cashed 11 pts on Seattle' },
      ],
      badPicks: [
        { game: '#2 LAR vs SF', team: 'LAR', conf: 10, note: 'Lost 10 confidence points on Rams' },
      ],
      netCarnage: '-10 pts off ceiling',
      maxRemaining: 126,
      lossTotal: 10,
      damageGrade: 'B- (Moderate Loss)',
      badge: '⚠️ -10 Pt Casualty',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/50',
      outlook: 'Kept the loss under 11 points. Ceiling remains above 125, giving him a solid mid-pack runway.',
    },
    {
      teamId: 'team-niner',
      teamName: 'Niner Faithful',
      ownerName: 'Niner Faithful',
      rank: 7,
      points: 9,
      avatar: 'N',
      color: '#EF4444',
      isCurrentUser: false,
      goodPicks: [
        { game: '#1 SEA vs NE', team: 'Sea', conf: 9, note: 'Cashed 9 pts on Seattle' },
      ],
      badPicks: [
        { game: '#2 LAR vs SF', team: 'LAR', conf: 11, note: '🤦 TRAGIC IRONY: Picked against his own 49ers with 11 pts, watched SF win, and lost 11 confidence pts!' },
      ],
      netCarnage: '-11 pts off ceiling',
      maxRemaining: 125,
      lossTotal: 11,
      damageGrade: 'C- (Self-Inflicted Burn)',
      badge: '🤡 Betrayed Own Team',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-500/50',
      outlook: 'Suffered maximum emotional and mathematical trauma. Picked against San Francisco for 11 points, watched the 49ers pull off the upset, and forfeited 11 points.',
    },
    {
      teamId: 'team-todd',
      teamName: 'CramItUp Your CramHole Lafleur',
      ownerName: 'Todd Reimer',
      rank: 8,
      points: 8,
      avatar: 'C',
      color: '#10B981',
      isCurrentUser: true,
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
      isCurrentUser: false,
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
    {
      teamId: 'team-bird',
      teamName: 'Bird Boss',
      ownerName: 'Bird Boss',
      rank: 10,
      points: 6,
      avatar: 'B',
      color: '#6366F1',
      isCurrentUser: false,
      goodPicks: [
        { game: '#1 SEA vs NE', team: 'Sea', conf: 6, note: 'Cashed 6 pts on Seattle' },
      ],
      badPicks: [
        { game: '#2 LAR vs SF', team: 'LAR', conf: 10, note: 'Lost 10 confidence points on Rams' },
      ],
      netCarnage: '-10 pts off ceiling',
      maxRemaining: 126,
      lossTotal: 10,
      damageGrade: 'C+ (Moderate Loss)',
      badge: '⚠️ -10 Pt Casualty',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-500/50',
      outlook: 'Currently 10th with 6 points. Max ceiling is 126. Will need mid-tier leverage games to bounce back into the upper half.',
    },
    {
      teamId: 'team-limps',
      teamName: 'Sir Limps-A-Lot',
      ownerName: 'Sir Limps-A-Lot',
      rank: 11,
      points: 4,
      avatar: 'L',
      color: '#64748B',
      isCurrentUser: false,
      goodPicks: [
        { game: '#1 SEA vs NE', team: 'Sea', conf: 4, note: 'Cashed 4 pts on Seattle' },
      ],
      badPicks: [
        { game: '#2 LAR vs SF', team: 'LAR', conf: 5, note: 'Lost 5 confidence points on Rams' },
      ],
      netCarnage: '-5 pts off ceiling',
      maxRemaining: 131,
      lossTotal: 5,
      damageGrade: 'B+ (Low Anchor Loss)',
      badge: '🩹 Low Anchor Loss (131 Max)',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-600/50',
      outlook: 'Slow start with only 4 points, but because he only risked 5 points on the Rams, he quietly holds a very high 131-point ceiling.',
    },
    {
      teamId: 'team-sacks',
      teamName: 'Sacks and the City',
      ownerName: 'Sacks and the City',
      rank: 12,
      points: 4,
      avatar: 'S',
      color: '#E11D48',
      isCurrentUser: false,
      goodPicks: [
        { game: '#1 SEA vs NE', team: 'Sea', conf: 4, note: 'Cashed 4 pts on Seattle' },
      ],
      badPicks: [
        { game: '#2 LAR vs SF', team: 'LAR', conf: 12, note: 'Lost 12 confidence points on Rams' },
      ],
      netCarnage: '-12 pts off ceiling',
      maxRemaining: 124,
      lossTotal: 12,
      damageGrade: 'C- (Heavy Loss)',
      badge: '⚠️ -12 Pt Casualty',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-500/50',
      outlook: 'Tied for last place with 4 points after dropping 12 on LAR. Needs an almost perfect Sunday run to climb out of the basement.',
    },
  ];

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
              <span>Week 1 End-of-Day Gridiron Recap & Outlook</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                2 OF 16 FINAL
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5">
              <span>The SoFi Upset Bloodbath & Week 1 Trajectory</span>
              <span className="text-xl">🏈</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Recap of the 2 settled games, picker-by-picker carnage analysis (good vs bad picks), and mathematical outlook for the remaining 14 games of Week 1.
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
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px]">Seattle Chalk Hit Rate</span>
            <div className="text-base font-black text-emerald-400 flex items-center gap-1.5">
              <span>12 / 12 (100%)</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] text-slate-500">116 total points collected</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-red-900/40 space-y-1">
            <span className="text-red-300 text-[11px]">Rams Carnage Vaporized</span>
            <div className="text-base font-black text-red-400 flex items-center gap-1.5">
              <span>114 Points Lost</span>
              <XCircle className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] text-slate-500">11 of 12 managers burned</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-amber-900/40 space-y-1">
            <span className="text-amber-300 text-[11px]">Current Pool Leader</span>
            <div className="text-base font-black text-amber-400 truncate">
              Orange crush (26 pts)
            </div>
            <span className="text-[10px] text-slate-500">Hit SF Upset (+10 pts)</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-emerald-900/40 space-y-1">
            <span className="text-emerald-300 text-[11px]">Todd's Max Ceiling</span>
            <div className="text-base font-black text-emerald-400">
              127 Points
            </div>
            <span className="text-[10px] text-slate-500">Top 7 anchors 100% intact</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: COMPLETED GAMES SCORECARD */}
      <div className="bg-[#151D2A] border border-[#1E293B] rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm uppercase tracking-wider font-mono">
              1. Completed Game Results & Pool Consequences
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Scores finalized • Week 1 Early Slate
          </span>
        </div>

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
                    Week 1 Outlook:
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

      {/* SECTION 3: STRATEGIC OUTLOOK FOR THE REST OF THE WEEK (14 GAMES) */}
      <div className="bg-[#151D2A] border border-[#1E293B] rounded-2xl p-5 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#1E293B] pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm uppercase tracking-wider font-mono">
              3. Strategic Outlook for the Rest of Week 1 (14 Games Pending)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Kickoffs starting Sunday 1:00 PM ET
          </span>
        </div>

        {/* Narrative Strategic Summary Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-emerald-950/40 border border-purple-800/50 space-y-2">
          <div className="flex items-center gap-2 text-white font-bold text-xs">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Why Todd Reimer ("CramItUp Your CramHole Lafleur") Holds the Premier Recovery Path:</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Although Todd sits in 8th place (8 pts) right now, his pick structure is mathematically optimal. He assigned his lower-tier 8 and 9 points to the tricky opening games, <span className="font-bold text-emerald-400">leaving his top 7 highest confidence anchors 100% untouched</span>:
          </p>
          <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
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
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            <span className="text-amber-300 font-bold">91 Confidence Points</span> are loaded directly onto the 7 heaviest favorites of the week. If these favorites prevail as expected, Todd will surge past Orange crush once opponent hidden picks unlock.
          </p>
        </div>

        {/* 14 Remaining Games Preview Matrix */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-slate-400 font-bold uppercase flex items-center justify-between">
            <span>Remaining 14 Matchups (Opponent Picks Locked until Kickoff)</span>
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <Lock className="w-3 h-3" />
              <span>Yahoo Anti-Cheat Lock Active</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 font-mono text-xs">
            {pendingGames.map(g => {
              // Check Todd's pick for this game
              const toddRow = YAHOO_GROUP_PICKS_MATRIX.find(r => r.isCurrentUser);
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
