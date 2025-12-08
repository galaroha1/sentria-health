
import { useRef, useEffect } from 'react';
import { Terminal } from 'lucide-react';

interface LogTerminalProps {
    logs: string[];
    className?: string;
    title?: string;
}

export function LogTerminal({ logs, className = '', title = 'System Output' }: LogTerminalProps) {
    const endRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className={`overflow-hidden rounded-lg bg-slate-950 font-mono text-xs shadow-inner ${className}`}>
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
                <div className="flex items-center gap-2 text-slate-400">
                    <Terminal className="h-4 w-4" />
                    <span className="font-bold">{title}</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/20" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/20" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/20" />
                </div>
            </div>

            {/* Terminal Body */}
            <div className="h-64 overflow-y-auto p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
                <div className="space-y-1">
                    {logs.map((log, i) => (
                        <div key={i} className="break-all">
                            <span className="mr-2 text-slate-500">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
                            {log.startsWith('>') ? (
                                <span className="text-emerald-400 font-bold">{log}</span>
                            ) : log.includes('WARN') ? (
                                <span className="text-amber-400">{log}</span>
                            ) : log.includes('ERR') || log.includes('CRITICAL') ? (
                                <span className="text-red-400 font-bold">{log}</span>
                            ) : (
                                <span className="text-slate-300">{log}</span>
                            )}
                        </div>
                    ))}
                    <div ref={endRef} />

                    {/* Blinking Cursor */}
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-emerald-500">➜</span>
                        <span className="h-4 w-2 bg-emerald-500/50 animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}
