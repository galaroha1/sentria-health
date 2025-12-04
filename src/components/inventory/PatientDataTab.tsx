import { useState } from 'react';
import { Search, Filter, Download, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useSimulation, type SimulationResult } from '../../context/SimulationContext';
import { format } from 'date-fns';

export function PatientDataTab() {
    const { simulationResults, viewPatientDetails } = useSimulation();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<keyof SimulationResult | 'confidence'>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const handleSort = (field: keyof SimulationResult | 'confidence') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const filteredResults = simulationResults.filter(result =>
        result.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.drug.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
        let aValue: any = a[sortField as keyof SimulationResult];
        let bValue: any = b[sortField as keyof SimulationResult];

        if (sortField === 'confidence') {
            aValue = a.aiPrediction?.confidenceScore || 0;
            bValue = b.aiPrediction?.confidenceScore || 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const SortIcon = ({ field }: { field: keyof SimulationResult | 'confidence' }) => {
        if (sortField !== field) return <div className="w-4" />;
        return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search patients, conditions, or drugs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        <Filter className="h-4 w-4" />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        <Download className="h-4 w-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Spreadsheet Table */}
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('patientName')}>
                                    <div className="flex items-center gap-1">Patient <SortIcon field="patientName" /></div>
                                </th>
                                <th className="px-4 py-3">Age/Gender</th>
                                <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('condition')}>
                                    <div className="flex items-center gap-1">Condition <SortIcon field="condition" /></div>
                                </th>
                                <th className="px-4 py-3">Vitals (BP/HR)</th>
                                <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('drug')}>
                                    <div className="flex items-center gap-1">Rx Protocol <SortIcon field="drug" /></div>
                                </th>
                                <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('confidence')}>
                                    <div className="flex items-center gap-1">AI Conf. <SortIcon field="confidence" /></div>
                                </th>
                                <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('status')}>
                                    <div className="flex items-center gap-1">Status <SortIcon field="status" /></div>
                                </th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredResults.map((result) => (
                                <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-2 font-medium text-slate-900">{result.patientName}</td>
                                    <td className="px-4 py-2 text-slate-600">
                                        {result.profile ? `${result.profile.age} / ${result.profile.gender.charAt(0)}` : '-'}
                                    </td>
                                    <td className="px-4 py-2 text-slate-600">
                                        <span className="truncate max-w-[150px] block" title={result.condition}>{result.condition}</span>
                                    </td>
                                    <td className="px-4 py-2 text-slate-600 font-mono">
                                        {result.profile ?
                                            `${result.profile.vitals.bpSystolic}/${result.profile.vitals.bpDiastolic} • ${result.profile.vitals.heartRate}`
                                            : '-'}
                                    </td>
                                    <td className="px-4 py-2 text-purple-700 font-medium">
                                        <span className="truncate max-w-[150px] block" title={result.drug}>{result.drug}</span>
                                    </td>
                                    <td className="px-4 py-2">
                                        {result.aiPrediction ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${result.aiPrediction.confidenceScore > 80 ? 'bg-emerald-500' : result.aiPrediction.confidenceScore > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                        style={{ width: `${result.aiPrediction.confidenceScore}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500">{result.aiPrediction.confidenceScore.toFixed(0)}%</span>
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${result.status === 'Transport Needed' ? 'bg-amber-100 text-amber-700' :
                                            result.status === 'In Stock' ? 'bg-emerald-100 text-emerald-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {result.status === 'Transport Needed' && <AlertTriangle className="h-3 w-3" />}
                                            {result.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        <button
                                            onClick={() => viewPatientDetails(result)}
                                            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredResults.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500 italic">
                                        No patient records found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
