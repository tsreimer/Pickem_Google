import React, { useState } from 'react';
import { useTeam } from '../context/TeamContext';
import { Flame, Play, RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2, TrendingUp, TrendingDown, Radio, Table } from 'lucide-react';
import { YahooGroupPicksTable } from '../components/YahooGroupPicksTable';

export const WarRoom: React.FC = () => {
  const {
    teams,
    games,
    activeSweatGame,
    simulateScenario,
    simulationState,
    currentTeam,
  } = useTeam();

  const [warRoomSubTab, setWarRoomSubTab] = useState<'yahoo_matrix' | 'live_sweat'>('yahoo_matrix');

  const isKcWinner = simulationState === 'final_kc';
  const isBufAhead = simulationState === 'buf_ahead';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* RedZone Realtime Ticker (Section 7.0 Page 1) */}
      <div className="bg-red-950/80 border border-red-900/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-4 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-red-600 font-black text-black text-[10px] tracking-wider uppercase flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              REDZONE LIVE
            </span>
            <span className="font-mono text-slate-300 font-semibold">
              Week 1 Slate • 2 Games Settled (SEA won, SF upset won) • 14 Games Pending
            </span>
          </div>
          <div className="font-mono text-[11px] text-red-200 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="font-semibold">
              {isBufAhead
                ? '⚡ Touchdown shift impacts standings'
                : isKcWinner
                ? '🏁 FINAL: All Sunday early window games concluded'
                : '⚡ Initech Invitational Live Ingestion Active • Todd Reimer: LAC (16), JAX (15), DET (14)'}
            </span>
          </div>
        </div>
      </div>

      {/* Main War Room Sub-Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setWarRoomSubTab('yahoo_matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              warRoomSubTab === 'yahoo_matrix'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-[#151D2A] text-slate-400 hover:text-white border border-[#1E293B]'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>1. Initech Invitational Picks Matrix</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
              MATCHED
            </span>
          </button>
          <button
            onClick={() => setWarRoomSubTab('live_sweat')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              warRoomSubTab === 'live_sweat'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-[#151D2A] text-slate-400 hover:text-white border border-[#1E293B]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>2. Live Sweat Room & Standings</span>
          </button>
        </div>
        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Initech Invitational • 12 Teams</span>
        </div>
      </div>

      {/* TAB 1: Authenticated Initech Invitational Picks Matrix */}
      {warRoomSubTab === 'yahoo_matrix' && (
        <YahooGroupPicksTable />
      )}

      {/* TAB 2: Live Sweat Room & Game-Day Simulator */}
      {warRoomSubTab === 'live_sweat' && (
        <div className="space-y-8 animate-in fade-in duration-200">


      {/* Interactive Simulation Control Deck */}
      <div className="bg-[#151D2A] border border-[#1E293B] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase">
            <Play className="w-3.5 h-3.5" />
            <span>Interactive Game-Day Simulator</span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Test real-time delta score shifts and watch pool standings update dynamically:
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => simulateScenario('buf_scores_td')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              isBufAhead
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300'
            }`}
          >
            <span>Simulate: BUF Scores TD (28-24)</span>
          </button>

          <button
            onClick={() => simulateScenario('kc_wins')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              isKcWinner
                ? 'bg-emerald-600 text-black shadow-lg font-black'
                : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300'
            }`}
          >
            <span>Simulate: KC Goal-Line Stand (Final)</span>
          </button>

          <button
            onClick={() => simulateScenario('reset')}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition"
            title="Reset to 01:18 4th & Goal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ACTIVE SWEAT ROOM CARD (Section 7.0 Specification) */}
      <div className="bg-[#151D2A] border-2 border-amber-500/70 rounded-2xl p-6 glow-amber space-y-6">
        
        <div className="flex flex-wrap items-center justify-between border-b border-[#1E293B] pb-4 gap-2">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold uppercase flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Active Sweat Game
            </span>
            <span className="text-xs text-slate-400">Margin ≤ 8 pts in 4th Quarter</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-amber-400 font-bold bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800">
              {activeSweatGame.clock} • {activeSweatGame.quarter}
            </span>
            <span className="text-xs font-mono text-slate-400">CBS National Broadcast</span>
          </div>
        </div>

        {/* Score & Matchup Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 text-center">
          
          {/* Away Team: Buffalo */}
          <div className="p-4 bg-[#0B0F17] rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Buffalo Bills (3-1)</div>
            <div className="text-2xl font-black text-white tracking-wide">BUFFALO</div>
            <div className="text-4xl font-mono font-black text-slate-100">
              {activeSweatGame.awayScore}
            </div>
            <div className="text-xs text-blue-400 font-semibold pt-1">
              Picked by: <span className="text-white font-bold">Dave (12)</span>, Mark (8), Big Mike (6)
            </div>
          </div>

          {/* Win Probability Swing Bar */}
          <div className="space-y-3 px-2">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Win Probability Swing
            </div>

            <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden flex border border-slate-800 shadow-inner">
              <div
                className="bg-blue-600 h-full transition-all duration-500"
                style={{ width: `${Math.round((1 - activeSweatGame.homeWinProbability) * 100)}%` }}
              ></div>
              <div
                className="bg-red-600 h-full transition-all duration-500"
                style={{ width: `${Math.round(activeSweatGame.homeWinProbability * 100)}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-xs font-mono font-bold">
              <span className="text-blue-400">
                BUF {Math.round((1 - activeSweatGame.homeWinProbability) * 100)}%
              </span>
              <span className="text-red-400">
                KC {Math.round(activeSweatGame.homeWinProbability * 100)}%
              </span>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Leverage index: <span className="text-amber-400 font-bold">9.4/10</span>
            </div>
          </div>

          {/* Home Team: Kansas City */}
          <div className="p-4 bg-[#0B0F17] rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Kansas City Chiefs (3-1)</div>
            <div className="text-2xl font-black text-white tracking-wide">KANSAS CITY</div>
            <div className="text-4xl font-mono font-black text-slate-100">
              {activeSweatGame.homeScore}
            </div>
            <div className="text-xs text-emerald-400 font-semibold pt-1">
              Picked by: <span className="text-white font-bold">Todd (14)</span>, Sarah (15), Marcus (10)
            </div>
          </div>

        </div>

        {/* Live Standings Delta Preview (From Spec) */}
        <div className="bg-[#0B0F17]/90 rounded-xl p-4 text-xs grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-800">
          <div className="border-l-4 border-emerald-500 pl-3.5 space-y-1">
            <div className="text-slate-400 text-[11px] font-mono uppercase font-bold">
              If Kansas City Wins:
            </div>
            <div className="font-semibold text-white">
              Todd clinches Weekly #1 (114 pts) • Sarah moves to #2 (106 pts)
            </div>
            <div className="text-[11px] text-emerald-400 font-mono">
              Todd locks $Weekly Cash Pot regardless of Monday night outcome.
            </div>
          </div>

          <div className="border-l-4 border-red-500 pl-3.5 space-y-1">
            <div className="text-slate-400 text-[11px] font-mono uppercase font-bold">
              If Buffalo Scores & Wins:
            </div>
            <div className="font-semibold text-white">
              Dave takes Weekly #1 (108 pts) • Todd drops to #2 (98 pts)
            </div>
            <div className="text-[11px] text-red-400 font-mono">
              Forces Todd into mandatory Seattle underdog pivot on Monday Night.
            </div>
          </div>
        </div>

      </div>

      {/* LIVE POOL STANDINGS TABLE (Section 7.0 Specification) */}
      <div className="bg-[#151D2A] border border-[#1E293B] rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#1E293B] pb-4">
          <div>
            <h3 className="font-bold text-white text-base tracking-tight">
              Live Pool Standings (Week 4 Slate)
            </h3>
            <p className="text-xs text-slate-400">
              Includes locked points + active 4th quarter sweat allocations
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>14 of 16 Games Settled</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-400 border-b border-[#1E293B] font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-2">Rank</th>
                <th className="py-3 px-3">Team & Picker</th>
                <th className="py-3 px-3">Locked Pts</th>
                <th className="py-3 px-3">Active Sweat</th>
                <th className="py-3 px-3">Total Live</th>
                <th className="py-3 px-3">Max Possible</th>
                <th className="py-3 px-3">Endgame Destiny Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] font-mono text-xs">
              {teams.map((team, idx) => {
                const totalLive = team.lockedPoints + team.activeSweatPoints;
                const isCurrent = team.id === currentTeam.id;

                return (
                  <tr
                    key={team.id}
                    className={`transition-colors ${
                      isCurrent
                        ? 'bg-emerald-950/30 font-semibold'
                        : idx === 0
                        ? 'bg-emerald-950/15'
                        : 'hover:bg-slate-900/40'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        <span className={`font-black text-sm ${idx === 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {idx + 1}
                        </span>
                        {team.rankDelta > 0 ? (
                          <span className="text-emerald-400 flex items-center text-[10px]">
                            ▲
                          </span>
                        ) : team.rankDelta < 0 ? (
                          <span className="text-red-400 flex items-center text-[10px]">
                            ▼
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">─</span>
                        )}
                      </div>
                    </td>

                    {/* Team & Picker */}
                    <td className="py-3 px-3 font-sans">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] text-black shrink-0"
                          style={{ backgroundColor: team.color }}
                        >
                          {team.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{team.ownerName}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {team.teamName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Locked Points */}
                    <td className="py-3 px-3 text-slate-200 font-bold">
                      {team.lockedPoints}
                    </td>

                    {/* Active Sweat */}
                    <td className="py-3 px-3">
                      {team.activeSweatPoints > 0 ? (
                        <span className="text-amber-400 font-bold">
                          +{team.activeSweatPoints} ({team.activePickTeam})
                        </span>
                      ) : (
                        <span className="text-slate-500">+0 ({team.activePickTeam})</span>
                      )}
                    </td>

                    {/* Total Live */}
                    <td className="py-3 px-3 text-emerald-300 font-black text-sm">
                      {totalLive}
                    </td>

                    {/* Max Possible */}
                    <td className="py-3 px-3 text-slate-400">
                      {team.maxPossible}
                    </td>

                    {/* Destiny Status */}
                    <td className="py-3 px-3 font-sans">
                      {team.destinyStatus === 'controls_destiny' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950 border border-emerald-700 text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          Controls Destiny
                        </span>
                      ) : team.destinyStatus === 'must_win_pivot' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950 border border-amber-700 text-amber-300">
                          <AlertTriangle className="w-3 h-3" />
                          Must Win MNF Underdog
                        </span>
                      ) : team.destinyStatus === 'alive' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                          {team.statusText}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-950/40 border border-red-900/60 text-red-400">
                          Eliminated for #1
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Other Games on the Week 4 Slate */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Sunday & Monday Slate Overview
          </h4>
          <span className="text-xs font-mono text-slate-500">Official Settlement Feed</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.filter(g => g.id !== 'game-1').map(game => (
            <div
              key={game.id}
              className="p-4 bg-[#151D2A] border border-[#1E293B] rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">{game.kickoffTime}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  game.status === 'final'
                    ? 'bg-slate-800 text-slate-300'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {game.status === 'final' ? 'FINAL' : 'MON 8:15 PM'}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-bold ${game.awayScore > game.homeScore ? 'text-white' : 'text-slate-400'}`}>
                    {game.awayTeam}
                  </span>
                  <span className="font-mono font-bold text-slate-200">
                    {game.status === 'final' ? game.awayScore : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-bold ${game.homeScore > game.awayScore ? 'text-white' : 'text-slate-400'}`}>
                    {game.homeTeam}
                  </span>
                  <span className="font-mono font-bold text-slate-200">
                    {game.status === 'final' ? game.homeScore : '—'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] font-mono text-slate-400">
                <span>Spread: {game.spreadString}</span>
                <span>{game.network}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

        </div>
      )}

    </div>
  );
};

