import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MetricsCard } from './components/MetricsCard';
import { PowerControl } from './components/PowerControl';
import { EnergyData, HardwareState } from './types';

const App: React.FC = () => {
  const [history, setHistory] = useState<EnergyData[]>([]);
  const [isSpacePressed, setIsSpacePressed] = useState(false); // Represents if System is Armed
  const [isMotionActive, setIsMotionActive] = useState(false); // Represents if Motor is Spinning
  const [cutoffActive, setCutoffActive] = useState(true);
  
  // 🔥 UPDATED: Added cost to state
  const [totals, setTotals] = useState({ utilized: 0, saved: 0, cost: 0 });

  // Sync background effect with ARMED state
  useEffect(() => {
    if (isSpacePressed) {
      document.body.classList.add('core-active');
    } else {
      document.body.classList.remove('core-active');
    }
  }, [isSpacePressed]);

  // Handle Spacebar to Arm/Disarm System
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        
        // Optimistic UI update
        setIsSpacePressed(prev => !prev);

        // 🔥 Signal Backend
        try {
          await fetch("http://localhost:8000/space", { method: "POST" });
        } catch (err) {
          console.error("Backend not reachable", err);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Poll Backend for Metrics
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:8000/metrics");
        const d = await res.json();

        // Sync Frontend State with Backend
        setIsSpacePressed(d.isArmed);
        setIsMotionActive(d.isSpinning);

        // Create Data Point for Chart
        const point: EnergyData = {
          timestamp: d.timestamp,
          voltage: d.voltage,
          current: d.current,
          power: d.power,
          utilizedPower: d.power,
          savedPower: d.isSpinning ? 0 : 1.8,
          isPhantom: !d.isSpinning
        };

        setHistory(prev => {
          const next = [...prev, point];
          return next.length > 30 ? next.slice(next.length - 30) : next;
        });

        // 🔥 UPDATED: Set Totals including Cost
        setTotals({
          utilized: d.units,
          saved: d.isSpinning ? 0 : 0.0018 / 3600,
          cost: d.cost
        });

      } catch (e) {
        console.error("Backend fetch failed", e);
      }
    }, 500); // 500ms refresh for snappier UI

    return () => clearInterval(interval);
  }, []);

  const latest = history.length ? history[history.length - 1] : null;

  return (
    <div className="min-h-screen flex flex-col pb-10">
      {/* Top Command Bar */}
      <nav className="glass-panel px-8 py-3 flex items-center justify-between sticky top-0 z-50 rounded-b-2xl border-t-0 mx-6 mt-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className={`w-1.5 h-6 bg-amber-400 glow-amber transition-all duration-300 ${isSpacePressed ? 'scale-y-150 shadow-[0_0_20px_#fbbf24]' : ''}`}></div>
             <span className="font-bold text-white tracking-[0.4em] text-[10px] uppercase">Predicted Power Usage</span>
          </div>
          <div className="h-4 w-[1px] bg-white/20 hidden sm:block"></div>
          <div className="hidden md:flex gap-8 text-[9px] font-bold uppercase tracking-widest text-slate-500">
             <span className="text-amber-500 cursor-pointer text-glow-amber">Live Telemetry</span>
             
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse glow-amber"></div>
              <span className="text-[8px] font-bold text-white tracking-widest uppercase">Pi_Link: Stable</span>
           </div>
        </div>
      </nav>

      <main className="px-8 mt-16 max-w-7xl mx-auto w-full flex-grow">
        <div className="mb-16 text-center">
           <div className="inline-block px-4 py-1 border border-amber-500/30 bg-amber-500/5 rounded text-[8px] font-bold tracking-[0.6em] text-amber-500 uppercase mb-4 text-glow-amber">
             Energy Usage Monitoring
           </div>
           <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tighter italic text-glow-amber drop-shadow-2xl uppercase">
             {isSpacePressed ? (isMotionActive ? 'CORE ENGAGED' : 'SYSTEM ARMED') : 'VIDHYUT'}
           </h2>
           <p className="text-slate-500 text-[10px] uppercase tracking-[0.5em] font-bold mt-4 opacity-60">
             {isMotionActive ? 'Motion Detected - High Voltage Active' : 'Waiting for Motion trigger...'}
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Wing */}
          <div className="lg:col-span-3 flex flex-col gap-6">
             {/* 1. Voltage */}
             <MetricsCard 
                label="System Potential" 
                value={latest?.voltage ?? '--'} 
                unit="V" 
             />
             
             {/* 2. Load (Watts) */}
             <MetricsCard 
                label="Energy Load" 
                value={latest?.utilizedPower ?? '--'} 
                unit="W" 
             />
             
             {/* 3. 🔥 NEW: Cost Display */}
             <MetricsCard 
                label="Current Session Cost" 
                value={totals.cost.toFixed(4)} 
                unit="INR" 
                color="text-emerald-400" 
             />
             
             <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-amber-500/50">
                <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">Relay Integrity</h4>
                <div className="flex items-center gap-2">
                   <div className="flex-grow h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 glow-amber transition-all duration-500" style={{width: isSpacePressed ? '100%' : '94%'}}></div>
                   </div>
                   <span className="text-[10px] font-mono text-amber-500">{isSpacePressed ? '100%' : '94.2%'}</span>
                </div>
             </div>
          </div>

          {/* Center Column */}
          <div className="lg:col-span-6 flex flex-col gap-8">
             <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
                <div className="flex justify-between items-center mb-8 relative z-10">
                   <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-widest">Energy Matrix</h3>
                      <p className="text-[9px] text-slate-500 uppercase tracking-tighter mt-1">Oscilloscope stream</p>
                   </div>
                </div>

                <div className="h-[280px] w-full relative z-10">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history.length ? history : [{
                        timestamp: "--",
                        voltage: 0,
                        current: 0,
                        power: 0,
                        utilizedPower: 0,
                        savedPower: 0,
                        isPhantom: false
                      }]}>
                         <defs>
                            <linearGradient id="colorCore" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4}/>
                               <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                               <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#ffffff03" />
                         <XAxis dataKey="timestamp" hide />
                         <YAxis
                            domain={[0, 'dataMax + 0.01']}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 10 }}
                          />
                         <Tooltip 
                            contentStyle={{ backgroundColor: '#000', border: '1px solid #fbbf2444', fontSize: '9px', color: '#fff', borderRadius: '4px' }}
                         />
                         <Area type="monotone" dataKey="utilizedPower" stroke="#fbbf24" fillOpacity={1} fill="url(#colorCore)" strokeWidth={2} />
                         <Area type="monotone" dataKey="savedPower" stroke="#10b981" fillOpacity={1} fill="url(#colorGreen)" strokeWidth={1} />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center transition-all hover:bg-white/[0.02]">
                   <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest mb-1">Session Utilization</p>
                   <p className="text-2xl font-bold text-white font-mono">{totals.utilized.toFixed(6)} <span className="text-[10px] text-slate-500 font-sans">kWh</span></p>
                </div>
                <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center border-emerald-500/10 hover:bg-emerald-500/[0.02] transition-all">                   
                   <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest mb-1">Phantom Waste Saved</p>
                   <p className="text-2xl font-bold text-emerald-400 font-mono">{totals.utilized.toFixed(6)} <span className="text-[10px] text-slate-500 font-sans">kWh</span></p>
                </div>
             </div>
          </div>

          {/* Right Wing */}
          <div className="lg:col-span-3 flex flex-col gap-6">
             <PowerControl 
               isPressed={isSpacePressed} 
               cutoffEnabled={cutoffActive}
               onToggleCutoff={() => setCutoffActive(!cutoffActive)}
             />

             <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 border-l-4 border-l-slate-800">
                <div className="flex items-center justify-between">
                   <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Hardware Lock</span>
                   <div className={`w-2 h-2 rounded-full ${cutoffActive ? 'bg-amber-500 glow-amber animate-pulse' : 'bg-slate-700'}`}></div>
                </div>
                <p className="text-[9px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight opacity-70">
                  {cutoffActive ? 'Relay is actively severing bridge voltage during standby.' : 'Manual bypass engaged. Latent leakage is occurring.'}
                </p>
             </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto px-8 py-8 flex flex-col items-center gap-3 border-t border-white/5 bg-black/40">
        <div className="flex gap-10 text-[7px] font-bold uppercase tracking-[0.8em] text-slate-600">
           <span>PI_TELEMETRY_CORE</span>
           <span>LEAK_SUPPRESSION_PROTOCOL</span>
        </div>
        <p className="text-slate-700 text-[8px] font-bold uppercase tracking-widest max-w-xl text-center leading-relaxed">
          The background core is reactive. Hold Spacebar to physically energize the Raspberry Pi module. 
          EcoSense suppresses the latent 1.8W standby draw automatically when the module is released.
        </p>
      </footer>
    </div>
  );
};

export default App;