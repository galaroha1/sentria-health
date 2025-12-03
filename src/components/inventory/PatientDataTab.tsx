import { useState } from 'react';
import { Search, Filter, Eye, User } from 'lucide-react';
import { format } from 'date-fns';
import { useSimulation } from '../../context/SimulationContext';

export function PatientDataTab() {
    const { simulationResults, viewPatientDetails } = useSimulation();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredResults = simulationResults.filter(result =>
        result.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.drug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.condition.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Patient Data</h2>
                    <p className="text-slate-500">Comprehensive view of all simulated patient logistics events.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search patients, drugs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-64 rounded-lg border border-slate-200 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        <Filter className="h-4 w-4" />
                        Filter
                    </button>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Patient Name</th>
                                <th className="px-6 py-4">Condition</th>
                                <th className="px-6 py-4">Visit Type</th>
                                <th className="px-6 py-4">Predicted Drug</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredResults.length > 0 ? (
                                filteredResults.map((result) => (
                                    <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <span className="font-medium text-slate-900">{result.patientName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{result.condition}</td>
                                        <td className="px-6 py-4 text-slate-600">{result.visitType}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-purple-700">{result.drug}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${result.status === 'Transport Needed'
                                                ? 'bg-amber-100 text-amber-800'
                                                : result.status === 'In Stock'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {result.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {format(result.date, 'MMM d, yyyy')} • {result.timeStr}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => viewPatientDetails(result)}
                                                className="inline-flex items-center gap-1 rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        No patient data found. Run the simulation in the Advanced tab to generate data.
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
