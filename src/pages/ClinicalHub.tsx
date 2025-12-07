
import { useState } from 'react';
import { ClipboardList, Stethoscope, TrendingDown, Calendar, Syringe } from 'lucide-react';
import { clinicalService } from '../services/clinicalService';
import type { PreferenceCard, UsageReport } from '../services/clinicalService';

export function ClinicalHub() {
    const [activeTab, setActiveTab] = useState<'cards' | 'vac' | 'schedule'>('schedule');

    // Mock Data for Demo
    const mockCard: PreferenceCard = {
        id: '1',
        procedureName: 'Total Knee Arthroplasty',
        surgeonName: 'Dr. Sarah Chen',
        items: [
            { itemId: '1', name: 'Surgical Gloves Size 7', quantity: 4, openStatus: 'open' },
            { itemId: '2', name: 'Bone Cement', quantity: 2, openStatus: 'open' },
            { itemId: '3', name: 'Suction Canister', quantity: 3, openStatus: 'open' },
            { itemId: '4', name: 'Antibiotic Irrigation', quantity: 1, openStatus: 'hold' },
        ]
    };

    const mockHistory: UsageReport[] = [
        { procedureId: 'p1', itemsUsed: [{ itemId: '1', quantity: 2 }, { itemId: '2', quantity: 1 }, { itemId: '3', quantity: 3 }] },
        { procedureId: 'p2', itemsUsed: [{ itemId: '1', quantity: 2 }, { itemId: '2', quantity: 1 }, { itemId: '3', quantity: 3 }] },
        { procedureId: 'p3', itemsUsed: [{ itemId: '1', quantity: 3 }, { itemId: '2', quantity: 1 }, { itemId: '3', quantity: 2 }] },
    ];

    const recommendations = clinicalService.analyzePreferenceCard(mockCard, mockHistory);

    // Mock Schedule Data
    const schedule = [
        { time: '07:30', patient: 'James Wilson', procedure: 'Total Knee Arthroplasty', surgeon: 'Dr. Chen', or: 'OR-1', status: 'In Prep', drugs: ['Ancef 2g', 'Tranexamic Acid 1g'] },
        { time: '09:00', patient: 'Maria Garcia', procedure: 'Laparoscopic Cholecystectomy', surgeon: 'Dr. Smith', or: 'OR-3', status: 'Scheduled', drugs: ['Rocephin 1g'] },
        { time: '10:15', patient: 'Robert Taylor', procedure: 'Hernia Repair', surgeon: 'Dr. Jones', or: 'OR-2', status: 'Scheduled', drugs: ['Ancef 1g'] },
        { time: '12:30', patient: 'Linda Brown', procedure: 'Hip Replacement', surgeon: 'Dr. Chen', or: 'OR-1', status: 'Scheduled', drugs: ['Vancomycin 1g', 'Tranexamic Acid 1g'] },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Clinical Operations</h1>
                    <p className="text-sm text-slate-500">Bridge the gap between supply chain and patient care.</p>
                </div>
                <div className="flex rounded-lg bg-slate-100 p-1">
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${activeTab === 'schedule' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        <Calendar className="h-4 w-4" />
                        OR Schedule
                    </button>
                    <button
                        onClick={() => setActiveTab('cards')}
                        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${activeTab === 'cards' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        <ClipboardList className="h-4 w-4" />
                        Preference Cards
                    </button>
                    <button
                        onClick={() => setActiveTab('vac')}
                        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${activeTab === 'vac' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        <Stethoscope className="h-4 w-4" />
                        Value Analysis
                    </button>
                </div>
            </div>

            {activeTab === 'schedule' && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">Today's Surgical Schedule</h3>
                        <div className="text-sm text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {schedule.map((slot, i) => (
                            <div key={i} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
                                <div className="flex w-24 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-50 p-3">
                                    <span className="text-lg font-bold text-slate-900">{slot.time}</span>
                                    <span className="text-xs font-medium text-slate-500">{slot.or}</span>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-slate-900">{slot.procedure}</h4>
                                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${slot.status === 'In Prep' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {slot.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        <span className="font-medium text-slate-900">{slot.patient}</span> • {slot.surgeon}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {slot.drugs.map((drug, j) => (
                                            <span key={j} className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 border border-emerald-100">
                                                <Syringe className="h-3 w-3" />
                                                {drug}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                                    View Case Cart
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'cards' && (
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Card Analysis */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{mockCard.procedureName}</h3>
                                <p className="text-sm text-slate-500">{mockCard.surgeonName}</p>
                            </div>
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                                Optimization Needed
                            </span>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-900">AI Recommendations</h4>
                            {recommendations.map((rec, i) => (
                                <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                        <TrendingDown className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-slate-900">{rec.itemName}</p>
                                            <span className="text-xs font-bold text-emerald-600">+${rec.potentialSavings} savings</span>
                                        </div>
                                        <p className="mt-1 text-sm text-slate-600">
                                            Currently opening <span className="font-bold">{rec.currentQty}</span>, but average usage is <span className="font-bold">{rec.avgUsed}</span>.
                                        </p>
                                        <div className="mt-3 flex gap-2">
                                            <button className="rounded-md bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
                                                Ignore
                                            </button>
                                            <button className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-indigo-700">
                                                Apply Fix: {rec.recommendation === 'change_to_hold' ? 'Change to "Hold"' : 'Reduce Quantity'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-6">
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-bold text-slate-900">Waste Reduction Impact</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg bg-emerald-50 p-4">
                                    <p className="text-sm font-medium text-emerald-800">Projected Annual Savings</p>
                                    <p className="mt-1 text-2xl font-bold text-emerald-900">$142,500</p>
                                </div>
                                <div className="rounded-lg bg-blue-50 p-4">
                                    <p className="text-sm font-medium text-blue-800">Cards Optimized</p>
                                    <p className="mt-1 text-2xl font-bold text-blue-900">24 / 150</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'vac' && (
                <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                        <Stethoscope className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">Value Analysis Portal</h3>
                    <p className="mt-2 text-slate-500">Submit new product requests for clinical and financial review.</p>
                    <button className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                        New Request
                    </button>
                </div>
            )}
        </div>
    );
}
