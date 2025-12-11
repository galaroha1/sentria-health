import { useState } from 'react';
import { Star, TrendingUp, AlertCircle, CheckCircle2, Building2 } from 'lucide-react';
import { AddVendorModal } from '../components/vendors/AddVendorModal';

const INITIAL_VENDORS = [
    {
        id: 1,
        name: 'McKesson Specialty Health',
        type: 'Wholesaler',
        score: 98,
        onTime: '99.5%',
        fillRate: '100%',
        rebates: '$12,450',
        status: 'Excellent',
    },
    {
        id: 2,
        name: 'AmerisourceBergen',
        type: 'Wholesaler',
        score: 96,
        onTime: '98.2%',
        fillRate: '99.1%',
        rebates: '$8,320',
        status: 'Good',
    },
    {
        id: 3,
        name: 'Mercy General Hospital',
        type: 'Marketplace Seller',
        score: 92,
        onTime: '95.0%',
        fillRate: '100%',
        rebates: 'N/A',
        status: 'Good',
    },
    {
        id: 4,
        name: 'Cardinal Health',
        type: 'Wholesaler',
        score: 88,
        onTime: '92.5%',
        fillRate: '96.0%',
        rebates: '$5,100',
        status: 'Warning',
    },
];

export function Vendors() {
    const [vendors, setVendors] = useState(INITIAL_VENDORS);
    const [showAddModal, setShowAddModal] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAddVendor = (newVendor: any) => {
        setVendors([...vendors, newVendor]);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Vendor Management</h1>
                    <p className="text-sm text-slate-500">Monitor vendor performance and track rebates.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                    Add New Vendor
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Active Vendors</p>
                            <p className="text-2xl font-bold text-slate-900">{vendors.length}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Rebates (YTD)</p>
                            <p className="text-2xl font-bold text-slate-900">$45,280</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Pending Reviews</p>
                            <p className="text-2xl font-bold text-slate-900">3</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4">
                    <h3 className="font-bold text-slate-900">Vendor Performance Scorecards</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-6 py-3 font-medium">Vendor Name</th>
                                <th className="px-6 py-3 font-medium">Type</th>
                                <th className="px-6 py-3 font-medium">Overall Score</th>
                                <th className="px-6 py-3 font-medium">On-Time Delivery</th>
                                <th className="px-6 py-3 font-medium">Order Fill Rate</th>
                                <th className="px-6 py-3 font-medium">Pending Rebates</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {vendors.map((vendor) => (
                                <tr key={vendor.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{vendor.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{vendor.type}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-slate-900">{vendor.score}</span>
                                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{vendor.onTime}</td>
                                    <td className="px-6 py-4 text-slate-600">{vendor.fillRate}</td>
                                    <td className="px-6 py-4 font-medium text-emerald-600">{vendor.rebates}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${vendor.status === 'Excellent' ? 'bg-emerald-100 text-emerald-700' :
                                            vendor.status === 'Good' ? 'bg-blue-100 text-blue-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                            {vendor.status === 'Excellent' && <CheckCircle2 className="h-3 w-3" />}
                                            {vendor.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddVendorModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddVendor}
            />
        </div>
    );
}
