
import { useState, useEffect } from 'react';
import { X, Building2, Plus } from 'lucide-react';

interface AddVendorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (vendor: any) => void;
}

export function AddVendorModal({ isOpen, onClose, onAdd }: AddVendorModalProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState('Wholesaler');
    const [contactName, setContactName] = useState('');
    const [email, setEmail] = useState('');

    // Handle Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            id: Date.now(),
            name,
            type,
            score: 100, // Default new vendors to perfect score until data comes in
            onTime: 'N/A',
            fillRate: 'N/A',
            rebates: '$0',
            status: 'Good'
        });
        onClose();
        setName('');
        setContactName('');
        setEmail('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity">
            <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-200 p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-primary-600">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Add New Vendor</h2>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Vendor Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="e.g. Acme Pharmaceuticals"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Vendor Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option>Wholesaler</option>
                            <option>Manufacturer</option>
                            <option>Marketplace Seller</option>
                            <option>GPO</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Contact Name</label>
                            <input
                                type="text"
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                placeholder="john@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Vendor
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
