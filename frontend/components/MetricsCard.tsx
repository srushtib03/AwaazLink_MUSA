
import React from 'react';

interface MetricsCardProps {
  label: string;
  value: string | number;
  unit: string;
  color?: string;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ 
  label, 
  value, 
  unit, 
  color = "text-amber-400" 
}) => {
  return (
    <div className="glass-panel p-5 rounded-xl flex flex-col justify-between transition-all hover:border-amber-500/50">
      <span className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] mb-2">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${color} font-mono tracking-tighter text-glow-amber`}>
          {value}
        </span>
        <span className="text-slate-600 text-[10px] font-bold uppercase">{unit}</span>
      </div>
    </div>
  );
};
