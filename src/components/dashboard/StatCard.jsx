import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const colorMap = {
  primary: {
    bg: 'bg-primary-500/15',
    icon: 'text-primary-400',
    border: 'border-primary-500/20',
    value: 'text-primary-400',
    glow: 'shadow-glow',
  },
  green: {
    bg: 'bg-green-500/15',
    icon: 'text-green-400',
    border: 'border-green-500/20',
    value: 'text-green-400',
    glow: '',
  },
  blue: {
    bg: 'bg-blue-500/15',
    icon: 'text-blue-400',
    border: 'border-blue-500/20',
    value: 'text-blue-400',
    glow: '',
  },
  orange: {
    bg: 'bg-orange-500/15',
    icon: 'text-orange-400',
    border: 'border-orange-500/20',
    value: 'text-orange-400',
    glow: '',
  },
  purple: {
    bg: 'bg-purple-500/15',
    icon: 'text-purple-400',
    border: 'border-purple-500/20',
    value: 'text-purple-400',
    glow: '',
  },
};

export default function StatCard({ icon: Icon, label, value, trend, color = 'primary' }) {
  const c = colorMap[color] || colorMap.primary;

  return (
    <div className={`card p-5 border ${c.border} hover:scale-105 transition-all duration-300 cursor-default`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center ${c.glow}`}>
          <Icon size={20} className={c.icon} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className={`font-display text-2xl font-bold ${c.value} mb-1`}>{value}</p>
      <p className="text-gray-400 text-sm font-medium">{label}</p>
    </div>
  );
}
