import { X, Clock, Shield, AlertCircle } from 'lucide-react';
import { type User } from '../../types';
import { MOCK_ACTIVITY_LOGS } from '../../data/users/mockData';

interface UserActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
}

export function UserActivityModal({ isOpen, onClose, user }: UserActivityModalProps) {
    if (!isOpen) return null;

    const userLogs = MOCK_ACTIVITY_LOGS.filter(log => log.userId === user.id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 p-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">User Activity</h2>
                        <p className="text-sm text-slate-500">Activity history for {user.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-4">
                    {userLogs.length > 0 ? (
                        <div className="space-y-4">
                            {userLogs.map((log) => (
                                <div key={log.id} className="flex gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
                                    <div className={`mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${log.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        {log.status === 'success' ? <Shield className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-slate-900">{log.action}</p>
                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                <Clock className="h-3 w-3" />
                                                {new Date(log.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600">IP Address: {log.ipAddress}</p>
                                        {log.details && (
                                            <p className="mt-1 text-sm text-red-600">{log.details}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-sm text-slate-500">No activity logs found for this user.</p>
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-200 p-4">
                    <button
                        onClick={onClose}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
