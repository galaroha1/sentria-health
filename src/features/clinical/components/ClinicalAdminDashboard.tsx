import { useState } from 'react';
import { Search, Filter, AlertTriangle, TrendingUp, CheckCircle2, User } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { UserRole } from '../../../types';

interface DoctorCardSummary {
    id: string;
    doctorName: string;
    specialty: string;
    cardsCount: number;
    lastUpdated: string;
    complianceScore: number;
    savingsOpportunity: number;
}

const MOCK_SUMMARIES: DoctorCardSummary[] = [
    { id: '1', doctorName: 'Dr. Sarah Chen', specialty: 'Orthopedics', cardsCount: 12, lastUpdated: '2h ago', complianceScore: 92, savingsOpportunity: 142000 },
    { id: '2', doctorName: 'Dr. Emily Carter', specialty: 'Surgery', cardsCount: 8, lastUpdated: '1d ago', complianceScore: 78, savingsOpportunity: 45000 }, // Our mock doctor
    { id: '3', doctorName: 'Dr. James Wilson', specialty: 'Cardiology', cardsCount: 15, lastUpdated: '3d ago', complianceScore: 65, savingsOpportunity: 210000 },
];

export function ClinicalAdminDashboard() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    if (!user || user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.CLINICAL_DIRECTOR) {
        return <div className="p-8 text-center text-slate-500">Authorized Personnel Only.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Clinical Operations Director</h1>
                    <p className="text-slate-500">Oversee preference card standardization and compliance.</p>
                </div>
                <div className="flex gap-2">
                    <button className="rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        Export Report
                    </button>
                    <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                        Settings
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <h3 className="font-medium text-slate-500">Total Savings Identified</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">$1.2M <span className="text-sm font-normal text-slate-400">/ yr</span></p>
                    <div className="mt-2 text-xs text-emerald-600 font-medium">+12% vs last quarter</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <h3 className="font-medium text-slate-500">Standardization Rate</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">76%</p>
                    <div className="mt-2 text-xs text-blue-600 font-medium">Goal: 85%</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <h3 className="font-medium text-slate-500">Outlier Alerts</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">14</p>
                    <div className="mt-2 text-xs text-amber-600 font-medium">Physicians needing review</div>
                </div>
            </div>

            {/* Doctor List */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="font-bold text-slate-900">Physician Compliance</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search physicians..."
                            className="rounded-lg border-slate-200 pl-9 py-2 text-sm w-full md:w-64 focus:ring-primary-500 focus:border-primary-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-6 py-3 font-medium">Physician</th>
                            <th className="px-6 py-3 font-medium">Specialty</th>
                            <th className="px-6 py-3 font-medium text-center">Cards</th>
                            <th className="px-6 py-3 font-medium text-center">Score</th>
                            <th className="px-6 py-3 font-medium text-right">Savings Opp</th>
                            <th className="px-6 py-3 font-medium"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {MOCK_SUMMARIES.filter(d => d.doctorName.toLowerCase().includes(searchTerm.toLowerCase())).map((doc) => (
                            <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-slate-900">{doc.doctorName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{doc.specialty}</td>
                                <td className="px-6 py-4 text-center font-medium">{doc.cardsCount}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${doc.complianceScore > 90 ? 'bg-emerald-100 text-emerald-700' :
                                            doc.complianceScore > 75 ? 'bg-blue-100 text-blue-700' :
                                                'bg-amber-100 text-amber-700'
                                        }`}>
                                        {doc.complianceScore}%
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-emerald-600">
                                    ${doc.savingsOpportunity.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-primary-600 hover:text-primary-700 font-medium text-xs hover:underline">
                                        View Cards
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
