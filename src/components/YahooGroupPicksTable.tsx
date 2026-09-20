import React, { useState } from 'react';
import { YAHOO_WEEK_GAMES, YAHOO_GROUP_PICKS_MATRIX } from '../data/mockData';
import { ExternalLink, Info, CheckCircle2, Lock, Eye, AlertCircle, Clock } from 'lucide-react';
import { useTeam } from '../context/TeamContext';

export const YahooGroupPicksTable: React.FC = () => {
  const [themeMode, setThemeMode] = useState<'yahoo_classic' | 'dark_cyber'>('yahoo_classic');
  const [selectedGameFilter, setSelectedGameFilter] = useState<number | 'all'>('all');
  const { yahooLockWindows } = useTeam();

  const games = YAHOO_WEEK_GAMES;
  const matrix = YAHOO_GROUP_PICKS_MATRIX;

  return (
    <div className="space-y-4">
      {/* Synchronization Confirmation Banner */}
      <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white font-bold text-sm flex items-center gap-2">
              <span>Synchronized: 100% Match with Initech Invitational</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                VERIFIED
              </span>
            </div>
            <p className="text-slate-300 text-xs mt-0.5">
              Confirmed 12 teams, locked results (Seattle win + SF upset), and Todd's full 16-game confidence card (anchored by LAC 16 pts). Opponent picks for games 3–16 are hidden until kickoff.
            </p>
          </div>
        </div>

        {/* Style View Toggle */}
        <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
          <span className="text-slate-400 text-[11px]">View Style:</span>
          <button
            onClick={() => setThemeMode('yahoo_classic')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              themeMode === 'yahoo_classic'
                ? 'bg-white text-slate-900 shadow font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Yahoo Classic (Screenshot Style)
          </button>
          <button
            onClick={() => setThemeMode('dark_cyber')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              themeMode === 'dark_cyber'
                ? 'bg-emerald-500 text-black shadow font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            War Room Dark
          </button>
        </div>
      </div>

      {/* Main Yahoo Card Container */}
      <div
        className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xl ${
          themeMode === 'yahoo_classic'
            ? 'bg-white text-slate-900 border-slate-300'
            : 'bg-[#121824] text-slate-200 border-[#1E293B]'
        }`}
      >
        {/* Yahoo Pick'em Group Header matching Screenshot */}
        <div
          className={`p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${
            themeMode === 'yahoo_classic'
              ? 'bg-[#F9FAFB] border-slate-200'
              : 'bg-[#0B0F17] border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-600 text-white font-bold text-sm">
              🏈
            </div>
            <div>
              <div className="flex items-baseline gap-2.5">
                <h2 className={`text-xl font-black uppercase tracking-tight ${
                  themeMode === 'yahoo_classic' ? 'text-slate-900' : 'text-white'
                }`}>
                  INITECH INVITATIONAL
                </h2>
                <span className="text-xs font-mono font-bold text-slate-500">
                  OFFICIAL LEAGUE POOL
                </span>
              </div>
              <div className="text-xs flex items-center gap-1.5 mt-0.5">
                <span className="text-slate-500">Your Picks:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-mono">
                  📑 CramItUp Your CramHole Lafleur
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <a
              href="https://football.fantasysports.yahoo.com/pickem"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 border border-purple-300 text-purple-800 font-semibold flex items-center gap-1.5 transition"
            >
              <span>Yahoo Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Yahoo Secondary Dark Navigation Bar */}
        <div className="bg-[#2D3339] text-white px-4 py-2 flex flex-wrap items-center gap-4 text-xs font-semibold overflow-x-auto">
          <span className="text-slate-400 hover:text-white cursor-pointer transition">Overview</span>
          <span className="bg-white text-slate-900 px-2.5 py-1 rounded shadow text-xs font-bold">
            Group Picks
          </span>
          <span className="text-slate-400 hover:text-white cursor-pointer transition">Weekly Performance</span>
          <span className="text-slate-400 hover:text-white cursor-pointer transition">Message Board</span>
          <span className="text-slate-400 hover:text-white cursor-pointer transition">Members (12)</span>
          <span className="text-slate-400 hover:text-white cursor-pointer transition">Settings</span>
          <span className="text-slate-400 hover:text-white cursor-pointer transition">Commish Tools</span>
        </div>

        {/* Week Selector Bar */}
        <div
          className={`px-4 py-2.5 border-b text-xs flex flex-wrap items-center gap-2 font-mono ${
            themeMode === 'yahoo_classic'
              ? 'bg-slate-50 border-slate-200 text-slate-700'
              : 'bg-[#151D2A] border-slate-800 text-slate-300'
          }`}
        >
          <span className="font-bold uppercase text-slate-500">Week</span>
          <span className="px-2 py-0.5 bg-purple-600 text-white font-bold rounded">1</span>
          {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(w => (
            <span key={w} className="px-1.5 py-0.5 text-slate-500 hover:text-slate-900 cursor-pointer">
              {w}
            </span>
          ))}
          <span className="text-slate-400 mx-1">|</span>
          <span className="font-bold uppercase text-slate-500">Playoffs:</span>
          {[1, 2, 3, 4].map(p => (
            <span key={p} className="px-1.5 py-0.5 text-slate-500 hover:text-slate-900 cursor-pointer">
              {p}
            </span>
          ))}
        </div>

        {/* Lock Windows Cadence Strip */}
        <div
          className={`px-4 py-2 border-b text-[11px] flex flex-wrap items-center justify-between gap-2 font-mono ${
            themeMode === 'yahoo_classic'
              ? 'bg-purple-50/50 border-purple-100 text-slate-700'
              : 'bg-[#0B0F17] border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-1.5 font-sans font-semibold">
            <Lock className="w-3.5 h-3.5 text-purple-500" />
            <span className={themeMode === 'yahoo_classic' ? 'text-slate-800 font-bold' : 'text-slate-200 font-bold'}>
              Kickoff Lock Windows:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {yahooLockWindows.map((win) => {
              const isSynced = win.status === 'synced';
              const isLocked = win.status === 'locked';

              return (
                <span
                  key={win.id}
                  title={`${win.name} (${win.typicalKickoff}) • ${win.gamesCount} games`}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 border ${
                    isSynced
                      ? themeMode === 'yahoo_classic'
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                        : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                      : isLocked
                      ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isSynced ? 'bg-emerald-500' : isLocked ? 'bg-amber-500' : 'bg-slate-500'}`} />
                  <span>{win.kickoffLabel}</span>
                  <span className="opacity-75">({isSynced ? 'Synced' : isLocked ? 'Locked' : 'Pending'})</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* The Group Picks Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            {/* Top Matchups Header */}
            <thead>
              {/* Row 1: Favored */}
              <tr className={themeMode === 'yahoo_classic' ? 'bg-slate-100 text-slate-700' : 'bg-[#0B0F17] text-slate-300'}>
                <th className="py-2.5 px-3 text-left font-bold border-b border-r border-slate-300/40 w-48 shrink-0">
                  Favored
                </th>
                {games.map(g => (
                  <th
                    key={`fav-${g.id}`}
                    className={`py-2 px-1.5 border-b border-r border-slate-300/40 font-mono font-bold min-w-[54px] ${
                      g.id === 1 ? 'text-emerald-700 bg-emerald-500/15 font-black' : ''
                    }`}
                  >
                    {g.favored}
                  </th>
                ))}
                <th className="py-2.5 px-3 border-b font-bold w-16 text-right"></th>
              </tr>

              {/* Row 2: Spread */}
              <tr className={themeMode === 'yahoo_classic' ? 'bg-slate-50 text-slate-600' : 'bg-[#121824] text-slate-400'}>
                <th className="py-1.5 px-3 text-left font-semibold border-b border-r border-slate-300/40">
                  Spread
                </th>
                {games.map(g => (
                  <th
                    key={`spd-${g.id}`}
                    className="py-1.5 px-1.5 border-b border-r border-slate-300/40 font-mono font-normal text-[11px]"
                  >
                    {g.spread.toFixed(1)}
                  </th>
                ))}
                <th className="py-1.5 px-3 border-b w-16"></th>
              </tr>

              {/* Row 3: Underdog */}
              <tr className={themeMode === 'yahoo_classic' ? 'bg-slate-100 text-slate-700' : 'bg-[#0B0F17] text-slate-300'}>
                <th className="py-2 px-3 text-left font-bold border-b-2 border-r border-slate-300/60">
                  Underdog
                </th>
                {games.map(g => (
                  <th
                    key={`und-${g.id}`}
                    className={`py-2 px-1.5 border-b-2 border-r border-slate-300/60 font-mono font-bold min-w-[54px] ${
                      g.id === 2 ? 'text-emerald-700 bg-emerald-500/15 font-black' : ''
                    }`}
                  >
                    {g.underdog}
                  </th>
                ))}
                <th className="py-2 px-3 border-b-2 border-slate-300/60 w-16"></th>
              </tr>

              {/* Column Label Header */}
              <tr className={themeMode === 'yahoo_classic' ? 'bg-slate-200/80 text-slate-800' : 'bg-[#151D2A] text-slate-300'}>
                <th className="py-2 px-3 text-left font-bold border-b border-r border-slate-300/60">
                  Team Name
                </th>
                {games.map(g => (
                  <th
                    key={`col-${g.id}`}
                    className="py-1 px-1 border-b border-r border-slate-300/60 text-[10px] text-slate-400 font-mono"
                  >
                    #{g.id}
                  </th>
                ))}
                <th className="py-2 px-3 border-b border-slate-300/60 text-right font-bold w-16">
                  Points
                </th>
              </tr>
            </thead>

            {/* Team Pick Rows */}
            <tbody className="divide-y divide-slate-300/40 font-mono text-xs">
              {matrix.map((row) => {
                const isUser = row.isCurrentUser;
                
                return (
                  <tr
                    key={row.teamId}
                    className={`transition-colors ${
                      isUser
                        ? themeMode === 'yahoo_classic'
                          ? 'bg-[#FEFCE8] font-bold shadow-inner'
                          : 'bg-emerald-950/40 font-bold border-y-2 border-emerald-500/60'
                        : themeMode === 'yahoo_classic'
                        ? 'hover:bg-slate-50'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Team Name Column */}
                    <td className="py-2.5 px-3 text-left border-r border-slate-300/40 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-semibold ${
                          isUser
                            ? 'text-blue-700 hover:underline cursor-pointer'
                            : themeMode === 'yahoo_classic'
                            ? 'text-blue-600 hover:underline cursor-pointer'
                            : 'text-blue-400 hover:underline cursor-pointer'
                        }`}>
                          {row.teamName}
                        </span>
                        {isUser && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-600 text-white font-sans uppercase tracking-wider font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Pick Columns for Games 1 through 16 */}
                    {games.map(g => {
                      const pick = row.picks[g.id];
                      if (!pick) {
                        return (
                          <td key={g.id} className="py-2 px-1 border-r border-slate-300/40 text-slate-400">
                            --
                          </td>
                        );
                      }

                      // Won Pick (Sea for all, SF for Orange crush)
                      if (pick.status === 'won') {
                        return (
                          <td
                            key={g.id}
                            className="py-2 px-1 border-r border-slate-300/40 bg-emerald-100/70 text-emerald-800 font-bold"
                          >
                            <div className="leading-tight">
                              <div>{pick.team}</div>
                              <div className="text-[10px]">({pick.confidence})</div>
                            </div>
                          </td>
                        );
                      }

                      // Lost Pick (LAR for everyone except Orange crush)
                      if (pick.status === 'lost') {
                        return (
                          <td
                            key={g.id}
                            className="py-2 px-1 border-r border-slate-300/40 bg-red-100/70 text-red-800 font-bold"
                          >
                            <div className="leading-tight">
                              <div>{pick.team}</div>
                              <div className="text-[10px]">({pick.confidence})</div>
                            </div>
                          </td>
                        );
                      }

                      // Todd's Pending Picks (visible for Todd across whole slate)
                      if (pick.status === 'pending') {
                        return (
                          <td
                            key={g.id}
                            className={`py-2 px-1 border-r border-slate-300/40 ${
                              themeMode === 'yahoo_classic' ? 'text-slate-800' : 'text-slate-200'
                            }`}
                          >
                            <div className="leading-tight font-semibold">
                              <div>{pick.team}</div>
                              <div className="text-[10px] text-slate-500">({pick.confidence})</div>
                            </div>
                          </td>
                        );
                      }

                      // Hidden Picks for opponent teams before game kickoff
                      return (
                        <td
                          key={g.id}
                          className="py-2 px-1 border-r border-slate-300/40 text-slate-400 font-normal"
                        >
                          --
                        </td>
                      );
                    })}

                    {/* Points Column */}
                    <td className="py-2.5 px-3 text-right font-black border-l border-slate-300/40 text-sm">
                      <span className={isUser ? 'text-emerald-700' : ''}>
                        {row.points}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend / Status Note */}
        <div
          className={`p-3 border-t text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
            themeMode === 'yahoo_classic'
              ? 'bg-slate-50 border-slate-200 text-slate-600'
              : 'bg-[#0B0F17] border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-500 inline-block"></span>
              <span>Correct Pick (Green)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-200 border border-red-500 inline-block"></span>
              <span>Incorrect Pick (Red)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-slate-400 font-mono font-bold">--</span>
              <span>Hidden until Game Kickoff</span>
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Anti-Cheat Lock Active (The League)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
