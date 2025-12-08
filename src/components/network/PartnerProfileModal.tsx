
import { X, Building2, MapPin, Mail, Phone, Calendar, ShieldCheck, Activity } from 'lucide-react';
import type { Organization } from '../../services/networkService';

interface PartnerProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    partner: Organization | null;
}

export function PartnerProfileModal({ isOpen, onClose, partner }: PartnerProfileModalProps) {
    if (!isOpen || !partner) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div className="absolute -bottom-10 left-8">
                        <div className="h-20 w-20 rounded-2xl bg-white p-1 shadow-lg">
                            <div className="h-full w-full rounded-xl bg-slate-50 flex items-center justify-center text-blue-600">
                                <Building2 className="h-10 w-10" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="pt-12 px-8 pb-8">
                    <div className="mb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">{partner.name}</h2>
                                <p className="text-slate-500 flex items-center gap-2 mt-1">
                                    <MapPin className="h-4 w-4" /> {partner.address || 'Location Hidden'} • {partner.distanceMiles} miles away
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${partner.trustLevel === 'Tier 1' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                {partner.trustLevel} Partner
                            </span>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Contact Info</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                        <span>contact@{partner.name.toLowerCase().replace(/\s/g, '')}.org</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Phone className="h-4 w-4 text-slate-400" />
                                        <span>+1 (555) 000-0000</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        <span>Partner since 2024</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Capabilities</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['Trauma Level I', 'Cold Chain Storage', '24/7 Pharmacy', 'Helipad'].map(tag => (
                                        <span key={tag} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md border border-slate-200">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-blue-500" />
                                    Exchange Activity
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">Successful Transfers</span>
                                        <span className="font-medium text-slate-900">124</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">Response Time</span>
                                        <span className="font-medium text-slate-900">&lt; 2 hours</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">Reliability Score</span>
                                        <span className="font-medium text-emerald-600">98.5%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                                    Active Agreement
                                </h3>
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    This facility operates under the Regional Mutual Aid Compact (RMAC). Standard transfer protocols apply.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-50 font-medium rounded-lg transition-colors border border-transparent hover:border-slate-200"
                        >
                            Close
                        </button>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm shadow-blue-200 transition-colors">
                            Request Connection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
