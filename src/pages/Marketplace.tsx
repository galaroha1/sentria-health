import { useState } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../components/marketplace/ProductCard';

import { DrugGenerator } from '../services/mock/drug-generator';

const products = DrugGenerator.generateMarketplaceListings(250);

export function Marketplace() {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ndc.includes(searchTerm) ||
        p.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
    });

    const handleSort = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Marketplace</h1>
                    <p className="text-sm text-slate-500">Source short-dated inventory at significant savings.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        <Filter className="h-4 w-4" />
                        Filters
                    </button>
                    <button
                        onClick={handleSort}
                        className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Sort: Price {sortOrder === 'asc' ? 'Low to High' : 'High to Low'}
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by drug name, NDC, or manufacturer..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
                {filteredProducts.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500">
                        No products found matching "{searchTerm}"
                    </div>
                )}
            </div>
        </div>
    );
}
