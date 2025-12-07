import { useState, useEffect } from 'react';
import { Clock, ShieldCheck, ShoppingCart, TrendingDown, TrendingUp, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { pricingService } from '../../services/pricingService';

interface ProductCardProps {
    id: number;
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

export function ProductCard(props: ProductCardProps) {
    const {
        id,
        name,
        manufacturer,
        ndc,
        expiryDate,
        quantity,
        price,
        originalPrice,
        seller,
        verified,
    } = props;
    const product = { id }; // Helper for handleAddToCart
    const { addToCart } = useCart();
    const [isAnimating, setIsAnimating] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);

    const savings = Math.round(((originalPrice - price) / originalPrice) * 100);

    useEffect(() => {
        // Fetch NADAC benchmark on mount
        async function checkPrice() {
            setLoadingAnalysis(true);
            const benchmarkData = await pricingService.getNadacPrice(name);
            if (benchmarkData) {
                const result = pricingService.comparePrice(price, benchmarkData.nadac_per_unit * 100); // Assuming unit conversion for demo
                setAnalysis({ ...result, benchmark: benchmarkData.nadac_per_unit * 100 });
            }
            setLoadingAnalysis(false);
        }
        checkPrice();
    }, [name, price]);

    const handleAddToCart = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setTimeout(() => {
            addToCart({
                id: product.id, // Use the actual product ID
                name,
                price,
                quantity: 1,
                seller,
            });
            setIsAnimating(false);
        }, 800);
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

                {/* Price Analysis Section */}
                <div className="mt-4 rounded-lg bg-slate-50 p-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-500">NADAC Benchmark</span>
                        {loadingAnalysis ? (
                            <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                        ) : analysis ? (
                            <span className={`flex items-center gap-1 text-xs font-bold ${analysis.isGoodDeal ? 'text-emerald-600' : 'text-red-600'}`}>
                                {analysis.isGoodDeal ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                                {analysis.isGoodDeal ? 'Below Average' : 'Above Average'}
                            </span>
                        ) : (
                            <span className="text-xs text-slate-400">Unavailable</span>
                        )}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-900">${price.toLocaleString()}</span>
                        <span className="text-sm text-slate-400 line-through">${originalPrice.toLocaleString()}</span>
                        <span className="text-sm text-slate-500">/ unit</span>
                    </div>
                </div>
            </div>

            <div className="mt-auto border-t border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-slate-600">
                        <span className="font-medium text-slate-900">{quantity}</span> units available
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={isAnimating}
                        className="relative flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-70"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        {isAnimating ? 'Adding...' : 'Add to Cart'}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isAnimating && (
                    <motion.div
                        initial={{ position: 'fixed', zIndex: 50, scale: 1, opacity: 1, top: '50%', left: '50%', x: '-50%', y: '-50%' }}
                        animate={{ top: '20px', right: '20px', left: 'auto', scale: 0.2, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="pointer-events-none fixed z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-white shadow-xl"
                    >
                        <ShoppingCart className="h-8 w-8" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
