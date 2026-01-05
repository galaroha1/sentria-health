import { useState } from 'react';
import { Plus, Save, Search, TrendingDown, Stethoscope, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { UserRole } from '../../../types';

interface PreferenceItem {
    id: string;
    name: string;
    quantity: number;
    status: 'OPEN' | 'HOLD';
    suggestion?: {
        type: 'optimization';
        message: string;
        savings: number;
    };
}

interface Procedure {
    id: string;
    name: string;
    specialty: string;
}

const PROCEDURES: Procedure[] = [
    { id: '1', name: 'Total Knee Arthroplasty', specialty: 'Orthopedics' },
    { id: '2', name: 'Laparoscopic Cholecystectomy', specialty: 'General Surgery' },
    { id: '3', name: 'Cataract Surgery', specialty: 'Ophthalmology' },
    { id: '4', name: 'Cesarean Section', specialty: 'OB/GYN' },
];

export function DoctorPreferenceBuilder() {
    const { user } = useAuth();
    const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
    const [items, setItems] = useState<PreferenceItem[]>([
        { id: '1', name: 'Surgical Gloves Size 7', quantity: 4, status: 'OPEN', suggestion: { type: 'optimization', message: 'Avg usage only 2.3 vs opened 4. Apply recommendation?', savings: 24.99 } },
        { id: '2', name: 'Bone Cement (Simplex P)', quantity: 2, status: 'OPEN', suggestion: { type: 'optimization', message: 'Switch to High Viscosity for lower revisions?', savings: 15.00 } },
        { id: '3', name: 'Suction Canister 2000ml', quantity: 3, status: 'OPEN' },
        { id: '4', name: 'Antibiotic Irrigation', quantity: 1, status: 'HOLD', suggestion: { type: 'optimization', message: 'Switch to HOLD saves $12,400 annually.', savings: 12400 } },
        { id: '5', name: '#15 Blade', quantity: 2, status: 'OPEN' },
    ]);
    const [newItemName, setNewItemName] = useState('');

    const handleAddItem = () => {
        if (!newItemName) return;
        setItems([...items, { id: Date.now().toString(), name: newItemName, quantity: 1, status: 'OPEN' }]);
        setNewItemName('');
    };

    const handleUpdateQuantity = (id: string, delta: number) => {
        setItems(items.map(item => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item));
    };

    const handleToggleStatus = (id: string) => {
        setItems(items.map(item => item.id === id ? { ...item, status: item.status === 'OPEN' ? 'HOLD' : 'OPEN' } : item));
    };

    // Mock Apply Recommendation
    const applySuggestion = (id: string) => {
        setItems(items.map(item => {
            if (item.id === id) {
                // Heuristic: If prompt says 'Hold', switch to hold. If prompt says 'Usage', reduce qty.
                if (item.suggestion?.message.includes('HOLD')) return { ...item, status: 'HOLD', suggestion: undefined };
                if (item.suggestion?.message.includes('usage')) return { ...item, quantity: Math.floor(item.quantity * 0.6), suggestion: undefined };
            }
            return item;
        }));
    };

    const totalSavings = items.reduce((sum, item) => sum + (item.suggestion?.savings || 0), 0);

    if (!user || user.role !== UserRole.DOCTOR) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <div className="text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-lg font-medium text-slate-900">Access Restricted</h3>
                    <p className="mt-1 text-slate-500">Only authorized doctors can access the preference builder.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Procedure Selector */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Preference Card Builder</h1>
                        <p className="text-slate-500">Manage your surgical supply requests and protocols.</p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="rounded-lg border-slate-200 py-2 pl-3 pr-10 text-sm font-medium focus:border-primary-500 focus:ring-primary-500"
                            onChange={(e) => setSelectedProcedure(PROCEDURES.find(p => p.id === e.target.value) || null)}
                            value={selectedProcedure?.id || ''}
                        >
                            <option value="">Select Procedure</option>
                            {PROCEDURES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <button className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                            <Save className="h-4 w-4" />
                            Save Card
                        </button>
                    </div>
                </div>
            </div>

            {selectedProcedure ? (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex justify-between items-center">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4 text-primary-600" />
                                    {selectedProcedure.name} Items
                                </h3>
                                <span className="text-xs font-mono text-slate-400">ID: {selectedProcedure.id}-V3</span>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {items.map(item => (
                                    <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-2 w-2 rounded-full ${item.status === 'OPEN' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                <div>
                                                    <p className="font-medium text-slate-900">{item.name}</p>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider">{item.status}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-sm">
                                                    <button onClick={() => handleUpdateQuantity(item.id, -1)} className="px-2 py-1 text-slate-500 hover:bg-slate-100">-</button>
                                                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                                    <button onClick={() => handleUpdateQuantity(item.id, 1)} className="px-2 py-1 text-slate-500 hover:bg-slate-100">+</button>
                                                </div>
                                                <button
                                                    onClick={() => handleToggleStatus(item.id)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${item.status === 'OPEN'
                                                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                        }`}
                                                >
                                                    {item.status}
                                                </button>
                                            </div>
                                        </div>

                                        {/* AI Insight Inline */}
                                        {item.suggestion && (
                                            <div className="mt-3 ml-5 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                                                <TrendingDown className="h-4 w-4 mt-0.5 text-blue-600 shrink-0" />
                                                <div className="flex-1">
                                                    <span className="font-bold text-blue-700">Optimization: </span>
                                                    {item.suggestion.message}
                                                    {item.suggestion.savings > 0 && (
                                                        <span className="ml-1 text-emerald-600 font-bold">(+${item.suggestion.savings.toLocaleString()} savings)</span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => applySuggestion(item.id)}
                                                    className="shrink-0 text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Add Item */}
                            <div className="p-4 bg-slate-50 border-t border-slate-200">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search catalog to add item..."
                                            className="w-full rounded-lg border-slate-200 pl-9 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                                            value={newItemName}
                                            onChange={(e) => setNewItemName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                                        />
                                    </div>
                                    <button onClick={handleAddItem} className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: AI Summary */}
                    <div className="space-y-4">
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                                    <TrendingDown className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-emerald-900">AI Savings Found</h3>
                            </div>
                            <p className="text-3xl font-bold text-emerald-700">${totalSavings.toLocaleString()}</p>
                            <p className="text-sm text-emerald-600 mt-1">Projected annual savings if recommendations are applied.</p>

                            <div className="mt-6 pt-6 border-t border-emerald-100 flex items-center justify-between text-sm">
                                <span className="text-emerald-800">Card Accuracy Score</span>
                                <span className="font-bold text-emerald-700">92%</span>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-4">Utilization History</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Cases Last 30d</span>
                                    <span className="font-medium">24</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Avg Cost / Case</span>
                                    <span className="font-medium">$1,240</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Variance</span>
                                    <span className="font-medium text-emerald-600">-4.2%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                    <Stethoscope className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-4 text-lg font-medium text-slate-900">Select a Procedure</h3>
                    <p className="mt-1 text-slate-500">Choose a procedure above to configure your preference card.</p>
                </div>
            )}
        </div>
    );
}
