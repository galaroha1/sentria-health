import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Filter, Calendar, ArrowUpRight, ArrowDownLeft, RefreshCw, AlertCircle, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function AuditLog() {
    const { auditLogs } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('all');
    const [siteFilter, setSiteFilter] = useState<string>('all');

    // Get unique sites from logs for filter
    const sites = Array.from(new Set(auditLogs.map(log => log.siteName))).sort();

    const filteredLogs = auditLogs.filter(log => {
        const matchesSearch =
            log.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.reason?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesAction = actionFilter === 'all' || log.action === actionFilter;
        const matchesSite = siteFilter === 'all' || log.siteName === siteFilter;

        return matchesSearch && matchesAction && matchesSite;
    });

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'add': return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
            case 'remove': return <ArrowUpRight className="h-4 w-4 text-red-500" />;
            case 'transfer': return <RefreshCw className="h-4 w-4 text-blue-500" />;
            case 'adjustment': return <Edit className="h-4 w-4 text-orange-500" />;
            default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getActionLabel = (action: string) => {
        switch (action) {
            case 'add': return 'Stock Added';
            case 'remove': return 'Stock Removed';
            case 'transfer': return 'Transfer';
            case 'adjustment': return 'Adjustment';
            default: return action;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Track all inventory changes and movements across the network
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn btn-secondary">
                        <Calendar className="h-4 w-4 mr-2" />
                        Export Log
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by drug, user, or reason..."
                        className="pl-10 w-full input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            className="pl-10 input pr-8"
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                        >
                            <option value="all">All Actions</option>
                            <option value="add">Stock Added</option>
                            <option value="remove">Stock Removed</option>
                            <option value="transfer">Transfer</option>
                            <option value="adjustment">Adjustment</option>
                        </select>
                    </div>
                    <select
                        className="input"
                        value={siteFilter}
                        onChange={(e) => setSiteFilter(e.target.value)}
                    >
                        <option value="all">All Sites</option>
                        {sites.map(site => (
                            <option key={site} value={site}>{site}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Log Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-3">Timestamp</th>
                                <th className="px-6 py-3">Action</th>
                                <th className="px-6 py-3">Item Details</th>
                                <th className="px-6 py-3">Location</th>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Reason</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(log.timestamp).toLocaleString()}
                                            <span className="block text-xs text-gray-400">
                                                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-full bg-gray-100`}>
                                                    {getActionIcon(log.action)}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {getActionLabel(log.action)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{log.drugName}</div>
                                            <div className="text-xs text-gray-500">NDC: {log.ndc}</div>
                                            <div className={`text-xs font-medium mt-1 ${log.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {log.quantityChange > 0 ? '+' : ''}{log.quantityChange} units
                                                <span className="text-gray-400 font-normal ml-1">
                                                    (New Total: {log.newQuantity})
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {log.siteName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{log.userName}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {log.reason || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="p-3 bg-gray-100 rounded-full mb-3">
                                                <Search className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <p className="text-base font-medium text-gray-900">No logs found</p>
                                            <p className="text-sm mt-1">Try adjusting your search or filters</p>
                                        </div>
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
