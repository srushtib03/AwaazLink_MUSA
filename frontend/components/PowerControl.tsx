
import React from 'react';

interface PowerControlProps {
  isPressed: boolean;
  cutoffEnabled: boolean;
  onToggleCutoff: () => void;
}

export const PowerControl: React.FC<PowerControlProps> = ({ 
  isPressed, 
  cutoffEnabled,
  onToggleCutoff
}) => {
  return (
    <div className="glass-panel p-6 rounded-xl h-full flex flex-col justify-between">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
           <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Cut Standby</h3>
           <span className="text-[8px] text-slate-500 uppercase tracking-tighter">Hardware Cutoff Protocol</span>
        </div>
        <button 
          onClick={onToggleCutoff}
          className={`px-4 py-1.5 rounded text-[10px] font-bold transition-all border ${
            cutoffEnabled 
              ? 'bg-amber-500/20 border-amber-500 text-amber-400 glow-amber' 
              : 'bg-slate-900 border-slate-700 text-slate-500'
          }`}
        >
          {cutoffEnabled ? 'SHIELD: ON' : 'SHIELD: OFF'}
        </button>
      </div>

      <div className="relative flex flex-col items-center justify-center py-10 bg-black/40 rounded-lg border border-white/5 overflow-hidden">
        {/* Animated Background for the "Crystal" feel when pressed */}
        {isPressed && (
          <div className="absolute inset-0 bg-amber-500/5 animate-pulse"></div>
        )}
        
        <div className={`z-10 w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
          isPressed 
            ? 'border-amber-400 bg-amber-500/10 scale-110 glow-amber' 
            : 'border-slate-800 bg-transparent'
        }`}>
           <div className={`w-8 h-8 rounded transform rotate-45 border-2 ${isPressed ? 'bg-amber-400 border-amber-300' : 'bg-transparent border-slate-700'}`}></div>
        </div>
        
        <div className="mt-8 text-center z-10">
          <p className="text-slate-500 text-[9px] uppercase font-bold tracking-[0.3em] mb-3">Manual Core Override</p>
          <div className="flex gap-3 items-center justify-center">
             <kbd className={`px-4 py-1 rounded bg-slate-900 border-2 transition-all ${isPressed ? 'border-amber-400 text-amber-400' : 'border-slate-700 text-slate-600'}`}>SPACE</kbd>
             <div className="flex flex-col items-start leading-none">
               <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">Press & Hold</span>
               <span className="text-[8px] text-slate-500 uppercase font-medium">To Engage Module</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
