import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { GeocodingService } from '../../../services/geocoding.service';
import { MapPin, Search, Plus, Check, AlertTriangle, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Site } from '../../../types/location';

export function NetworkConfig() {
    const { sites, addSite } = useApp();
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [type, setType] = useState<Site['type']>('hospital');
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Regulatory State
    const [is340B, setIs340B] = useState(false);
    const [dscsaCompliant, setDscsaCompliant] = useState(true);
    const [deaLicense] = useState<('II' | 'III' | 'IV' | 'V')[]>(['II', 'III', 'IV', 'V']);

    const handleSearch = async () => {
        if (!address) return;
        setIsSearching(true);
        const result = await GeocodingService.searchAddress(address);
        setIsSearching(false);

        if (result) {
            setCoordinates({ lat: result.lat, lng: result.lng });
            // Auto-update address to the official one found
            setAddress(result.displayName);
        } else {
            toast.error('Address not found. Please try a more specific query.');
        }
    };

    const handleAddSite = () => {
        if (!coordinates || !name) return;

        const newSite: Site = {
            id: `site-${Date.now()}`,
            name,
            type,
            address,
            coordinates,
            phone: '(555) 000-0000', // Placeholder
            manager: 'System Admin',
            status: 'operational',
            capacity: 5000,
            currentUtilization: 0,
            departments: [], // Initialize empty
            regulatoryProfile: {
                is340B,
                dscsaCompliant,
                deaLicense,
                stateLicense: `PENDING-${Date.now()}`,
                orphanDrugExclusion: true, // Default safe
                gpoProhibition: false,
                totalDispensingStats: { transfersYTD: 0, totalDispensing: 0 }
            },
            regulatoryAvatar: 'DSH', // Default to DSH, TODO: Add UI selector
            classOfTrade: 'acute',    // Default to acute, TODO: Add UI selector
            parentEntity: 'Penn Medicine System' // Default for all sites in this demo
        };

        addSite(newSite);
        setIsAdding(false);
        resetForm();
    };

    const resetForm = () => {
        setName('');
        setAddress('');
        setCoordinates(null);
        setIs340B(false);
        setDscsaCompliant(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-medium text-slate-900">Network Configuration</h2>
                    <p className="text-sm text-slate-500">Manage sites and regulatory profiles.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add New Site
                </button>
            </div>

            {/* Add Site Form */}
            {isAdding && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6 animate-in fade-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-slate-900 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-purple-500" />
                                Site Details
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Site Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="e.g. Mount Sinai Hospital"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as Site['type'])}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="hospital">Hospital</option>
                                    <option value="clinic">Clinic</option>
                                    <option value="pharmacy">Pharmacy</option>
                                    <option value="warehouse">Warehouse</option>
                                </select>
                            </div>
                        </div>

                        {/* Location & Geocoding */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-slate-900 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-purple-500" />
                                Location (Auto-Geocoding)
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Address or Place Name</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="e.g. 1 Gustave L. Levy Pl, New York, NY"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        disabled={isSearching || !address}
                                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        {isSearching ? <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full" /> : <Search className="h-4 w-4" />}
                                    </button>
                                </div>
                                {coordinates && (
                                    <div className="mt-2 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg flex items-center gap-2">
                                        <Check className="h-4 w-4" />
                                        Found: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Regulatory Profile */}
                    <div className="border-t border-slate-200 pt-6">
                        <h3 className="font-medium text-slate-900 flex items-center gap-2 mb-4">
                            <AlertTriangle className="h-4 w-4 text-purple-500" />
                            Regulatory Profile
                        </h3>
                        <div className="flex flex-wrap gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={is340B}
                                    onChange={(e) => setIs340B(e.target.checked)}
                                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                                />
                                <span className="text-sm text-slate-700">340B Program Participant</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={dscsaCompliant}
                                    onChange={(e) => setDscsaCompliant(e.target.checked)}
                                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                                />
                                <span className="text-sm text-slate-700">DSCSA Compliant</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 text-slate-600 hover:text-slate-900"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddSite}
                            disabled={!coordinates || !name}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add Site to Network
                        </button>
                    </div>
                </div>
            )}

            {/* Sites List */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Site Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Regulatory</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {sites.map((site) => (
                            <tr key={site.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-slate-900">{site.name}</div>
                                    <div className="text-xs text-slate-500">{site.id}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 capitalize">
                                        {site.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {site.coordinates.lat.toFixed(4)}, {site.coordinates.lng.toFixed(4)}
                                    </div>
                                    <div className="text-xs truncate max-w-[200px]">{site.address}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1">
                                        {site.regulatoryProfile.is340B && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                340B
                                            </span>
                                        )}
                                        {site.regulatoryProfile.dscsaCompliant ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                                                DSCSA OK
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 ring-1 ring-red-100">
                                                Non-Compliant
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Active
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
