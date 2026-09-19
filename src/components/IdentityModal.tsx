import React from 'react';
import { useTeam } from '../context/TeamContext';
import { Check, X, Shield, Sparkles } from 'lucide-react';

export const IdentityModal: React.FC = () => {
  const { teams, currentTeam, setCurrentTeamId, isIdentityModalOpen, setIsIdentityModalOpen } = useTeam();

  if (!isIdentityModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#151D2A] border border-[#1E293B] rounded-2xl w-full max-w-xl p-6 shadow-2xl relative space-y-5">
        
        {/* Close Button */}
        <button
          onClick={() => setIsIdentityModalOpen(false)}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Section 6.0 • Zero-Password Identity</span>
          </div>
          <h2 className="text-xl font-black text-white">Select Your League Persona</h2>
          <p className="text-xs text-slate-400 mt-1">
            No friction, no passwords. Select any team below to see real-time standings, pick cards, and sweat rooms from their perspective. Stored locally in your browser.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {teams.map(team => {
            const isSelected = team.id === currentTeam.id;
            return (
              <button
                key={team.id}
                onClick={() => {
                  setCurrentTeamId(team.id);
                  setIsIdentityModalOpen(false);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all relative flex items-start gap-3 ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500/80 shadow-lg shadow-emerald-950/40'
                    : 'bg-[#0B0F17] border-[#1E293B] hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-black shrink-0 shadow-md"
                  style={{ backgroundColor: team.color }}
                >
                  {team.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-sm text-white truncate">
                      {team.ownerName}
                    </span>
                    {isSelected && (
                      <span className="p-0.5 rounded-full bg-emerald-500 text-black">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {team.teamName}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Rank #{team.rank}</span>
                    <span className="text-emerald-400 font-bold">{team.lockedPoints + team.activeSweatPoints} pts</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Session Info */}
        <div className="p-3 bg-[#0B0F17] rounded-xl border border-[#1E293B] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Current Token: <code className="font-mono text-emerald-300">pickem_team_id={currentTeam.id}</code></span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Persistent</span>
        </div>

      </div>
    </div>
  );
};
