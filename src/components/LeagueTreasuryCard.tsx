import React, { useState } from 'react';
import { DollarSign, Trophy, Award, Shield, Check, Copy, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';

interface LeagueTreasuryCardProps {
  compact?: boolean;
}

export const LeagueTreasuryCard: React.FC<LeagueTreasuryCardProps> = ({ compact = false }) => {
  const [copiedVenmo, setCopiedVenmo] = useState(false);

  const handleCopyVenmo = () => {
    navigator.clipboard.writeText('@Todd-Reimer');
    setCopiedVenmo(true);
    setTimeout(() => setCopiedVenmo(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#111827] via-[#0F172A] to-[#0A0E17] border border-amber-500/30 p-5 sm:p-6 shadow-xl space-y-6 relative overflow-hidden">
      {/* Decorative ambient gradient */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <DollarSign className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              Official League Treasury
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            2026–2027 Initech Payout Structure
          </h2>
          <p className="text-xs text-slate-400">
            Total Prize Fund: <strong className="text-emerald-400">$600</strong> (12 Franchises &times; $50 Entry Dues)
          </p>
        </div>

        {/* Venmo Dues Action Badge */}
        <div className="flex items-center gap-2 bg-blue-950/40 border border-blue-800/60 p-2.5 rounded-xl self-start sm:self-auto">
          <div>
            <div className="text-[10px] font-mono uppercase text-blue-300 font-bold">
              Pay Dues via Venmo
            </div>
            <div className="text-sm font-black text-white font-mono">
              @Todd-Reimer
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              $50 / Franchise
            </div>
          </div>
          <button
            onClick={handleCopyVenmo}
            title="Copy Venmo Handle"
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer shrink-0 ml-1"
          >
            {copiedVenmo ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Recent Weekly Winners Highlight Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Week 2 Winner */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black text-base shadow-md shrink-0">
              👑
            </div>
            <div>
              <div className="text-xs font-black text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                <span>Week 2 Champion: Amy!</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-200 font-mono">
                  104 PTS
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Bird Boss claims the sole 1st place crown and the full <strong className="text-emerald-400">$25.00 payout</strong>!
              </p>
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-right shrink-0">
            <span className="text-[9px] font-mono text-slate-400 uppercase block">Payout</span>
            <span className="text-xs font-black text-emerald-400 font-mono">$25.00</span>
          </div>
        </div>

        {/* Week 1 Co-Champions */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-black text-base shadow-md shrink-0">
              🤝
            </div>
            <div>
              <div className="text-xs font-black text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                <span>Week 1 Co-Champs: Cory &amp; Dalton</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-200 font-mono">
                  102 PTS
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Split evenly per Article III: <strong className="text-emerald-400">$12.50 to Cory</strong> &amp; <strong className="text-emerald-400">$12.50 to Dalton</strong>.
              </p>
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-right shrink-0">
            <span className="text-[9px] font-mono text-slate-400 uppercase block">Split</span>
            <span className="text-xs font-black text-emerald-400 font-mono">$12.50 ea</span>
          </div>
        </div>
      </div>

      {/* Payout Breakdown Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Weekly Regular Season Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Weekly Winner
            </span>
            <span className="text-xs font-mono font-black text-emerald-400">
              $25 / wk
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            $450
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            18 Regular Season Weeks @ $25 per week. Tied high-scorers split the $25 prize evenly.
          </p>
        </div>

        {/* Playoff Champion Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Playoffs King
            </span>
            <span className="text-xs font-mono font-black text-amber-400">
              Weeks 1–4
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            $25
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Whomever tallies the most cumulative points across Playoff Weeks 1 through 4 (Wild Card to Super Bowl).
          </p>
        </div>

        {/* Season Champion Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Season Champion
            </span>
            <span className="text-xs font-mono font-black text-amber-400">
              1st Place
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono flex items-center gap-2">
            <span>$50</span>
            <span className="text-xs font-normal text-amber-400 font-sans">+ Trophy 🏆</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Awarded to the overall season point leader plus the official engraved league trophy.
          </p>
        </div>

        {/* 2nd & 3rd Place Podiums */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Podium Places
            </span>
            <span className="text-xs font-mono font-black text-slate-400">
              2nd &amp; 3rd
            </span>
          </div>
          <div className="text-sm font-black text-white font-mono flex items-center justify-between pt-1">
            <span>2nd Place:</span>
            <span className="text-emerald-400 text-base">$15</span>
          </div>
          <div className="text-sm font-black text-white font-mono flex items-center justify-between">
            <span>3rd Place:</span>
            <span className="text-emerald-400 text-base">$10</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-900">
            Trophy/Admin fund: $50
          </div>
        </div>
      </div>

      {/* Footer Rule Callout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 text-amber-300 font-medium">
          <Shield className="w-3.5 h-3.5 shrink-0" />
          <span>Article III Rule Enforced: Equal split on any tie &bull; Zero tiebreaker penalties</span>
        </div>
        <div className="font-mono text-slate-500 text-[10px]">
          12 Franchises &bull; Initech Invitational 2026–2027
        </div>
      </div>
    </div>
  );
};
