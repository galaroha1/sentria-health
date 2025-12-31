import { useState, useEffect } from 'react';
import { Search, Package, MapPin, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const { sites, inventories } = useApp();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    if (!isOpen) return null;

    const filteredSites = sites.filter(s => s.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3);
    const filteredDrugs = inventories
        .flatMap(inv => inv.drugs)
        .filter((d, i, self) =>
            (d.drugName || '').toLowerCase().includes(query.toLowerCase()) &&
            self.findIndex(t => (t.drugName || '') === (d.drugName || '')) === i
        ).slice(0, 5);

    const handleNavigate = (path: string) => {
        navigate(path);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 pt-[20vh] backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
                <div className="flex items-center border-b border-slate-200 px-4 py-3">
                    <Search className="h-5 w-5 text-slate-400" />
                    <input
                        className="flex-1 bg-transparent px-3 text-lg outline-none placeholder:text-slate-400"
                        placeholder="Search for anything..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                    <button onClick={() => setIsOpen(false)}>
                        <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {query === '' && (
                        <div className="px-4 py-8 text-center text-sm text-slate-500">
                            Type to search for drugs, locations, or actions...
                        </div>
                    )}

                    {query !== '' && (
                        <div className="space-y-4">
                            {filteredDrugs.length > 0 && (
                                <div>
                                    <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-slate-500">Inventory</h3>
                                    {filteredDrugs.map((drug, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleNavigate('/inventory')}
                                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-100"
                                        >
                                            <Package className="h-4 w-4 text-slate-400" />
                                            <span className="flex-1 font-medium text-slate-900">{drug.drugName || 'Unknown Drug'}</span>
                                            <span className="text-xs text-slate-500">View Stock</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {filteredSites.length > 0 && (
                                <div>
                                    <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-slate-500">Locations</h3>
                                    {filteredSites.map((site) => (
                                        <button
                                            key={site.id}
                                            onClick={() => handleNavigate('/logistics')}
                                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-100"
                                        >
                                            <MapPin className="h-4 w-4 text-slate-400" />
                                            <span className="flex-1 font-medium text-slate-900">{site.name}</span>
                                            <span className="text-xs text-slate-500">View Map</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div>
                                <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-slate-500">Actions</h3>
                                <button
                                    onClick={() => handleNavigate('/logistics')}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-100"
                                >
                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                    <span className="flex-1 font-medium text-slate-900">New Transfer Request</span>
                                </button>
                                <button
                                    onClick={() => handleNavigate('/marketplace')}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-100"
                                >
                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                    <span className="flex-1 font-medium text-slate-900">Order Supplies</span>
                                </button>
                                <button
                                    onClick={() => handleNavigate('/command-center')}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-100"
                                >
                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                    <span className="flex-1 font-medium text-slate-900">Open AI Command Center</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-500">
                    Press <kbd className="rounded border border-slate-300 bg-white px-1 font-sans">Esc</kbd> to close
                </div>
            </div>
        </div>
    );
}
