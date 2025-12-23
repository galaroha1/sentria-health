
import { useState } from 'react';
import { Save, Trash2, Plus, TrendingDown } from 'lucide-react';
import type { PreferenceCard, UsageReport } from '../../services/clinicalService';

interface PreferenceCardViewProps {
    card: PreferenceCard;
    history: UsageReport[];
    onSave: (card: PreferenceCard) => void;
}

export function PreferenceCardView({ card, onSave }: PreferenceCardViewProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [items, setItems] = useState(card.items);

    const toggleStatus = (index: number) => {
        if (!isEditing) return;
        const newItems = [...items];
        newItems[index].openStatus = newItems[index].openStatus === 'open' ? 'hold' : 'open';
        setItems(newItems);
    };

    const handleDelete = (index: number) => {
        if (!isEditing) return;
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">{card.procedureName}</h3>
                    <p className="text-sm text-slate-500">{card.surgeonName}</p>
                </div>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onSave({ ...card, items });
                                    setIsEditing(false);
                                }}
                                className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 shadow-sm transition-colors"
                            >
                                <Save className="h-4 w-4" />
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 border border-primary-200 transition-colors"
                        >
                            Edit Card
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
                    <span className="w-1/2">Item Description</span>
                    <span className="w-20 text-center">Qty</span>
                    <span className="w-24 text-center">Status</span>
                    {isEditing && <span className="w-10"></span>}
                </div>

                {items.map((item, i) => (
                    <div
                        key={item.itemId}
                        className={`flex items-center justify-between py-3 border-b border-slate-50 last:border-0 ${isEditing ? 'cursor-pointer hover:bg-slate-50 rounded-lg px-2 -mx-2' : ''}`}
                        onClick={() => toggleStatus(i)}
                    >
                        <div className="w-1/2 font-medium text-slate-900">{item.name}</div>
                        <div className="w-20 text-center text-slate-600">{item.quantity}</div>
                        <div className="w-24 flex justify-center">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.openStatus === 'open'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                                }`}>
                                {item.openStatus}
                            </span>
                        </div>
                        {isEditing && (
                            <div className="w-10 flex justify-end">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(i);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {isEditing && (
                    <button className="w-full py-3 border border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-500 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50/50 transition-all flex items-center justify-center gap-2 mt-4">
                        <Plus className="h-4 w-4" />
                        Add New Item
                    </button>
                )}
            </div>

            {/* Value Analysis Insight */}
            {!isEditing && (
                <div className="mt-6 rounded-lg bg-blue-50 p-4 border border-blue-100">
                    <div className="flex gap-3">
                        <div className="p-2 bg-blue-100 rounded-full h-fit text-primary-600">
                            <TrendingDown className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900">Cost Opportunity Found</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                Switching "Antibiotic Irrigation" to <span className="font-bold">Hold</span> for this procedure could save <span className="font-bold">$12,400</span> annually based on usage history.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
