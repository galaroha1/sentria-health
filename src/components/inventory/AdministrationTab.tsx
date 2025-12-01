import { useState } from 'react';
import { User, ScanBarcode, Syringe, CheckCircle2, History } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export function AdministrationTab() {
    const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'match' | 'mismatch'>('idle');
    const { updateInventory, sites, addNotification } = useApp();
    const { user } = useAuth();

    const patients = [
        { id: 'P-101', name: 'John Doe', dob: '1980-05-12', room: '304-A' },
        { id: 'P-102', name: 'Jane Smith', dob: '1992-11-23', room: '201-B' },
        { id: 'P-103', name: 'Robert Johnson', dob: '1975-03-15', room: 'ICU-4' },
    ];

    const handleScan = () => {
        setScanStatus('scanning');
        setTimeout(() => {
            // Mock scan result
            setScanStatus('match');
        }, 1500);
    };

    const handleConfirmAdministration = async () => {
        if (!user || !selectedPatient) return;

        const patient = patients.find(p => p.id === selectedPatient);
        const targetSiteId = sites[0]?.id || 'site-1';
        const drugName = 'Keytruda (Pembrolizumab)';
        const ndc = '0006-3026-02'; // Mock NDC matching the one in ProcurementTab

        await updateInventory(
            targetSiteId,
            ndc,
            -1, // Deduct 1 unit
            `Bedside Admin: ${patient?.name}`,
            user.id,
            user.name
        );

        addNotification({
            id: `notif-${Date.now()}`,
            type: 'success',
            category: 'alert',
            title: 'Administration Recorded',
            message: `Administered ${drugName} to ${patient?.name}`,
            timestamp: new Date().toISOString(),
            read: false,
            link: '/inventory'
        });

        // Reset state
        setScanStatus('idle');
        setSelectedPatient(null);
    };

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Patient Selection */}
            <div className="space-y-4 lg:col-span-1">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-slate-900">Select Patient</h3>
                    <div className="space-y-3">
                        {patients.map(patient => (
                            <button
                                key={patient.id}
                                onClick={() => {
                                    setSelectedPatient(patient.id);
                                    setScanStatus('idle');
                                }}
                                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${selectedPatient === patient.id
                                    ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                                    : 'border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                                    <User className="h-5 w-5 text-slate-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">{patient.name}</p>
                                    <p className="text-xs text-slate-500">Room {patient.room} • DOB: {patient.dob}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Administration Interface */}
            <div className="space-y-6 lg:col-span-2">
                {selectedPatient ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Bedside Administration</h3>
                                <p className="text-sm text-slate-500">Scan medication to verify match with patient orders</p>
                            </div>
                            <div className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                                {patients.find(p => p.id === selectedPatient)?.name}
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center py-8">
                            {scanStatus === 'idle' && (
                                <div className="text-center">
                                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
                                        <ScanBarcode className="h-10 w-10 text-slate-400" />
                                    </div>
                                    <button
                                        onClick={handleScan}
                                        className="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700"
                                    >
                                        Scan Medication Barcode
                                    </button>
                                </div>
                            )}

                            {scanStatus === 'scanning' && (
                                <div className="text-center">
                                    <div className="mx-auto mb-4 flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-primary-50">
                                        <ScanBarcode className="h-10 w-10 text-primary-500" />
                                    </div>
                                    <p className="font-medium text-slate-900">Scanning...</p>
                                </div>
                            )}

                            {scanStatus === 'match' && (
                                <div className="w-full max-w-md space-y-6">
                                    <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-4 text-emerald-800">
                                        <CheckCircle2 className="h-6 w-6" />
                                        <div>
                                            <p className="font-bold">Match Confirmed</p>
                                            <p className="text-sm">Keytruda 100mg/4mL matches order #ORD-8821</p>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-slate-200 p-4">
                                        <h4 className="mb-3 font-medium text-slate-900">Administration Details</h4>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-slate-500">Dose</label>
                                                <input type="text" value="200 mg" readOnly className="w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-slate-500">Route</label>
                                                <input type="text" value="IV Infusion" readOnly className="w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleConfirmAdministration}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
                                    >
                                        <Syringe className="h-5 w-5" />
                                        Confirm Administration
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-slate-400">
                        <p>Select a patient to begin administration workflow</p>
                    </div>
                )}

                {/* Recent History */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <History className="h-5 w-5 text-slate-500" />
                        <h3 className="text-lg font-bold text-slate-900">Recent Administrations</h3>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="text-slate-500">
                            <tr>
                                <th className="pb-2 font-medium">Time</th>
                                <th className="pb-2 font-medium">Patient</th>
                                <th className="pb-2 font-medium">Medication</th>
                                <th className="pb-2 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="py-3 text-slate-500">10:30 AM</td>
                                <td className="py-3 font-medium text-slate-900">John Doe</td>
                                <td className="py-3 text-slate-600">Remicade</td>
                                <td className="py-3"><span className="text-emerald-600 font-medium">Completed</span></td>
                            </tr>
                            <tr>
                                <td className="py-3 text-slate-500">09:15 AM</td>
                                <td className="py-3 font-medium text-slate-900">Jane Smith</td>
                                <td className="py-3 text-slate-600">Herceptin</td>
                                <td className="py-3"><span className="text-emerald-600 font-medium">Completed</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
