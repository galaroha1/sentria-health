import { Clock, ShieldCheck, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
    name: string;
    manufacturer: string;
    ndc: string;
    expiryDate: string;
    quantity: number;
    price: number;
    originalPrice: number;
    seller: string;
    verified: boolean;
}

export function ProductCard({
    name,
    manufacturer,
    ndc,
    expiryDate,
    quantity,
    price,
    originalPrice,
    seller,
    verified,
}: ProductCardProps) {
    const { addToCart } = useCart();
    const savings = Math.round(((originalPrice - price) / originalPrice) * 100);

    const handleAddToCart = () => {
        addToCart({
            id: Math.random(), // In a real app, use actual ID
            name,
            price,
            quantity: 1,
            seller,
        });
    };

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
            <div className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-bold text-slate-900">{name}</h3>
                        <p className="text-sm text-slate-500">{manufacturer}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 border border-emerald-100">
                        {savings}% OFF
                    </span>
                </div>

                <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="font-medium text-slate-900">NDC:</span> {ndc}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span>Expires: {expiryDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <ShieldCheck className={`h-4 w-4 ${verified ? 'text-primary-500' : 'text-slate-400'}`} />
                        <span>{seller}</span>
                    </div>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">${price.toLocaleString()}</span>
                    <span className="text-sm text-slate-400 line-through">${originalPrice.toLocaleString()}</span>
                    <span className="text-sm text-slate-500">/ unit</span>
                </div>
            </div>

            <div className="mt-auto border-t border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-slate-600">
                        <span className="font-medium text-slate-900">{quantity}</span> units available
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
