
import { X, Package, Check, Printer, Edit2 } from 'lucide-react';

interface CaseCartItem {
    id: string;
    name: string;
    quantity: number;
    status: 'picked' | 'pending' | 'substitution';
    location: string;
}

interface CaseCartModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientName: string;
    procedureName: string;
    surgeonName: string;
}

export function CaseCartModal({ isOpen, onClose, patientName, procedureName, surgeonName }: CaseCartModalProps) {
    if (!isOpen) return null;

    const items: CaseCartItem[] = [
        { id: '1', name: 'Surgical Gloves, Size 7.5', quantity: 4, status: 'picked', location: 'Bin A-12' },
        { id: '2', name: 'Surgical Gown, XL', quantity: 3, status: 'picked', location: 'Bin A-14' },
        { id: '3', name: 'Lap Sponge, Sterile (5/pk)', quantity: 2, status: 'picked', location: 'Bin B-03' },
        { id: '4', name: 'Bovie Electrosurgical Pencil', quantity: 1, status: 'picked', location: 'Bin C-01' },
        { id: '5', name: 'Suction Tubing, 10ft', quantity: 2, status: 'picked', location: 'Bin C-05' },
        { id: '6', name: 'Foley Catheter Kit', quantity: 1, status: 'pending', location: 'Bin D-02' },
        { id: '7', name: 'Ancef 1g Vial', quantity: 2, status: 'substitution', location: 'Omnicell' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="border-b border-slate-100 bg-slate-50/50 p-6 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-xl font-bold text-slate-900">Case Cart #88392</h2>
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wide">
                                In Prep
                            </span>
                        </div>
                        <p className="text-sm text-slate-500">{procedureName} • {surgeonName}</p>
                        <p className="text-sm text-slate-500 font-medium mt-1">Patient: {patientName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-100">
                    <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
                        <span>Pick Progress</span>
                        <span>85% Complete</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full w-[85%] bg-emerald-500 rounded-full"></div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        {items.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-blue-100 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 flex items-center justify-center rounded-lg ${item.status === 'picked' ? 'bg-emerald-50 text-emerald-600' :
                                        item.status === 'substitution' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                        <Package className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{item.name}</p>
                                        <p className="text-xs text-slate-500">Loc: {item.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-slate-900">x{item.quantity}</p>
                                        <p className={`text-xs font-medium ${item.status === 'picked' ? 'text-emerald-600' :
                                            item.status === 'substitution' ? 'text-amber-600' : 'text-slate-400'
                                            }`}>
                                            {item.status.toUpperCase()}
                                        </p>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-blue-600 transition-all">
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-between gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 transition-colors">
                        <Printer className="h-4 w-4" />
                        Print Pick List
                    </button>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                            Report Issue
                        </button>
                        <button className="flex items-center gap-2 px-6 py-2 bg-emerald-600 rounded-lg text-sm font-medium text-white hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-colors">
                            <Check className="h-4 w-4" />
                            Complete Pick
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
