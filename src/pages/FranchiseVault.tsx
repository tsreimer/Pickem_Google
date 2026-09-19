import React, { useState } from 'react';
import { useTeam } from '../context/TeamContext';
import { TROPHIES } from '../data/mockData';
import { Award, TrendingUp, Sparkles, Target, AlertTriangle, Shield, BarChart3, User, Skull } from 'lucide-react';

export const FranchiseVault: React.FC = () => {
  const { teams, currentTeam } = useTeam();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const selectedMember = teams.find(t => t.id === selectedMemberId) || currentTeam;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="border-b border-[#1E293B] pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 uppercase">
            <Award className="w-4 h-4" />
            <span>Section 7.0 Page 4 • Historical Records & Advanced Analytics</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            The Franchise Vault & Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Closing Line Value (CLV), empirical luck factor regressions, trophy cabinets, and the Wall of Shame.
          </p>
        </div>
      </div>

      {/* THE LUCK VS SKILL MATRIX SCATTERPLOT (Section 7.0 Page 4) */}
      <div className="bg-[#151D2A] border border-[#1E293B] rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#1E293B] pb-4">
          <div>
            <h3 className="font-bold text-white text-base">
              The Luck vs Skill Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Closing Line Expected Points (Skill / EV) vs Actual Secured Points (Luck) • Season-to-Date
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 self-start sm:self-auto">
            Quadrants 1–4 Empirical Mapping
          </span>
        </div>

        {/* Scatterplot Canvas Frame */}
        <div className="relative bg-[#0B0F17] border border-[#1E293B] rounded-2xl p-6 min-h-[360px] flex flex-col justify-between font-mono text-xs overflow-hidden">
          
          {/* Top Quadrant Headers */}
          <div className="flex justify-between text-[11px] font-bold z-10">
            <span className="text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded border border-amber-900/60">
              QUAD 2: LUCKY FRAUDS (Low EV / High Actual)
            </span>
            <span className="text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-900/60">
              QUAD 1: THE ELITES (High EV / High Actual)
            </span>
          </div>

          {/* Central Grid Crosshairs */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Horizontal Axis Divider */}
            <div className="w-full border-t border-dashed border-slate-800"></div>
          </div>
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Vertical Axis Divider */}
            <div className="h-full border-l border-dashed border-slate-800"></div>
          </div>

          {/* Plotted Interactive Nodes */}
          <div className="relative w-full h-56 my-2">
            
            {/* Todd: Quad 1 (Top Right) */}
            <div
              onClick={() => setSelectedMemberId('team-todd')}
              className="absolute top-4 right-16 cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 bg-emerald-950 border border-emerald-600 px-2.5 py-1 rounded-lg text-xs text-emerald-300 font-bold shadow-lg shadow-emerald-950/50 hover:scale-105 transition">
                <span>★ Todd (+7.8 Net EV)</span>
              </div>
              <div className="text-[10px] text-emerald-500 font-mono pl-1 pt-0.5 opacity-0 group-hover:opacity-100 transition">
                Skill: 104.2 | Actual: 112.0
              </div>
            </div>

            {/* Sarah: Quad 2 (Top Left) */}
            <div
              onClick={() => setSelectedMemberId('team-sarah')}
              className="absolute top-8 left-10 cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 bg-amber-950 border border-amber-600 px-2.5 py-1 rounded-lg text-xs text-amber-300 font-bold shadow-lg hover:scale-105 transition">
                <span>🍀 Sarah (+18.0 Luck)</span>
              </div>
              <div className="text-[10px] text-amber-500 font-mono pl-1 pt-0.5 opacity-0 group-hover:opacity-100 transition">
                Skill: 88.0 | Actual: 106.0
              </div>
            </div>

            {/* Dave: Quad 4 (Bottom Right) */}
            <div
              onClick={() => setSelectedMemberId('team-dave')}
              className="absolute bottom-6 right-20 cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 bg-red-950 border border-red-600 px-2.5 py-1 rounded-lg text-xs text-red-300 font-bold shadow-lg hover:scale-105 transition">
                <span>💀 Dave (-12.5 Bad Beats)</span>
              </div>
              <div className="text-[10px] text-red-500 font-mono pl-1 pt-0.5 opacity-0 group-hover:opacity-100 transition">
                Skill: 108.5 | Actual: 96.0
              </div>
            </div>

            {/* Elena: Quad 4 (Mid Bottom Right) */}
            <div
              onClick={() => setSelectedMemberId('team-elena')}
              className="absolute bottom-16 right-36 cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 bg-cyan-950 border border-cyan-700 px-2 py-0.5 rounded text-[11px] text-cyan-300 font-bold hover:scale-105 transition">
                <span>Elena (-8.4 EV)</span>
              </div>
            </div>

            {/* Marcus: Quad 2 (Mid Top Left) */}
            <div
              onClick={() => setSelectedMemberId('team-marcus')}
              className="absolute top-20 left-24 cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 bg-purple-950 border border-purple-700 px-2 py-0.5 rounded text-[11px] text-purple-300 font-bold hover:scale-105 transition">
                <span>Marcus (+13.0 Luck)</span>
              </div>
            </div>

            {/* Mark: Quad 1 (Mid Center Right) */}
            <div
              onClick={() => setSelectedMemberId('team-mark')}
              className="absolute top-24 right-32 cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 bg-blue-950 border border-blue-700 px-2 py-0.5 rounded text-[11px] text-blue-300 font-bold hover:scale-105 transition">
                <span>Mark (+3.5 EV)</span>
              </div>
            </div>

            {/* Big Mike: Quad 3 (Bottom Left) */}
            <div
              onClick={() => setSelectedMemberId('team-mike')}
              className="absolute bottom-10 left-12 cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-[11px] text-slate-400 font-semibold hover:scale-105 transition">
                <span>Big Mike (Homer)</span>
              </div>
            </div>

            {/* Jordan: Quad 3 (Center Left) */}
            <div
              onClick={() => setSelectedMemberId('team-jordan')}
              className="absolute bottom-24 left-28 cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[10px] text-slate-400 hover:scale-105 transition">
                <span>Jordan</span>
              </div>
            </div>

          </div>

          {/* Bottom Quadrant Footers */}
          <div className="flex justify-between text-[11px] font-bold z-10">
            <span className="text-slate-500 bg-slate-900/60 px-2.5 py-1 rounded border border-slate-800">
              QUAD 3: HOMER PICKERS (Low EV / Low Actual)
            </span>
            <span className="text-red-400 bg-red-950/40 px-2.5 py-1 rounded border border-red-900/60">
              QUAD 4: UNLUCKY SNIPERS (High EV / Low Actual)
            </span>
          </div>

        </div>

        {/* Selected Member Drilldown */}
        <div className="p-4 bg-[#0B0F17] rounded-xl border border-[#1E293B] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-black"
              style={{ backgroundColor: selectedMember.color }}
            >
              {selectedMember.avatar}
            </div>
            <div>
              <div className="font-bold text-white text-sm">
                {selectedMember.ownerName} ({selectedMember.teamName})
              </div>
              <div className="text-[11px] text-slate-400">
                Quadrant {selectedMember.luckQuadrant}:{' '}
                {selectedMember.luckQuadrant === 1
                  ? 'The Elites (Consistently positive closing line value and wins)'
                  : selectedMember.luckQuadrant === 2
                  ? 'Lucky Frauds (Carried by low-probability game swings)'
                  : selectedMember.luckQuadrant === 4
                  ? 'Unlucky Snipers (Sound mathematical picks crushed by bad beats)'
                  : 'Homer Pickers (Emotional heart-based picks)'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs self-start sm:self-auto">
            <div>
              <span className="text-slate-500 block text-[10px]">EXPECTED EV</span>
              <span className="font-bold text-slate-200">{selectedMember.closingLineEV} pts</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ACTUAL SECURED</span>
              <span className="font-bold text-white">{selectedMember.actualPoints} pts</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">NET LUCK FACTOR</span>
              <span className={`font-bold ${selectedMember.netEV >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {selectedMember.netEV >= 0 ? `+${selectedMember.netEV}` : selectedMember.netEV} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TROPHY CABINET & WALL OF SHAME BADGES (Section 7.0 Page 4) */}
      <div className="bg-[#151D2A] border border-[#1E293B] rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="border-b border-[#1E293B] pb-4">
          <h3 className="font-bold text-white text-base">
            Trophy Cabinet & The Wall of Shame
          </h3>
          <p className="text-xs text-slate-400">
            Perpetual awards recognizing mathematical genius, extreme fortune, and historic weekly chokes.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 text-center">
          {TROPHIES.map(trophy => (
            <div
              key={trophy.id}
              className={`p-4 rounded-xl border space-y-2 transition-all hover:scale-105 ${trophy.borderClass}`}
            >
              <div className="text-3xl">{trophy.icon}</div>
              <div className="font-bold text-xs text-white leading-tight">
                {trophy.title}
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                {trophy.description}
              </div>
              <div className="pt-2 border-t border-slate-800/80 font-mono text-[10px] font-bold text-slate-300">
                {trophy.holder}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEASON-TO-DATE ADVANCED METRICS TABLE */}
      <div className="bg-[#151D2A] border border-[#1E293B] rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
          <div>
            <h3 className="font-bold text-white text-base">
              Season Closing Line Value (CLV) Performance
            </h3>
            <p className="text-xs text-slate-400">
              Measuring long-term decision edge against the closing Vegas consensus spread.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Weeks 1–4 Aggregate</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-400 border-b border-[#1E293B] font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-2">Rank</th>
                <th className="py-3 px-3">Franchise</th>
                <th className="py-3 px-3">Actual Points</th>
                <th className="py-3 px-3">Closing Line EV</th>
                <th className="py-3 px-3">Luck Factor (&Delta;EV)</th>
                <th className="py-3 px-3">Underdog Hit Rate</th>
                <th className="py-3 px-3">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] font-mono text-xs">
              {teams.map((team, idx) => (
                <tr key={team.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-2 font-bold text-slate-400">#{idx + 1}</td>
                  <td className="py-3 px-3 font-sans font-bold text-white flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-black"
                      style={{ backgroundColor: team.color }}
                    >
                      {team.avatar}
                    </span>
                    <span>{team.ownerName} ({team.teamName})</span>
                  </td>
                  <td className="py-3 px-3 text-slate-100 font-bold">{team.actualPoints} pts</td>
                  <td className="py-3 px-3 text-slate-300">{team.closingLineEV} pts</td>
                  <td className={`py-3 px-3 font-bold ${team.netEV >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {team.netEV >= 0 ? `+${team.netEV}` : team.netEV} pts
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {team.id === 'team-todd' ? '41.7%' : team.id === 'team-dave' ? '12.5%' : '28.0%'}
                  </td>
                  <td className="py-3 px-3 font-sans">
                    {team.luckQuadrant === 1 ? (
                      <span className="text-emerald-400 font-bold text-[11px]">The Elites</span>
                    ) : team.luckQuadrant === 2 ? (
                      <span className="text-amber-400 font-semibold text-[11px]">Lucky Fraud</span>
                    ) : team.luckQuadrant === 4 ? (
                      <span className="text-red-400 font-semibold text-[11px]">Unlucky Sniper</span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Homer</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
