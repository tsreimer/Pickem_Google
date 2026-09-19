import React, { useState } from 'react';
import { useTeam } from '../context/TeamContext';
import { X, BookOpen, Layers, Terminal, Scale, ShieldCheck, Database, Smartphone, CheckCircle } from 'lucide-react';

export const ArchitectureSpecModal: React.FC = () => {
  const { isSpecModalOpen, setIsSpecModalOpen } = useTeam();
  const [activeSection, setActiveSection] = useState<'architecture' | 'ilp' | 'clinch' | 'schema' | 'media'>('architecture');

  if (!isSpecModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#151D2A] border border-[#1E293B] rounded-2xl w-full max-w-4xl h-[85vh] p-6 shadow-2xl relative flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">NFL Pick'em System Architecture & Functional Spec</h2>
              <p className="text-xs text-slate-400">Target Stack: Next.js Edge • Supabase Realtime • Python ILP Engine • Playwright</p>
            </div>
          </div>
          <button
            onClick={() => setIsSpecModalOpen(false)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 py-3 border-b border-[#1E293B] overflow-x-auto shrink-0 text-xs font-mono">
          <button
            onClick={() => setActiveSection('architecture')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeSection === 'architecture'
                ? 'bg-emerald-500 text-black font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            1. System Topography & Ingestion
          </button>
          <button
            onClick={() => setActiveSection('ilp')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeSection === 'ilp'
                ? 'bg-emerald-500 text-black font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            2. ILP Game Theory Optimization
          </button>
          <button
            onClick={() => setActiveSection('clinch')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeSection === 'clinch'
                ? 'bg-emerald-500 text-black font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            3. Deterministic Clinch Engine
          </button>
          <button
            onClick={() => setActiveSection('schema')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeSection === 'schema'
                ? 'bg-emerald-500 text-black font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            4. Supabase / Postgres Schema
          </button>
          <button
            onClick={() => setActiveSection('media')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeSection === 'media'
                ? 'bg-emerald-500 text-black font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            5. Multimedia AI Pipeline
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 text-slate-300 text-xs leading-relaxed pr-2">
          
          {activeSection === 'architecture' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#0B0F17] rounded-xl border border-[#1E293B] space-y-3">
                <span className="text-emerald-400 font-mono font-bold text-xs uppercase">Section 1.0 & 2.0 • End-to-End Pipeline</span>
                <p>
                  The platform operates on an event-driven decoupled architecture. Live scraping pipelines and integer linear programming solvers execute asynchronously on scheduled cron triggers, synchronizing state with PostgreSQL tables in Supabase.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center text-xs font-mono pt-2">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-slate-400 text-[10px]">INPUT SOURCES</div>
                    <div className="font-bold text-white mt-1">Yahoo + Odds API</div>
                    <div className="text-[10px] text-slate-500 mt-1">Spreads, Over/Under, Vig-free</div>
                  </div>
                  <div className="p-3 bg-emerald-950/40 rounded-lg border border-emerald-800">
                    <div className="text-emerald-400 text-[10px]">COMPUTE ENGINE</div>
                    <div className="font-bold text-emerald-300 mt-1">PuLP ILP Solver</div>
                    <div className="text-[10px] text-emerald-500 mt-1">Game Tree & Clinch Permutations</div>
                  </div>
                  <div className="p-3 bg-blue-950/40 rounded-lg border border-blue-800">
                    <div className="text-blue-400 text-[10px]">STATE & REALTIME</div>
                    <div className="font-bold text-blue-300 mt-1">Postgres + WSS</div>
                    <div className="text-[10px] text-blue-500 mt-1">Live deltas & social banter</div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-slate-400 text-[10px]">EDGE CLIENT</div>
                    <div className="font-bold text-white mt-1">Next.js / PWA</div>
                    <div className="text-[10px] text-slate-500 mt-1">Zero-password identity</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#0B0F17] rounded-xl border border-[#1E293B] space-y-2">
                <span className="text-amber-400 font-mono font-bold text-xs uppercase">Automated Pipeline Cadence</span>
                <ul className="space-y-1.5 font-mono text-[11px] text-slate-300">
                  <li>• <span className="text-white font-bold">Tue/Thu 12:00 PM:</span> sync_odds.py queries The Odds API for consensus spreads & probabilities.</li>
                  <li>• <span className="text-white font-bold">Thu 7:00 & 8:15 PM:</span> sync_picks.py locks submitted cards and alerts delinquent pickers.</li>
                  <li>• <span className="text-white font-bold">Sun 1:00 – 7:30 PM:</span> sync_live.py (3m cron) monitors margin ≤ 8 in Q4 and computes live point shifts.</li>
                  <li>• <span className="text-white font-bold">Sun 7:45 PM:</span> solve_clinch.py calculates deterministic $2^R$ discrete endgame branches.</li>
                  <li>• <span className="text-white font-bold">Tue 2:00 AM:</span> generate_media.py synthesizes audio postgame roasts and victory anthems.</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'ilp' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#0B0F17] rounded-xl border border-[#1E293B] space-y-3">
                <span className="text-emerald-400 font-mono font-bold text-xs uppercase">Section 3.0 • Integer Linear Programming Formulation</span>
                <p>
                  Confidence pools are game-theoretic resource allocation problems. The solver maps each game i to a unique integer confidence point k using binary indicator variables z(i,k) in {'{0, 1}'} subject to sum_k z(i,k) = 1 and sum_i z(i,k) = 1.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                    <div className="text-emerald-400 font-mono font-bold text-xs">Lane 1: Weekly Bounty (1st Place)</div>
                    <div className="p-2 bg-black rounded font-mono text-[11px] text-emerald-300">
                      {'max ∑ [ k • z_{i,k} • ( (p_i - λ q_i)x_i + ((1-p_i) - λ(1-q_i))(1-x_i) ) ]'}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Maximizes 95th-percentile right-tail variance by penalizing public consensus picks (q_i) and boosting high-leverage underdogs where p_i &gt;&gt; q_i.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                    <div className="text-blue-400 font-mono font-bold text-xs">Lane 2: Season Podium (Top 3)</div>
                    <div className="p-2 bg-black rounded font-mono text-[11px] text-blue-300">
                      {'max ∑ [ k • z_{i,k} • E[Points_i] ] - β ∑ [ k • σ_i² ]'}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Maximizes expected value while penalizing variance based on distance to the podium cutoff.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'clinch' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#0B0F17] rounded-xl border border-[#1E293B] space-y-3">
                <span className="text-emerald-400 font-mono font-bold text-xs uppercase">Section 4.0 • Deterministic Clinch & Endgame Solver</span>
                <p>
                  When remaining games $R \le 4$, Monte Carlo simulations terminate and the solver enumerates all $2^R$ discrete slate outcomes.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-white">
                      <span>Branch A: SF 49ers Win (Favorite)</span>
                      <span className="text-emerald-400 font-mono">68% Vegas</span>
                    </div>
                    <div className="text-[11px] text-slate-400 space-y-1">
                      <div>• Leader Dave picked SF (12 pts) &rarr; Final Score: 118 pts</div>
                      <div>• Chaser Todd picked SF (14 pts) &rarr; Final Score: 114 pts</div>
                      <div className="text-red-400 font-semibold pt-1">Outcome: Dave clinches 1st Place. Todd finishes 2nd.</div>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-emerald-800/80 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-white">
                      <span>Branch B: SEA Seahawks Win (Underdog)</span>
                      <span className="text-amber-400 font-mono">32% Vegas</span>
                    </div>
                    <div className="text-[11px] text-slate-400 space-y-1">
                      <div>• Leader Dave loses SF (12 pts) &rarr; Final Score: 106 pts</div>
                      <div>• Chaser Todd hits SEA (14 pts) &rarr; Final Score: 114 pts</div>
                      <div className="text-emerald-400 font-semibold pt-1">Outcome: Todd steals 1st Place ($Weekly Payout).</div>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-amber-950/40 border border-amber-800 rounded text-xs text-amber-200">
                  <strong>Automated Pivot Recommendation:</strong> Todd has a 0% mathematical chance of 1st place if copying Dave's SF pick. Todd MUST execute a Forced Underdog Pivot to Seattle to preserve 32% payout equity.
                </div>
              </div>
            </div>
          )}

          {activeSection === 'schema' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#0B0F17] rounded-xl border border-[#1E293B] space-y-3 font-mono text-xs">
                <span className="text-emerald-400 font-bold uppercase">Section 5.0 • PostgreSQL / Supabase Schema</span>
                <pre className="p-3 bg-black rounded border border-slate-800 overflow-x-auto text-[11px] text-slate-300">
{`CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    yahoo_team_id VARCHAR(64) UNIQUE NOT NULL,
    team_name VARCHAR(128) NOT NULL,
    owner_name VARCHAR(128) NOT NULL,
    avatar_url TEXT
);

CREATE TABLE public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_team VARCHAR(32) NOT NULL,
    away_team VARCHAR(32) NOT NULL,
    home_score INT DEFAULT 0,
    away_score INT DEFAULT 0,
    status VARCHAR(32) DEFAULT 'scheduled',
    consensus_spread NUMERIC(4, 1),
    is_sweat_game BOOLEAN DEFAULT false
);

CREATE TABLE public.picks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id),
    game_id REFERENCES public.games(id),
    selected_team VARCHAR(32) NOT NULL,
    confidence_points INT CHECK (confidence_points BETWEEN 1 AND 16)
);`}
                </pre>
              </div>
            </div>
          )}

          {activeSection === 'media' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#0B0F17] rounded-xl border border-[#1E293B] space-y-3 font-mono text-xs">
                <span className="text-purple-400 font-bold uppercase">Section 8.0 • LLM Generative AI Postgame Show</span>
                <p className="font-sans text-slate-300">
                  Tuesday morning headless job formats week outcomes, queries Gemini with strict comedic and sports radio guardrails, and renders audio and radio transcripts with Text-to-Speech narration.
                </p>
                <div className="p-3 bg-black rounded border border-slate-800 text-[11px] text-purple-300">
                  Input: Week 4 results &bull; Choke: Dave (12 pts lost on Buffalo) &bull; Winner: Todd (14 pts hit on Chiefs)
                  <br />
                  Output: 60s radio commentary transcript, Synthwave victory anthem, Delta blues roast ballad.
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#1E293B] flex justify-between items-center shrink-0">
          <span className="text-[11px] font-mono text-slate-500">Autonomous Agent Blueprint Verified</span>
          <button
            onClick={() => setIsSpecModalOpen(false)}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition"
          >
            Close Spec
          </button>
        </div>

      </div>
    </div>
  );
};
