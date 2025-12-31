import { useState, useEffect } from 'react';
import { Search, Filter, Download, ChevronDown, ChevronUp, AlertTriangle, UserPlus } from 'lucide-react';
import { useSimulation } from '../../clinical/context/SimulationContext';
import { AddPatientModal } from './AddPatientModal';
import { PatientDetailsModal } from './PatientDetailsModal';


export function PatientDataTab() {
    const { simulationResults, viewPatientDetails, fetchSimulations, loading, stats, selectedPatient, setSelectedPatient } = useSimulation();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<string>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [hasMore, setHasMore] = useState(true);

    // Initial Load
    useEffect(() => {
        loadData(true);
    }, [sortField, sortDirection]);

    const loadData = async (reset: boolean = false) => {
        const startAfter = reset ? null : lastDoc;
        const result = await fetchSimulations(20, startAfter, sortField, sortDirection);

        if (result.data.length < 20) {
            setHasMore(false);
        } else {
            setHasMore(true);
        }

        if (reset) {
            setLastDoc(result.lastVisible);
        } else {
            setLastDoc(result.lastVisible);
        }
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) return <div className="w-4" />;
        return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Filter results locally for now since Firestore search is complex
    const filteredResults = simulationResults.filter(r =>
        r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.drug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search usage..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:block text-sm text-slate-500">
                        Total Patients: <span className="font-bold text-slate-900">{stats.totalPatients}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 shadow-sm"
                        >
                            <UserPlus className="h-4 w-4" />
                            Add Patient
                        </button>
                        <button
                            onClick={() => loadData(true)}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
                        </button>
                        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            <Filter className="h-4 w-4" />
                        </button>
                        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            <Download className="h-4 w-4" />
                        </button>
                    </div>
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
                                <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('aiPrediction.confidenceScore')}>
                                    <div className="flex items-center gap-1">AI Conf. <SortIcon field="aiPrediction.confidenceScore" /></div>
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
                                            className="text-primary-600 hover:text-blue-800 font-medium hover:underline"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {simulationResults.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500 italic">
                                        No patient records found.
                                    </td>
                                </tr>
                            )}
                            {loading && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                                        Loading data...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Load More Button (Simpler than full pagination for now) */}
                {hasMore && !loading && simulationResults.length > 0 && (
                    <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-center">
                        <button
                            onClick={() => loadData(false)}
                            className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline"
                        >
                            Load More Patients
                        </button>
                    </div>
                )}
            </div>

            {isAddModalOpen && (
                <AddPatientModal onClose={() => setIsAddModalOpen(false)} />
            )}

            {selectedPatient && (
                <PatientDetailsModal
                    patient={selectedPatient}
                    onClose={() => setSelectedPatient(null)}
                />
            )}
        </div>
    );
}
