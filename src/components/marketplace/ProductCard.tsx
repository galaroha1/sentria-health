import { useState } from 'react';
import { Clock, ShieldCheck, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [isAnimating, setIsAnimating] = useState(false);
    const savings = Math.round(((originalPrice - price) / originalPrice) * 100);

    const handleAddToCart = () => {
        // Prevent multiple clicks
        if (isAnimating) return;

        setIsAnimating(true);

        // Wait for animation to finish before actually adding to cart
        setTimeout(() => {
            addToCart({
                id: Math.random(), // In a real app, use actual ID
                name,
                price,
                quantity: 1,
                seller,
            });
            setIsAnimating(false);
        }, 800); // Match animation duration
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
                        disabled={isAnimating}
                        className="relative flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-70"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        {isAnimating ? 'Adding...' : 'Add to Cart'}
                    </button>
                </div>
            </div>

            {/* Flying Animation Element */}
            <AnimatePresence>
                {isAnimating && (
                    <motion.div
                        initial={{
                            position: 'fixed',
                            zIndex: 50,
                            scale: 1,
                            opacity: 1,
                            // We need to calculate these dynamically or use a simpler fixed start for now
                            // Since we don't have refs easily set up for exact button position without more code,
                            // let's center it on the screen or use a generic "fly up" animation.
                            // Better: use layoutId or just animate from center of card to top right of screen.
                            top: '50%',
                            left: '50%',
                            x: '-50%',
                            y: '-50%'
                        }}
                        animate={{
                            top: '20px', // Approximate header cart position
                            right: '20px', // Approximate header cart position
                            left: 'auto',
                            scale: 0.2,
                            opacity: 0
                        }}
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
