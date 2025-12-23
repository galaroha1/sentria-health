import { useState, useEffect } from 'react';
import { Mail, X, Send, Building2 } from 'lucide-react';

interface InvitePartnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvite: (email: string, orgName: string) => void;
}

export function InvitePartnerModal({ isOpen, onClose, onInvite }: InvitePartnerModalProps) {
    const [email, setEmail] = useState('');
    const [orgName, setOrgName] = useState('');

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onInvite(email, orgName);
        onClose();
        setEmail('');
        setOrgName('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity">
            <div className="w-full max-w-md rounded-xl border border-blue-100 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-200 p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-primary-600">
                            <Mail className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Invite Partner</h2>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Organization Name</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                placeholder="e.g. North Star Health"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Administrator Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                placeholder="admin@hospital.org"
                                required
                            />
                        </div>
                    </div>

                    <div className="rounded-lg bg-blue-50 p-4">
                        <p className="text-xs text-blue-700">
                            An invitation link will be sent to the administrator. They will need to verify their credentials before joining the network.
                        </p>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Send className="h-4 w-4" />
                            Send Invitation
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
