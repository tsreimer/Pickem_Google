import React, { useState } from 'react';
import { useTeam } from '../context/TeamContext';
import { KickoffCountdown } from './KickoffCountdown';
import {
  Flame,
  Clock,
  Shield,
  Trophy,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ExternalLink,
  Users,
  Eye,
  Info
} from 'lucide-react';
import { YAHOO_WEEK_GAMES, YAHOO_GROUP_PICKS_MATRIX } from '../data/mockData';

export const MobileGameDayCards: React.FC = () => {
  const {
    currentTeam,
    activeSweatGame,
    simulateScenario,
    simulationState,
    teams,
    groupPicksMatrix
  } = useTeam();

  const [activeFilter, setActiveFilter] = useState<'all' | 'sweat' | 'anchors' | 'upcoming' | 'final'>('sweat');
  const [selectedGameIndex, setSelectedGameIndex] = useState<number>(0);
  const [showOpponentDetails, setShowOpponentDetails] = useState<boolean>(false);

  const activeMatrix = groupPicksMatrix || YAHOO_GROUP_PICKS_MATRIX;

  // Extract Todd / Current Manager picks for Week 1 from activeMatrix
  const currentTeamRow = activeMatrix.find(r => r.teamId === currentTeam.id) || activeMatrix[1]; // Todd Reimer default

  // Enhanced game cards combined with picks and countdowns
  const gamesWithPicks = YAHOO_WEEK_GAMES.map((g, index) => {
    const userPick = currentTeamRow?.picks[g.id];
    const isAnchor = (userPick?.confidence || 0) >= 12;
    const isSweat = g.id === 10 || (g.status === 'scheduled' && index === 2); // Game 10 (BUF @ KC) or active
    
    // Calculate consensus from matrix
    let homeCount = 0;
    let awayCount = 0;
    activeMatrix.forEach(row => {
      const p = row.picks[g.id];
      if (p && p.team !== '--') {
        if (p.team === g.favored) homeCount++;
        else awayCount++;
      }
    });
    const totalCount = Math.max(1, homeCount + awayCount);
    const favPercentage = Math.round((homeCount / totalCount) * 100) || 75;

    // Approximate countdown offset in minutes
    let countdownMinutes = 180;
    if (g.id <= 2) countdownMinutes = 0; // Final
    else if (g.id <= 9) countdownMinutes = 45; // 1:00 PM games
    else if (g.id <= 14) countdownMinutes = 185; // 4:25 PM games
    else if (g.id === 15) countdownMinutes = 390; // SNF
    else countdownMinutes = 1440; // MNF

    return {
      ...g,
      userPick,
      isAnchor,
      isSweat: g.id === 10,
      favPercentage,
      homeCount,
      awayCount,
      countdownMinutes,
    };
  });

  // Filter games according to active filter
  const filteredGames = gamesWithPicks.filter(g => {
    if (activeFilter === 'sweat') return g.isSweat;
    if (activeFilter === 'anchors') return g.isAnchor;
    if (activeFilter === 'upcoming') return !g.isLocked && g.status !== 'final';
    if (activeFilter === 'final') return g.status === 'final' || g.isLocked;
    return true;
  });

  const currentGame = filteredGames[selectedGameIndex] || filteredGames[0] || gamesWithPicks[9];

  const isKcWinner = simulationState === 'final_kc';
  const isBufAhead = simulationState === 'buf_ahead';

  return (
    <div className="space-y-4">
      {/* Mobile Bar Header & Quick Filter Pills */}
      <div className="bg-[#121824] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                Game-Day Quick Cards
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400 text-black font-mono font-bold">
                  MOBILE DECK
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Picks for <strong className="text-white">{currentTeam.ownerName}</strong> &bull; Week 1 Slate
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800">
            {filteredGames.length} Game{filteredGames.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Scrollable Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => { setActiveFilter('sweat'); setSelectedGameIndex(0); }}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 min-h-[38px] ${
              activeFilter === 'sweat'
                ? 'bg-amber-400 text-black shadow-md font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Active Sweat (1)</span>
          </button>

          <button
            onClick={() => { setActiveFilter('anchors'); setSelectedGameIndex(0); }}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 min-h-[38px] ${
              activeFilter === 'anchors'
                ? 'bg-purple-500 text-white shadow-md font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Heavy Anchors (12-16 pts)</span>
          </button>

          <button
            onClick={() => { setActiveFilter('upcoming'); setSelectedGameIndex(0); }}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 min-h-[38px] ${
              activeFilter === 'upcoming'
                ? 'bg-blue-500 text-white shadow-md font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Upcoming (13)</span>
          </button>

          <button
            onClick={() => { setActiveFilter('final'); setSelectedGameIndex(0); }}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 min-h-[38px] ${
              activeFilter === 'final'
                ? 'bg-emerald-500 text-black shadow-md font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Settled (2)</span>
          </button>

          <button
            onClick={() => { setActiveFilter('all'); setSelectedGameIndex(0); }}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 min-h-[38px] ${
              activeFilter === 'all'
                ? 'bg-slate-200 text-black shadow-md font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>All 16 Games</span>
          </button>
        </div>
      </div>

      {/* Featured Main Quick Card View */}
      {currentGame ? (
        <div className="bg-gradient-to-b from-[#151D2A] to-[#0D131F] border-2 border-slate-700/80 rounded-2xl p-5 shadow-2xl space-y-5 relative overflow-hidden">
          
          {/* Card Top: Matchup Tag, Game # & Countdown Badge */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Game #{currentGame.id}
              </span>
              {currentGame.isSweat && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                  <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                  Live Sweat
                </span>
              )}
            </div>

            {/* Countdown Badge with Real-time Ticking */}
            <KickoffCountdown
              status={currentGame.isSweat ? 'in_progress' : currentGame.status}
              liveClock={activeSweatGame.clock}
              liveQuarter={activeSweatGame.quarter}
              defaultMinutesRemaining={currentGame.countdownMinutes}
            />
          </div>

          {/* Matchup Banner: Teams, Spreads, and Scores */}
          <div className="grid grid-cols-5 items-center gap-2 text-center py-1">
            
            {/* Away Team */}
            <div className="col-span-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Underdog</div>
              <div className="text-xl font-black text-white tracking-wider">
                {currentGame.underdog}
              </div>
              {currentGame.isSweat ? (
                <div className="text-2xl font-black font-mono text-blue-400">
                  {activeSweatGame.awayScore}
                </div>
              ) : (
                <div className="text-xs font-mono text-slate-400 font-semibold">
                  +{currentGame.spread}
                </div>
              )}
              {currentGame.winner === currentGame.underdog && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded">
                  UPSET WON
                </span>
              )}
            </div>

            {/* Middle Versus / Spread Indicator */}
            <div className="col-span-1 flex flex-col items-center justify-center space-y-1">
              <span className="text-xs font-black text-slate-500">VS</span>
              <span className="text-[10px] font-mono text-amber-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                {currentGame.spread} pt
              </span>
            </div>

            {/* Home / Favored Team */}
            <div className="col-span-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Favorite</div>
              <div className="text-xl font-black text-white tracking-wider">
                {currentGame.favored}
              </div>
              {currentGame.isSweat ? (
                <div className="text-2xl font-black font-mono text-red-400">
                  {activeSweatGame.homeScore}
                </div>
              ) : (
                <div className="text-xs font-mono text-slate-400 font-semibold">
                  -{currentGame.spread}
                </div>
              )}
              {currentGame.winner === currentGame.favored && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded">
                  COVERED
                </span>
              )}
            </div>

          </div>

          {/* User's Pick & Stakes Highlight Card */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                {currentTeam.ownerName}&apos;s Card Allocation:
              </span>
              <span className="text-xs font-mono font-black text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700">
                {currentGame.userPick?.confidence ? `${currentGame.userPick.confidence} POINTS` : 'UNREVEALED'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="font-semibold text-white">
                Selected: <strong className="text-amber-300 text-sm">{currentGame.userPick?.team || 'Pending'}</strong>
              </div>
              <div>
                {currentGame.userPick?.status === 'won' && (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> +{currentGame.userPick.confidence} PTS LOCKED
                  </span>
                )}
                {currentGame.userPick?.status === 'lost' && (
                  <span className="text-red-400 font-bold">
                    0 PTS (WIPED OUT)
                  </span>
                )}
                {(!currentGame.userPick?.status || currentGame.userPick.status === 'hidden') && (
                  <span className="text-slate-400 font-mono text-[11px]">
                    Locks at kickoff
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Fast What-If Simulator (If Active Game) */}
          {currentGame.isSweat && (
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5" /> One-Tap What-If Simulation
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Q4 01:18 &bull; 4th &amp; Goal
                </span>
              </div>

              {/* Fast Scenario Tap Buttons - Optimized for Thumbs */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => simulateScenario('buf_scores_td')}
                  className={`p-3 rounded-xl text-xs font-black transition flex flex-col items-center justify-center gap-1 min-h-[50px] cursor-pointer ${
                    isBufAhead
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                >
                  <span>⚡ BUF Scores TD</span>
                  <span className="text-[10px] font-normal opacity-80">Dave Takes #1 (108 pts)</span>
                </button>

                <button
                  onClick={() => simulateScenario('kc_wins')}
                  className={`p-3 rounded-xl text-xs font-black transition flex flex-col items-center justify-center gap-1 min-h-[50px] cursor-pointer ${
                    isKcWinner
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                >
                  <span>🏁 KC Hold (Final)</span>
                  <span className="text-[10px] font-normal opacity-80">Todd Clinches #1 (114 pts)</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  {isBufAhead ? 'Simulating 28-24 Buffalo lead' : isKcWinner ? 'Simulating Kansas City win' : 'Live state: 21-24 Kansas City'}
                </span>
                <button
                  onClick={() => simulateScenario('reset')}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-[11px] flex items-center gap-1 border border-slate-800"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
            </div>
          )}

          {/* Pool Consensus Bar & Opponents in the Sweat */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Pool Consensus:</span>
              <span>
                {currentGame.favored} {currentGame.favPercentage}% &bull; {currentGame.underdog} {100 - currentGame.favPercentage}%
              </span>
            </div>

            {/* Split Bar */}
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden flex border border-slate-800">
              <div
                className="bg-purple-600 h-full transition-all duration-300"
                style={{ width: `${currentGame.favPercentage}%` }}
              />
              <div
                className="bg-cyan-500 h-full transition-all duration-300"
                style={{ width: `${100 - currentGame.favPercentage}%` }}
              />
            </div>

            {/* Opponent Pick Details Toggle */}
            <div className="pt-1">
              <button
                onClick={() => setShowOpponentDetails(!showOpponentDetails)}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1.5 transition underline underline-offset-4"
              >
                <Users className="w-3 h-3" />
                <span>{showOpponentDetails ? 'Hide Pool Breakdown' : 'View Who Picked Who In Pool'}</span>
              </button>

              {showOpponentDetails && (
                <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-bold text-red-400">{currentGame.favored}:</span>
                    <span className="text-slate-400 font-mono">Todd (14), Sarah (15), Marcus (10), 7 others</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 border-t border-slate-800 pt-1.5">
                    <span className="font-bold text-blue-400">{currentGame.underdog}:</span>
                    <span className="text-slate-400 font-mono">Dave (12), Mark (8), Big Mike (6)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Card Pagination / Next & Prev */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              onClick={() => setSelectedGameIndex(prev => Math.max(0, prev - 1))}
              disabled={selectedGameIndex === 0}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 min-h-[44px] transition ${
                selectedGameIndex === 0
                  ? 'text-slate-600 bg-slate-950/40 cursor-not-allowed'
                  : 'text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-mono text-slate-400 font-semibold">
              {selectedGameIndex + 1} of {filteredGames.length}
            </span>

            <button
              onClick={() => setSelectedGameIndex(prev => Math.min(filteredGames.length - 1, prev + 1))}
              disabled={selectedGameIndex >= filteredGames.length - 1}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 min-h-[44px] transition ${
                selectedGameIndex >= filteredGames.length - 1
                  ? 'text-slate-600 bg-slate-950/40 cursor-not-allowed'
                  : 'text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>Next Game</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
          <Info className="w-6 h-6 text-slate-500 mx-auto" />
          <div className="text-sm font-bold text-white">No games in this filter</div>
          <p className="text-xs text-slate-400">Try switching to &quot;All 16 Games&quot; above.</p>
        </div>
      )}
    </div>
  );
};
