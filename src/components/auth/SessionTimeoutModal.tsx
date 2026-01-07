import { useState, useEffect } from 'react';
import { Clock, LogOut } from 'lucide-react';

interface SessionTimeoutModalProps {
    isOpen: boolean;
    remainingSeconds: number;
    onExtend: () => void;
    onLogout: () => void;
}

export function SessionTimeoutModal({ isOpen, remainingSeconds, onExtend, onLogout }: SessionTimeoutModalProps) {
    const [countdown, setCountdown] = useState(remainingSeconds);

    useEffect(() => {
        setCountdown(remainingSeconds);
    }, [remainingSeconds]);

    useEffect(() => {
        if (!isOpen || countdown <= 0) return;

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, countdown, onLogout]);

    if (!isOpen) return null;

    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
                <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                        <Clock className="h-8 w-8 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Session Expiring</h3>
                        <p className="text-sm text-slate-500">Your session is about to expire</p>
                    </div>
                </div>

                <div className="mb-6 rounded-lg bg-slate-50 p-4">
                    <p className="mb-2 text-sm text-slate-600">Time remaining:</p>
                    <div className="text-center">
                        <span className="text-4xl font-bold text-slate-900">
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </span>
                    </div>
                </div>

                <p className="mb-6 text-sm text-slate-600">
                    You've been inactive for a while. Your session will automatically expire for security reasons.
                    Would you like to continue?
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onLogout}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                    <button
                        onClick={onExtend}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        Continue Session
                    </button>
                </div>
            </div>
        </div>
    );
}
