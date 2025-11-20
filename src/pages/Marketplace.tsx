import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../components/marketplace/ProductCard';

const products = [
    {
        id: 1,
        name: 'Keytruda (Pembrolizumab)',
        manufacturer: 'Merck & Co.',
        ndc: '0006-3026-02',
        expiryDate: '2025-08-15',
        quantity: 15,
        price: 3100,
        originalPrice: 4200,
        seller: 'Mercy General Hospital',
        verified: true,
    },
    {
        id: 2,
        name: 'Opdivo (Nivolumab)',
        manufacturer: 'Bristol Myers Squibb',
        ndc: '0003-3772-11',
        expiryDate: '2025-06-20',
        quantity: 8,
        price: 2450,
        originalPrice: 3100,
        seller: 'St. Mary\'s Medical Center',
        verified: true,
    },
    {
        id: 3,
        name: 'Rituxan (Rituximab)',
        manufacturer: 'Genentech',
        ndc: '50242-051-21',
        expiryDate: '2025-05-10',
        quantity: 20,
        price: 850,
        originalPrice: 1200,
        seller: 'Northwest Oncology',
        verified: true,
    },
    {
        id: 4,
        name: 'Herceptin (Trastuzumab)',
        manufacturer: 'Genentech',
        ndc: '50242-132-01',
        expiryDate: '2025-07-01',
        quantity: 12,
        price: 1100,
        originalPrice: 1500,
        seller: 'City Hope Hospital',
        verified: true,
    },
    {
        id: 5,
        name: 'Avastin (Bevacizumab)',
        manufacturer: 'Amgen',
        ndc: '55513-207-01',
        expiryDate: '2025-09-30',
        quantity: 25,
        price: 680,
        originalPrice: 950,
        seller: 'Regional Cancer Center',
        verified: true,
    },
    {
        id: 6,
        name: 'Remicade (Infliximab)',
        manufacturer: 'Janssen',
        ndc: '57894-030-01',
        expiryDate: '2025-04-15',
        quantity: 10,
        price: 550,
        originalPrice: 800,
        seller: 'Community Health Network',
        verified: true,
    },
];

export function Marketplace() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Marketplace</h1>
                    <p className="text-sm text-slate-500">Source short-dated inventory at significant savings.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        <Filter className="h-4 w-4" />
                        Filters
                    </button>
                    <button className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                        <SlidersHorizontal className="h-4 w-4" />
                        Sort
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by drug name, NDC, or manufacturer..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>
        </div>
    );
}
