import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, ScanBarcode, Package, MapPin, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';

type LogisticsMode = 'check-in' | 'check-out';

export function LogisticsTab() {
    const [mode, setMode] = useState<LogisticsMode>('check-in');
    const [isScanning, setIsScanning] = useState(false);
    const [scannedItem, setScannedItem] = useState<{ name: string; ndc: string; currentQty: number } | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState('');
    const [sourceOrDest, setSourceOrDest] = useState('');

    const { updateInventory, sites, addNotification } = useApp();
    const { user } = useAuth();

    const handleScanMock = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            setScannedItem({
                name: 'Keytruda (Pembrolizumab)',
                ndc: '0006-3026-02',
                currentQty: 45
            });
        }, 1500);
    };

    const handleSubmit = async () => {
        if (!scannedItem || !user) return;

        const siteId = sites[0]?.id || 'site-1'; // Default to first site for now
        const qtyChange = mode === 'check-in' ? quantity : -quantity;
        const actionText = mode === 'check-in' ? 'Checked In' : 'Checked Out';

        await updateInventory(
            siteId,
            scannedItem.ndc,
            qtyChange,
            `${actionText}: ${reason} - ${mode === 'check-in' ? 'From' : 'To'} ${sourceOrDest}`,
            user.id,
            user.name
        );

        addNotification({
            id: `notif-${Date.now()}`,
            type: 'success',
            category: 'alert',
            title: `Item ${actionText}`,
            message: `${quantity} units of ${scannedItem.name} ${actionText.toLowerCase()} successfully.`,
            timestamp: new Date().toISOString(),
            read: false,
            link: '/inventory'
        });

        // Reset
        setScannedItem(null);
        setQuantity(1);
        setReason('');
        setSourceOrDest('');
    };

    return (
        <div className="space-y-6">
            {/* Mode Selection */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => { setMode('check-in'); setScannedItem(null); }}
                    className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 p-6 transition-all ${mode === 'check-in'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/50'
                        }`}
                >
                    <ArrowDownCircle className={`h-8 w-8 ${mode === 'check-in' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div className="text-center">
                        <span className="block text-lg font-bold">Check In</span>
                        <span className="text-xs opacity-80">Receive from Supplier, Transfer In, Returns</span>
                    </div>
                </button>

                <button
                    onClick={() => { setMode('check-out'); setScannedItem(null); }}
                    className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 p-6 transition-all ${mode === 'check-out'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/50'
                        }`}
                >
                    <ArrowUpCircle className={`h-8 w-8 ${mode === 'check-out' ? 'text-primary-600' : 'text-slate-400'}`} />
                    <div className="text-center">
                        <span className="block text-lg font-bold">Check Out</span>
                        <span className="text-xs opacity-80">Transfer Out, Dispense, Waste</span>
                    </div>
                </button>
            </div>

            {/* Scanner / Action Area */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-bold text-slate-900">
                        {mode === 'check-in' ? 'Inbound Processing' : 'Outbound Processing'}
                    </h3>
                    <div className={`rounded-full px-3 py-1 text-xs font-medium ${mode === 'check-in' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {mode === 'check-in' ? 'Receiving Mode' : 'Dispatch Mode'}
                    </div>
                </div>

                {!scannedItem ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="mb-4 rounded-full bg-slate-100 p-6">
                            <ScanBarcode className={`h-12 w-12 text-slate-400 ${isScanning ? 'animate-pulse text-primary-500' : ''}`} />
                        </div>
                        <h4 className="mb-2 text-lg font-medium text-slate-900">Scan Item Barcode</h4>
                        <p className="mb-6 text-sm text-slate-500">Scan medication package or enter NDC manually</p>
                        <button
                            onClick={handleScanMock}
                            disabled={isScanning}
                            className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                        >
                            {isScanning ? 'Scanning...' : 'Activate Scanner'}
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-2">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 rounded-lg bg-slate-50 p-4">
                                <div className="rounded-lg bg-white p-3 shadow-sm">
                                    <Package className="h-8 w-8 text-slate-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{scannedItem.name}</h4>
                                    <p className="text-sm text-slate-500">NDC: {scannedItem.ndc}</p>
                                    <p className="mt-1 text-xs font-medium text-slate-600">Current Stock: {scannedItem.currentQty} units</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Quantity</label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                            className="h-10 w-24 rounded-lg border border-slate-200 text-center font-medium"
                                        />
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                        {mode === 'check-in' ? 'Source (Supplier/Site)' : 'Destination (Site/Patient)'}
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={sourceOrDest}
                                            onChange={(e) => setSourceOrDest(e.target.value)}
                                            placeholder={mode === 'check-in' ? 'e.g., McKesson, Site B' : 'e.g., Clinic A, Patient Room 302'}
                                            className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Reason / Notes</label>
                                    <select
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    >
                                        <option value="">Select Reason...</option>
                                        {mode === 'check-in' ? (
                                            <>
                                                <option value="Purchase Order">Purchase Order Receipt</option>
                                                <option value="Transfer In">Transfer from another site</option>
                                                <option value="Return">Patient Return</option>
                                                <option value="Adjustment">Inventory Adjustment</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="Transfer Out">Transfer to another site</option>
                                                <option value="Dispense">Dispense to Patient</option>
                                                <option value="Waste">Expired / Damaged (Waste)</option>
                                                <option value="Return to Supplier">Return to Supplier</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setScannedItem(null)}
                                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!sourceOrDest || !reason}
                                    className={`flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors ${!sourceOrDest || !reason
                                        ? 'cursor-not-allowed bg-slate-300'
                                        : mode === 'check-in'
                                            ? 'bg-emerald-600 hover:bg-emerald-700'
                                            : 'bg-primary-600 hover:bg-blue-700'
                                        }`}
                                >
                                    Confirm {mode === 'check-in' ? 'Check In' : 'Check Out'}
                                </button>
                            </div>
                        </div>

                        {/* Summary / Preview */}
                        <div className="rounded-xl bg-slate-50 p-6">
                            <h4 className="mb-4 font-bold text-slate-900">Transaction Summary</h4>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span className="text-slate-500">Action Type</span>
                                    <span className={`font-medium ${mode === 'check-in' ? 'text-emerald-600' : 'text-primary-600'}`}>
                                        {mode === 'check-in' ? 'Check In (Add)' : 'Check Out (Remove)'}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span className="text-slate-500">Item</span>
                                    <span className="font-medium text-slate-900">{scannedItem.name}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span className="text-slate-500">Quantity</span>
                                    <span className="font-bold text-slate-900">{quantity}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span className="text-slate-500">User</span>
                                    <span className="font-medium text-slate-900">{user?.name || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                    <span className="text-slate-500">New Stock Level</span>
                                    <span className="font-bold text-slate-900">
                                        {mode === 'check-in' ? scannedItem.currentQty + quantity : scannedItem.currentQty - quantity}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 flex items-start gap-3 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                <p>This action will be logged in the audit trail and inventory levels will be updated immediately across all connected devices.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
