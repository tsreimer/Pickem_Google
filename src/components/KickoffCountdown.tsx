import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Radio, CheckCircle2, Lock } from 'lucide-react';

interface KickoffCountdownProps {
  /** Target timestamp in ISO string or Date, or approximate time string */
  targetTime?: string;
  /** Status of the game or window: 'scheduled' | 'in_progress' | 'final' | 'locked' | 'synced' */
  status?: string;
  /** Quarter and clock if in progress (e.g. "Q4" and "01:18") */
  liveClock?: string;
  liveQuarter?: string;
  /** Label to display */
  labelPrefix?: string;
  /** Compact badge mode vs full card header */
  compact?: boolean;
  /** Default offset minutes from now if simulating a game day countdown */
  defaultMinutesRemaining?: number;
}

export const KickoffCountdown: React.FC<KickoffCountdownProps> = ({
  targetTime,
  status = 'scheduled',
  liveClock = '01:18',
  liveQuarter = 'Q4',
  labelPrefix = 'Locks in',
  compact = false,
  defaultMinutesRemaining = 125,
}) => {
  // Compute remaining seconds from targetTime or default
  const computeInitialSeconds = (): number => {
    if (status === 'final' || status === 'synced') return 0;
    if (status === 'in_progress' || (status === 'locked' && liveClock)) return -1; // Live

    if (targetTime) {
      const targetDate = new Date(targetTime).getTime();
      const now = Date.now();
      const diff = Math.floor((targetDate - now) / 1000);
      if (!isNaN(diff) && diff > 0) return diff;
    }
    // Fallback simulation timer based on provided minutes
    return defaultMinutesRemaining * 60;
  };

  const [secondsRemaining, setSecondsRemaining] = useState<number>(computeInitialSeconds);

  useEffect(() => {
    if (status === 'final' || status === 'synced' || status === 'in_progress') {
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  // Format HH:MM:SS
  const formatTime = (totalSec: number) => {
    if (totalSec <= 0) return '00:00';
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    }
    return `${pad(minutes)}m ${pad(seconds)}s`;
  };

  // Case 1: Final game
  if (status === 'final') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-mono font-bold rounded-lg ${
          compact
            ? 'px-2 py-0.5 text-[10px] bg-slate-800/80 text-slate-300 border border-slate-700'
            : 'px-2.5 py-1 text-xs bg-slate-900/90 text-slate-300 border border-slate-800'
        }`}
      >
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        <span>FINAL</span>
      </span>
    );
  }

  // Case 2: Live In Progress / Sweat
  if (status === 'in_progress' || (status === 'locked' && liveClock)) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-mono font-bold rounded-lg animate-pulse ${
          compact
            ? 'px-2 py-0.5 text-[10px] bg-red-950/80 text-red-300 border border-red-500/50'
            : 'px-2.5 py-1 text-xs bg-red-950/90 text-red-200 border border-red-500/60 shadow-lg shadow-red-950/40'
        }`}
      >
        <Radio className="w-3 h-3 text-red-400 animate-spin" />
        <span>LIVE &bull; {liveQuarter} {liveClock}</span>
      </span>
    );
  }

  // Case 3: Locked without active clock
  if (status === 'locked' || secondsRemaining === 0) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-mono font-bold rounded-lg ${
          compact
            ? 'px-2 py-0.5 text-[10px] bg-amber-950/70 text-amber-300 border border-amber-500/40'
            : 'px-2.5 py-1 text-xs bg-amber-950/80 text-amber-200 border border-amber-500/50'
        }`}
      >
        <Lock className="w-3 h-3 text-amber-400" />
        <span>LOCKED AT KICKOFF</span>
      </span>
    );
  }

  // Case 4: Scheduled Countdown
  const isImminent = secondsRemaining < 900; // Under 15 minutes
  const isUrgent = secondsRemaining < 3600; // Under 1 hour

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-bold rounded-lg transition-colors ${
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${
        isImminent
          ? 'bg-red-950/90 text-red-200 border border-red-500 animate-pulse shadow-md shadow-red-900/30'
          : isUrgent
          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
          : 'bg-slate-900/90 text-cyan-300 border border-slate-700'
      }`}
    >
      {isImminent ? (
        <AlertTriangle className="w-3 h-3 text-red-400" />
      ) : (
        <Clock className={`w-3 h-3 ${isUrgent ? 'text-amber-400' : 'text-cyan-400'}`} />
      )}
      <span>
        {labelPrefix} {formatTime(secondsRemaining)}
      </span>
    </span>
  );
};
