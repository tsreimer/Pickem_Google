import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useTeam } from '../context/TeamContext';
import { INITIAL_TEAMS } from '../data/mockData';
import {
  getTeamSeasonAccuracy,
  WeeklyAccuracyRecord,
  LEAGUE_SEASON_BENCHMARKS,
} from '../data/seasonAccuracyData';
import {
  TrendingUp,
  BarChart3,
  Target,
  Award,
  Zap,
  Shield,
  ChevronDown,
  ChevronUp,
  Flame,
  CheckCircle2,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Activity,
  Radio,
  Sparkles,
} from 'lucide-react';

type MetricMode = 'accuracy' | 'efficiency' | 'cumulative' | 'anchors';
type ChartStyle = 'area' | 'line' | 'bar';

export const SeasonPickAccuracyTrends: React.FC = () => {
  const { currentTeam, setCurrentTeamId, setIsCommentarySidebarOpen } = useTeam();

  const [selectedTeamId, setSelectedTeamId] = useState<string>(currentTeam?.id || 'team-todd');
  const [metricMode, setMetricMode] = useState<MetricMode>('accuracy');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('area');
  const [showLeagueAvg, setShowLeagueAvg] = useState<boolean>(true);
  const [showVegasChalk, setShowVegasChalk] = useState<boolean>(true);
  const [showBreakEven, setShowBreakEven] = useState<boolean>(true);
  const [showGranularTable, setShowGranularTable] = useState<boolean>(false);
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);

  // Sync with currentTeam if it changes outside
  React.useEffect(() => {
    if (currentTeam?.id) {
      setSelectedTeamId(currentTeam.id);
    }
  }, [currentTeam?.id]);

  const activeTeamMeta = useMemo(() => {
    return (
      INITIAL_TEAMS.find((t) => t.id === selectedTeamId) ||
      INITIAL_TEAMS.find((t) => t.id === 'team-todd') ||
      INITIAL_TEAMS[0]
    );
  }, [selectedTeamId]);

  const teamData = useMemo(() => {
    return getTeamSeasonAccuracy(
      activeTeamMeta.id,
      activeTeamMeta.teamName,
      activeTeamMeta.ownerName,
      activeTeamMeta.color
    );
  }, [activeTeamMeta]);

  // Format data for Recharts based on chosen metric
  const chartData = useMemo(() => {
    return teamData.weeklyTrends.map((w) => {
      let teamVal = w.accuracy;
      let leagueVal = w.leagueAvgAccuracy;
      let vegasVal = w.vegasFavoriteAccuracy;

      if (metricMode === 'efficiency') {
        teamVal = w.confidenceEfficiency;
        leagueVal = w.leagueAvgEfficiency;
        vegasVal = 67.0; // Benchmark confidence efficiency of chalk
      } else if (metricMode === 'cumulative') {
        teamVal = w.cumulativeAccuracy;
        leagueVal = w.cumulativeLeagueAvg;
        vegasVal = LEAGUE_SEASON_BENCHMARKS.vegasChalkAccuracy;
      } else if (metricMode === 'anchors') {
        teamVal = w.anchorAccuracy;
        leagueVal = 72.0; // League anchor average
        vegasVal = 75.0; // Vegas heavy favorite win %
      }

      return {
        week: w.week,
        weekLabel: w.weekLabel,
        teamScore: teamVal,
        leagueAvg: leagueVal,
        vegasChalk: vegasVal,
        topPerformer: w.topPerformerAccuracy,
        pointsEarned: w.pointsEarned,
        pointsPossible: w.pointsPossible,
        correctCount: w.correctCount,
        gamesCount: w.gamesCount,
        anchorRecord: w.anchorRecord,
        weeklyRank: w.weeklyRank,
        highlight: w.highlight,
        notes: w.notes,
      };
    });
  }, [teamData, metricMode]);

  // Metric labels and descriptions
  const metricConfig = useMemo(() => {
    switch (metricMode) {
      case 'efficiency':
        return {
          title: 'Confidence Point Conversion Efficiency (%)',
          teamLabel: `${activeTeamMeta.ownerName} Efficiency`,
          leagueLabel: 'League Avg Efficiency',
          vegasLabel: 'Chalk Baseline (67%)',
          unit: '%',
          domain: [40, 100],
          description: 'Calculates points won as a percentage of total possible confidence points (136 pts/wk). Rewards high-anchor protection.',
        };
      case 'cumulative':
        return {
          title: 'Cumulative Season Accuracy Trajectory (%)',
          teamLabel: `${activeTeamMeta.ownerName} Cumulative %`,
          leagueLabel: 'League Cumulative Avg',
          vegasLabel: 'Vegas Season Average',
          unit: '%',
          domain: [45, 90],
          description: 'Tracks season-long trajectory over time, demonstrating resilience against late-slate upsets.',
        };
      case 'anchors':
        return {
          title: 'Heavy Anchor Conversion Rate (13–16 Pts) (%)',
          teamLabel: `${activeTeamMeta.ownerName} Anchors`,
          leagueLabel: 'League Anchor Hit Rate',
          vegasLabel: 'Top 4 Favorites Win Rate',
          unit: '%',
          domain: [40, 100],
          description: 'Hit rate exclusively on each week’s highest 4 confidence assignments (13, 14, 15, 16). The key to winning the pool.',
        };
      case 'accuracy':
      default:
        return {
          title: 'Straight-Up Pick Accuracy Rate (%)',
          teamLabel: `${activeTeamMeta.ownerName} Accuracy`,
          leagueLabel: 'League Median Accuracy',
          vegasLabel: 'Vegas Chalk Win %',
          unit: '%',
          domain: [40, 95],
          description: 'Percentage of total NFL games predicted correctly straight up, irrespective of assigned confidence weight.',
        };
    }
  }, [metricMode, activeTeamMeta]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const teamVal = dataPoint.teamScore;
      const leagueVal = dataPoint.leagueAvg;
      const diff = (teamVal - leagueVal).toFixed(1);
      const isPositive = Number(diff) >= 0;

      return (
        <div className="rounded-xl bg-[#0B101B]/95 border border-slate-700/80 p-4 shadow-2xl backdrop-blur-md text-xs space-y-3 min-w-[260px] max-w-[320px] pointer-events-none z-50">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-bold font-mono">
                {dataPoint.weekLabel}
              </span>
              <span className="font-bold text-white">NFL Slate Performance</span>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
              Rank #{dataPoint.weeklyRank}
            </span>
          </div>

          {/* Core Values */}
          <div className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeTeamMeta.color }}></span>
                <span>{activeTeamMeta.ownerName}:</span>
              </span>
              <span className="font-bold text-base text-white">
                {teamVal.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>League Average:</span>
              <span>{leagueVal.toFixed(1)}%</span>
            </div>

            {showVegasChalk && (
              <div className="flex items-center justify-between text-cyan-400/90">
                <span>Vegas Consensus:</span>
                <span>{dataPoint.vegasChalk.toFixed(1)}%</span>
              </div>
            )}

            {/* Differential */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">Vs. League Avg:</span>
              <span
                className={`font-bold flex items-center gap-0.5 ${
                  isPositive ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {isPositive ? `+${diff}%` : `${diff}%`}
              </span>
            </div>
          </div>

          {/* Granular Game and Point Breakdown */}
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Picks Correct</span>
              <span className="text-slate-200 font-bold">
                {dataPoint.correctCount} / {dataPoint.gamesCount}
              </span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Points Captured</span>
              <span className="text-emerald-400 font-bold">
                {dataPoint.pointsEarned} / {dataPoint.pointsPossible}
              </span>
            </div>
          </div>

          {/* Anchor record */}
          <div className="text-[11px] text-slate-300">
            <span className="text-slate-500">Anchors (13–16): </span>
            <strong className="text-amber-400">{dataPoint.anchorRecord}</strong>
          </div>

          {/* Highlight snippet */}
          {dataPoint.highlight && (
            <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/60 leading-tight">
              "{dataPoint.highlight}"
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const primaryTeamColor = activeTeamMeta.color || '#10B981';

  return (
    <section className="rounded-2xl bg-gradient-to-b from-[#131B2A] to-[#0D131F] border border-[#1E293B] p-5 sm:p-7 shadow-xl space-y-6">
      
      {/* =========================================================================
          1. HEADER & CONTROLS: Metric Selector, Franchise Switcher, Chart Mode
      ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>NFL Season Analytics Engine</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400">Recharts Visualizer</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Historical Pick Accuracy Trends
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Track week-by-week accuracy progression, confidence point capture rates, and high-anchor hit rates across the current NFL season against Yahoo Group #13003.
          </p>
        </div>

        {/* Team Selector & Quick Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:self-start lg:self-center">
          {/* Franchise Select Dropdown */}
          <div className="relative">
            <select
              value={selectedTeamId}
              onChange={(e) => {
                setSelectedTeamId(e.target.value);
                setCurrentTeamId(e.target.value);
              }}
              className="bg-[#182335] hover:bg-[#1E2C42] text-white text-xs font-bold py-2 pl-3 pr-8 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer transition appearance-none"
            >
              {INITIAL_TEAMS.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.ownerName} ({team.teamName})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Chart Style Toggle (Area, Line, Bar) */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setChartStyle('area')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${
                chartStyle === 'area'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Smooth Area Chart"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Area</span>
            </button>
            <button
              onClick={() => setChartStyle('line')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${
                chartStyle === 'line'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Precision Line Chart"
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Line</span>
            </button>
            <button
              onClick={() => setChartStyle('bar')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${
                chartStyle === 'bar'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Comparative Bar Chart"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bar</span>
            </button>
          </div>

          {/* AI Commentary Sidebar Trigger */}
          <button
            onClick={() => setIsCommentarySidebarOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-red-950/90 to-amber-950/90 hover:from-red-900 hover:to-amber-900 border border-red-800/80 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            title="Open Gemini AI Broadcast Commentary Sidebar"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">AI Commentary</span>
            <Sparkles className="w-3 h-3 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. METRIC TABS: Accuracy, Efficiency, Cumulative, Anchors
      ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Metric Mode Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
          <button
            onClick={() => setMetricMode('accuracy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              metricMode === 'accuracy'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Pick Accuracy %</span>
          </button>
          <button
            onClick={() => setMetricMode('efficiency')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              metricMode === 'efficiency'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Points Efficiency %</span>
          </button>
          <button
            onClick={() => setMetricMode('cumulative')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              metricMode === 'cumulative'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Cumulative Trend</span>
          </button>
          <button
            onClick={() => setMetricMode('anchors')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              metricMode === 'anchors'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Top Anchors (13–16)</span>
          </button>
        </div>

        {/* Benchmark Toggle Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setShowLeagueAvg(!showLeagueAvg)}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-bold transition flex items-center gap-1.5 ${
              showLeagueAvg
                ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>League Avg</span>
          </button>

          <button
            onClick={() => setShowVegasChalk(!showVegasChalk)}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-bold transition flex items-center gap-1.5 ${
              showVegasChalk
                ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Vegas Consensus</span>
          </button>

          <button
            onClick={() => setShowBreakEven(!showBreakEven)}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-bold transition flex items-center gap-1.5 ${
              showBreakEven
                ? 'bg-slate-800 border-slate-700 text-slate-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <Minus className="w-3 h-3" />
            <span>50% Baseline</span>
          </button>
        </div>
      </div>

      {/* Description subtitle */}
      <p className="text-xs text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80 flex items-center gap-2">
        <Info className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{metricConfig.description}</span>
      </p>

      {/* =========================================================================
          3. RECHARTS CANVAS CONTAINER
      ========================================================================= */}
      <div className="w-full bg-[#0C121D]/90 rounded-xl border border-slate-800 p-3 sm:p-5">
        <div className="h-[320px] sm:h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartStyle === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                <defs>
                  {/* Primary Franchise Gradient */}
                  <linearGradient id="teamGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryTeamColor} stopOpacity={0.45} />
                    <stop offset="95%" stopColor={primaryTeamColor} stopOpacity={0.0} />
                  </linearGradient>

                  {/* League Average Gradient */}
                  <linearGradient id="leagueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />

                <XAxis
                  dataKey="weekLabel"
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#1E293B' }}
                />

                <YAxis
                  domain={metricConfig.domain}
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#1E293B' }}
                  tickFormatter={(val) => `${val}%`}
                />

                <Tooltip content={<CustomTooltip />} />

                {showBreakEven && (
                  <ReferenceLine
                    y={50}
                    stroke="#475569"
                    strokeDasharray="4 4"
                    label={{
                      value: '50% Breakeven',
                      fill: '#64748B',
                      fontSize: 10,
                      position: 'insideBottomLeft',
                    }}
                  />
                )}

                {showLeagueAvg && (
                  <Area
                    type="monotone"
                    dataKey="leagueAvg"
                    name="League Avg"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#leagueGradient)"
                    dot={{ r: 3, fill: '#F59E0B' }}
                    activeDot={{ r: 5 }}
                  />
                )}

                {showVegasChalk && (
                  <Line
                    type="monotone"
                    dataKey="vegasChalk"
                    name="Vegas Consensus"
                    stroke="#06B6D4"
                    strokeWidth={1.8}
                    strokeDasharray="2 2"
                    dot={false}
                  />
                )}

                <Area
                  type="monotone"
                  dataKey="teamScore"
                  name={activeTeamMeta.ownerName}
                  stroke={primaryTeamColor}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#teamGradient)"
                  dot={{ r: 4, fill: primaryTeamColor, stroke: '#0B101B', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: primaryTeamColor, stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </AreaChart>
            ) : chartStyle === 'line' ? (
              <LineChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />

                <XAxis
                  dataKey="weekLabel"
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#1E293B' }}
                />

                <YAxis
                  domain={metricConfig.domain}
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#1E293B' }}
                  tickFormatter={(val) => `${val}%`}
                />

                <Tooltip content={<CustomTooltip />} />

                {showBreakEven && (
                  <ReferenceLine
                    y={50}
                    stroke="#475569"
                    strokeDasharray="4 4"
                    label={{
                      value: '50% Breakeven',
                      fill: '#64748B',
                      fontSize: 10,
                      position: 'insideBottomLeft',
                    }}
                  />
                )}

                {showLeagueAvg && (
                  <Line
                    type="monotone"
                    dataKey="leagueAvg"
                    name="League Avg"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#F59E0B' }}
                    activeDot={{ r: 5 }}
                  />
                )}

                {showVegasChalk && (
                  <Line
                    type="monotone"
                    dataKey="vegasChalk"
                    name="Vegas Consensus"
                    stroke="#06B6D4"
                    strokeWidth={1.8}
                    strokeDasharray="2 2"
                    dot={false}
                  />
                )}

                <Line
                  type="monotone"
                  dataKey="teamScore"
                  name={activeTeamMeta.ownerName}
                  stroke={primaryTeamColor}
                  strokeWidth={3}
                  dot={{ r: 4, fill: primaryTeamColor, stroke: '#0B101B', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: primaryTeamColor, stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />

                <XAxis
                  dataKey="weekLabel"
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#1E293B' }}
                />

                <YAxis
                  domain={metricConfig.domain}
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#1E293B' }}
                  tickFormatter={(val) => `${val}%`}
                />

                <Tooltip content={<CustomTooltip />} />

                {showBreakEven && (
                  <ReferenceLine
                    y={50}
                    stroke="#475569"
                    strokeDasharray="4 4"
                    label={{
                      value: '50% Breakeven',
                      fill: '#64748B',
                      fontSize: 10,
                      position: 'insideBottomLeft',
                    }}
                  />
                )}

                <Bar
                  dataKey="teamScore"
                  name={activeTeamMeta.ownerName}
                  fill={primaryTeamColor}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />

                {showLeagueAvg && (
                  <Bar
                    dataKey="leagueAvg"
                    name="League Avg"
                    fill="#F59E0B"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                    fillOpacity={0.7}
                  />
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Visual Legend Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-2 border-t border-slate-800/80 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryTeamColor }}></span>
              <span className="text-white font-bold">{activeTeamMeta.ownerName} ({teamData.teamName})</span>
            </div>

            {showLeagueAvg && (
              <div className="flex items-center gap-2 text-amber-400">
                <span className="w-3 h-0.5 bg-amber-400"></span>
                <span>League Median ({LEAGUE_SEASON_BENCHMARKS.leagueAverageAccuracy}%)</span>
              </div>
            )}

            {showVegasChalk && (
              <div className="flex items-center gap-2 text-cyan-400">
                <span className="w-3 h-0.5 bg-cyan-400"></span>
                <span>Vegas Favorites ({LEAGUE_SEASON_BENCHMARKS.vegasChalkAccuracy}%)</span>
              </div>
            )}
          </div>

          <span className="text-slate-500 text-[11px]">
            Week 1–7 NFL Regular Season • Yahoo #13003
          </span>
        </div>
      </div>

      {/* =========================================================================
          4. PERFORMANCE SUMMARY KPI CARDS
      ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Season Accuracy */}
        <div className="p-4 rounded-xl bg-[#0F1624] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Season Straight Accuracy</span>
            <Target className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {teamData.currentSeasonAccuracy}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({teamData.seasonRecord})
            </span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="font-bold">Rank #{teamData.leagueAccuracyRank}</span>
            <span className="text-slate-500">•</span>
            <span>
              {(teamData.currentSeasonAccuracy - LEAGUE_SEASON_BENCHMARKS.leagueAverageAccuracy).toFixed(1)}% vs. League
            </span>
          </div>
        </div>

        {/* Card 2: Confidence Efficiency */}
        <div className="p-4 rounded-xl bg-[#0F1624] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Confidence Efficiency</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {teamData.currentSeasonEfficiency}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({teamData.totalPointsScored} / {teamData.totalPointsPossible} pts)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            Grade: <strong className="text-emerald-300">A (Masterful Anchors)</strong>
          </p>
        </div>

        {/* Card 3: Top Anchors Conversion */}
        <div className="p-4 rounded-xl bg-[#0F1624] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Top 4 Anchors (13–16)</span>
            <Shield className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-300 font-mono">
              {teamData.anchorHitRate}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              Hit Rate
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {teamData.momentumText}
          </p>
        </div>

        {/* Card 4: Best & Toughest Weeks */}
        <div className="p-4 rounded-xl bg-[#0F1624] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Season Extremes</span>
            <Award className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="space-y-0.5 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-semibold">Peak: Wk {teamData.bestWeek.week}</span>
              <span className="text-white font-bold">{teamData.bestWeek.accuracy}% ({teamData.bestWeek.points} pts)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-red-400 font-semibold">Floor: Wk {teamData.toughestWeek.week}</span>
              <span className="text-slate-300">{teamData.toughestWeek.accuracy}% ({teamData.toughestWeek.points} pts)</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. COLLAPSIBLE GRANULAR WEEK-BY-WEEK ACCURACY LEDGER
      ========================================================================= */}
      <div className="border-t border-slate-800/80 pt-2">
        <button
          onClick={() => setShowGranularTable(!showGranularTable)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-400 hover:text-slate-200 transition py-2 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>
              {showGranularTable ? 'Hide Weekly Accuracy Ledger' : 'View Full Week-by-Week Accuracy Ledger (Weeks 1–7)'}
            </span>
          </span>
          {showGranularTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showGranularTable && (
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-800 bg-[#0B101B]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#121927] border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Week</th>
                  <th className="py-2.5 px-3">Record (W-L)</th>
                  <th className="py-2.5 px-3">Accuracy %</th>
                  <th className="py-2.5 px-3">Pts Scored</th>
                  <th className="py-2.5 px-3">Efficiency %</th>
                  <th className="py-2.5 px-3">League Avg</th>
                  <th className="py-2.5 px-3">Anchors (13–16)</th>
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3 font-sans">Tactical Highlight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {teamData.weeklyTrends.map((w) => {
                  const isBeatLeague = w.accuracy >= w.leagueAvgAccuracy;
                  return (
                    <tr
                      key={w.week}
                      className="hover:bg-slate-800/50 transition cursor-default"
                      onMouseEnter={() => setHoveredWeek(w.week)}
                      onMouseLeave={() => setHoveredWeek(null)}
                    >
                      <td className="py-2.5 px-3 font-bold text-white">
                        {w.weekLabel}
                      </td>
                      <td className="py-2.5 px-3">
                        {w.correctCount}-{w.gamesCount - w.correctCount}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-400">
                        {w.accuracy.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3">
                        {w.pointsEarned} <span className="text-slate-500">/ {w.pointsPossible}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        {w.confidenceEfficiency.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={isBeatLeague ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                          {w.leagueAvgAccuracy.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-purple-300">
                        {w.anchorRecord}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          #{w.weeklyRank}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-400 max-w-xs truncate" title={w.highlight}>
                        {w.highlight}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
