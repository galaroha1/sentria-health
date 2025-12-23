import { useState } from 'react';
import { Truck, Thermometer, ScanBarcode, CheckCircle2, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export function ProcurementTab() {
    const [isScanning, setIsScanning] = useState(false);
    const [scannedItem, setScannedItem] = useState<{ name: string; ndc: string; temp: number } | null>(null);
    const { updateInventory, sites, addNotification } = useApp();
    const { user } = useAuth();

    const handleScanMock = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            setScannedItem({
                name: 'Keytruda (Pembrolizumab)',
                ndc: '0006-3026-02',
                temp: 4.2 // Celsius
            });

        }, 1500);
    };

    const handleConfirmReceipt = async () => {
        if (!scannedItem || !user) return;

        // Default to the first site if user doesn't have one assigned (mock logic)
        const targetSiteId = sites[0]?.id || 'site-1';
        const quantityReceived = 50; // Mock quantity

        await updateInventory(
            targetSiteId,
            scannedItem.ndc,
            quantityReceived,
            'Shipment Received',
            user.id,
            user.name
        );

        addNotification({
            id: `notif-${Date.now()}`,
            type: 'success',
            category: 'alert',
            title: 'Shipment Received',
            message: `Received ${quantityReceived} units of ${scannedItem.name}`,
            timestamp: new Date().toISOString(),
            read: false,
            link: '/inventory'
        });

        setScannedItem(null);
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Receiving Area */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Receive Shipment</h3>
                        <div className="rounded-full bg-blue-100 p-2 text-primary-600">
                            <Truck className="h-5 w-5" />
                        </div>
                    </div>

                    {!scannedItem ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 py-12">
                            <div className="mb-4 rounded-full bg-slate-100 p-4">
                                <ScanBarcode className={`h-8 w-8 text-slate-400 ${isScanning ? 'animate-pulse text-blue-500' : ''}`} />
                            </div>
                            <button
                                onClick={handleScanMock}
                                disabled={isScanning}
                                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                            >
                                {isScanning ? 'Scanning...' : 'Scan Incoming Package'}
                            </button>
                            <p className="mt-2 text-xs text-slate-500">Supports Barcode & RFID</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 rounded-lg bg-slate-50 p-4">
                                <div className="rounded-lg bg-white p-2 shadow-sm">
                                    <Package className="h-8 w-8 text-slate-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{scannedItem.name}</h4>
                                    <p className="text-sm text-slate-500">NDC: {scannedItem.ndc}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Verified
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                            Lot: K99281
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-slate-200 p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700">Cold Chain Status</span>
                                    <span className={`flex items-center gap-1 text-sm font-bold ${scannedItem.temp > 8 || scannedItem.temp < 2 ? 'text-red-600' : 'text-emerald-600'}`}>
                                        <Thermometer className="h-4 w-4" />
                                        {scannedItem.temp}°C
                                    </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full w-1/2 bg-emerald-500" style={{ width: '60%' }} />
                                </div>
                                <p className="mt-1 text-xs text-slate-500">Maintained within 2°C - 8°C range during transit</p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setScannedItem(null)}
                                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmReceipt}
                                    className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                                >
                                    Confirm Receipt
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Shipments */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-slate-900">Recent Shipments</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                                        <Truck className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">PO-2024-00{i}</p>
                                        <p className="text-xs text-slate-500">McKesson • Arrived 2h ago</p>
                                    </div>
                                </div>
                                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                                    Completed
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
