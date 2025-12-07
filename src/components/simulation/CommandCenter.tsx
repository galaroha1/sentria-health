import { useEffect, useState, useRef } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Activity, Brain, Radio, ShieldCheck, Zap, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CommandCenter() {
    const { simulationResults, stats, isTraining } = useSimulation();
    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeNode, setActiveNode] = useState<string | null>(null);

    // Auto-scroll the feed
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [simulationResults]);

    // Randomly activate nodes for visual effect
    useEffect(() => {
        const interval = setInterval(() => {
            const nodes = ['ingest', 'process', 'analyze', 'dispatch'];
            setActiveNode(nodes[Math.floor(Math.random() * nodes.length)]);
            setTimeout(() => setActiveNode(null), 500);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const recentEvents = simulationResults.slice(0, 50).reverse();

    return (
        <div className="fixed inset-0 z-50 bg-black text-green-500 font-mono overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-green-900/50 p-4 bg-black/90 backdrop-blur">
                <div className="flex items-center gap-3">
                    <Brain className="h-6 w-6 text-green-400 animate-pulse" />
                    <div>
                        <h1 className="text-xl font-bold tracking-wider text-green-400">SENTRIA AI CORE</h1>
                        <div className="flex items-center gap-2 text-xs text-green-600">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            SYSTEM ONLINE // MONITORING
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="p-2 hover:bg-green-900/20 rounded-full transition-colors group"
                >
                    <X className="h-6 w-6 text-green-700 group-hover:text-green-400" />
                </button>
            </div>

            {/* Main Grid */}
            <div className="flex-1 grid grid-cols-12 gap-4 p-4">

                {/* Left Panel: System Stats */}
                <div className="col-span-3 space-y-4">
                    <div className="border border-green-900/50 bg-green-900/5 p-4 rounded-lg">
                        <h3 className="text-xs font-bold text-green-700 mb-2 uppercase">System Load</h3>
                        <div className="flex items-end gap-1 h-24 mb-2">
                            {[40, 65, 30, 80, 55, 90, 45, 70, 35, 60].map((h, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-green-900/40 hover:bg-green-500/50 transition-all duration-300"
                                    style={{ height: `${h}%` }}
                                ></div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-green-600">
                            <span>CPU: 42%</span>
                            <span>MEM: 1.2GB</span>
                        </div>
                    </div>

                    <div className="border border-green-900/50 bg-green-900/5 p-4 rounded-lg">
                        <h3 className="text-xs font-bold text-green-700 mb-4 uppercase">Network Nodes</h3>
                        <div className="space-y-4 relative">
                            {/* Connecting Lines (CSS borders would be simpler) */}
                            <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-green-900/30"></div>

                            {[
                                { id: 'ingest', label: 'Data Ingestion', icon: Radio },
                                { id: 'process', label: 'NLP Processing', icon: Zap },
                                { id: 'analyze', label: 'Clinical Analysis', icon: Activity },
                                { id: 'dispatch', label: 'Logistics Dispatch', icon: ShieldCheck },
                            ].map(node => (
                                <div key={node.id} className={`relative flex items-center gap-3 transition-all duration-300 ${activeNode === node.id ? 'translate-x-2 text-green-300' : 'text-green-800'}`}>
                                    <div className={`relative z-10 p-1.5 rounded bg-black border ${activeNode === node.id ? 'border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'border-green-900'}`}>
                                        <node.icon className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-bold">{node.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border border-green-900/50 bg-green-900/5 p-4 rounded-lg">
                        <h3 className="text-xs font-bold text-green-700 mb-2 uppercase">Throughput</h3>
                        <div className="text-3xl font-bold text-green-400">{stats.totalPatients.toLocaleString()}</div>
                        <div className="text-xs text-green-600">Records Processed</div>
                    </div>
                </div>

                {/* Center Panel: Live Feed */}
                <div className="col-span-6 flex flex-col border border-green-900/50 bg-black rounded-lg overflow-hidden relative">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,20,0,0)_50%,rgba(0,50,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,6px_100%]"></div>
                    <div className="p-2 border-b border-green-900/50 bg-green-900/10 flex justify-between items-center z-10">
                        <span className="text-xs font-bold text-green-600">LIVE DATA STREAM</span>
                        <span className="text-xs text-green-800 animate-pulse">● REC</span>
                    </div>
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm z-10 scrollbar-hide">
                        {recentEvents.length === 0 && (
                            <div className="text-green-900 text-center mt-20">Waiting for data stream...</div>
                        )}
                        {recentEvents.map((event) => (
                            <div key={event.id} className="flex gap-4 border-l-2 border-green-900/50 pl-3 hover:bg-green-900/10 hover:border-green-500 transition-colors py-1">
                                <span className="text-green-700 shrink-0">{event.timeStr}</span>
                                <div className="flex-1">
                                    <span className="text-green-300 font-bold">[{event.condition}]</span>
                                    <span className="text-green-600 mx-2">→</span>
                                    <span className="text-green-400">{event.drug}</span>
                                </div>
                                <span className={`text-xs px-1 rounded ${event.status === 'In Stock' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                    {event.status.toUpperCase()}
                                </span>
                            </div>
                        ))}
                        {isTraining && (
                            <div className="animate-pulse text-green-500 text-center py-2">
                                ... ANALYZING INCOMING PACKETS ...
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Analysis */}
                <div className="col-span-3 space-y-4">
                    <div className="border border-green-900/50 bg-green-900/5 p-4 rounded-lg h-full flex flex-col">
                        <h3 className="text-xs font-bold text-green-700 mb-4 uppercase">Prediction Confidence</h3>
                        <div className="flex-1 flex items-center justify-center relative">
                            <svg className="h-32 w-32 transform -rotate-90">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-green-900/30"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={351.86}
                                    strokeDashoffset={351.86 * (1 - stats.accuracy / 100)}
                                    className="text-green-500 transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-green-400">{stats.accuracy.toFixed(1)}%</span>
                                <span className="text-[10px] text-green-700">CONFIDENCE</span>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-green-700">Model Version</span>
                                <span className="text-green-400">v2.4.1-alpha</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-green-700">Latency</span>
                                <span className="text-green-400">12ms</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
