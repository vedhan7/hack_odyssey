import React from 'react';

export default function StatsCard({ title, value, icon, colorClass = "text-accent" }) {
  return (
    <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted mb-1">{title}</p>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
      </div>
      <div className={`p-4 rounded-xl bg-slate-800/50 ${colorClass}`}>
        {icon}
      </div>
    </div>
  );
}
