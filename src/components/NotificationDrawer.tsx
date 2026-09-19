import React, { useState } from 'react';
import { useTeam } from '../context/TeamContext';
import { X, Bell, BellRing, Smartphone, Check, Clock, AlertTriangle, Radio } from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const { isNotificationOpen, setIsNotificationOpen, notifications, markNotificationAsRead } = useTeam();
  const [pushSubscribed, setPushSubscribed] = useState(true);

  if (!isNotificationOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#151D2A] border-l border-[#1E293B] w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Automated Web Push Alerts</h3>
                <p className="text-[11px] font-mono text-slate-400">Section 9.0 • PWA Triggers</p>
              </div>
            </div>
            <button
              onClick={() => setIsNotificationOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Web Push State Card */}
          <div className="p-4 bg-[#0B0F17] rounded-xl border border-[#1E293B] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>PWA Standalone & Push State</span>
              </div>
              <button
                onClick={() => setPushSubscribed(!pushSubscribed)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition ${
                  pushSubscribed
                    ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                    : 'bg-slate-800 border border-slate-700 text-slate-400'
                }`}
              >
                {pushSubscribed ? '● Active Subscription' : 'Disabled'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Automated triggers fire when high-stakes sweat conditions are met (Q4 margin ≤ 8), Thursday lock deadlines approach, or new postgame audio media drops.
            </p>
          </div>

          {/* Notification List */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Recent Trigger Logs</span>
              <span className="text-[10px] font-mono text-slate-500">{notifications.length} logged</span>
            </div>

            {notifications.map(item => {
              const getIcon = () => {
                if (item.type === 'sweat') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
                if (item.type === 'integrity') return <Clock className="w-4 h-4 text-red-400" />;
                return <Radio className="w-4 h-4 text-purple-400" />;
              };

              return (
                <div
                  key={item.id}
                  onClick={() => markNotificationAsRead(item.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    item.read
                      ? 'bg-[#0B0F17]/60 border-[#1E293B] opacity-75'
                      : 'bg-[#0B0F17] border-emerald-900/60 shadow-md shadow-emerald-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getIcon()}
                      <span className="text-xs font-bold text-white">{item.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{item.timeAgo}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.body}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                    <span>{item.subtitle}</span>
                    {!item.read && <span className="text-emerald-400 font-bold">Unread</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#1E293B] space-y-2">
          <button
            onClick={() => setIsNotificationOpen(false)}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
          >
            Close Alert Center
          </button>
        </div>

      </div>
    </div>
  );
};
