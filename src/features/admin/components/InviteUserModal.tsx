import { useState } from 'react';
import { X, Mail, Send, Copy, Check } from 'lucide-react';
import { FirestoreService } from '../../../core/services/firebase.service';
import { UserRole } from '../../../types';
import toast from 'react-hot-toast';

interface InviteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InviteUserModal({ isOpen, onClose }: InviteUserModalProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.PHARMACY_MANAGER);
    const [department, setDepartment] = useState('Pharmacy');
    const [isLoading, setIsLoading] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [step, setStep] = useState<'form' | 'success'>('form');

    if (!isOpen) return null;

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const emailKey = email.toLowerCase();

            // Check if already invited
            const existing = await FirestoreService.getById('invites', emailKey);
            if (existing) {
                toast.error('This email has already been invited.');
                setIsLoading(false);
                return;
            }

            // Create Invite Record
            await FirestoreService.set('invites', emailKey, {
                email: emailKey,
                role,
                department,
                invitedBy: 'super_admin', // In real app, use auth.currentUser.uid
                createdAt: new Date().toISOString(),
                status: 'pending'
            });

            // Generate Invite Link (Simulated)
            const link = `${window.location.origin}/login`; // In real app, might include ?code=...
            setInviteLink(link);
            setStep('success');
            toast.success('User authorized successfully.');

        } catch (error) {
            console.error('Invite error:', error);
            toast.error('Failed to create invitation.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendEmail = () => {
        const subject = encodeURIComponent("You're invited to Penn Medicine Supply Chain");
        const body = encodeURIComponent(`Hello,\n\nYou have been invited to join the Penn Medicine Supply Chain Intelligence Platform.\n\nRole: ${role}\nDepartment: ${department}\n\nPlease click the link below to create your account:\n${inviteLink}\n\nNote: You must use this email address (${email}) to sign up.\n\nBest regards,\nPenn Medicine Team`);

        // Gmail Compose URL
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
        window.open(gmailUrl, '_blank');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteLink);
        toast.success('Link copied to clipboard');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-900">Invite New User</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {step === 'form' ? (
                    <form onSubmit={handleInvite} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    placeholder="colleague@pennmedicine.upenn.edu"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as UserRole)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            >
                                <option value={UserRole.SUPER_ADMIN}>Administrator</option>
                                <option value={UserRole.PHARMACY_MANAGER}>Pharmacy Manager</option>
                                <option value={UserRole.PROCUREMENT_OFFICER}>Procurement Officer</option>
                                <option value={UserRole.CLINICAL_DIRECTOR}>Clinical Director</option>
                                <option value={UserRole.INVENTORY_SPECIALIST}>Inventory Specialist</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            >
                                <option value="Pharmacy">Pharmacy</option>
                                <option value="Procurement">Procurement</option>
                                <option value="Oncology">Oncology</option>
                                <option value="Cardiology">Cardiology</option>
                                <option value="Administration">Administration</option>
                            </select>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2.5 bg-primary-800 text-white font-medium rounded-lg hover:bg-primary-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? 'Authorizing...' : 'Authorize & Create Invite'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="p-6 text-center space-y-6">
                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="h-8 w-8 text-green-600" />
                        </div>

                        <div>
                            <h4 className="text-xl font-bold text-slate-900">User Authorized</h4>
                            <p className="text-sm text-slate-500 mt-1">
                                {email} allows to sign up as {role}.
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-left">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Registration Link</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-white px-3 py-2 rounded border border-slate-200 text-sm text-slate-700 truncate">
                                    {inviteLink}
                                </code>
                                <button onClick={copyToClipboard} className="p-2 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all text-slate-500">
                                    <Copy className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleSendEmail}
                            className="w-full py-3 bg-primary-800 text-white font-medium rounded-lg hover:bg-primary-900 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-900/20"
                        >
                            <Send className="h-4 w-4" />
                            Send Invitation Email
                        </button>

                        <button
                            onClick={onClose}
                            className="text-sm text-slate-500 hover:text-slate-900"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
