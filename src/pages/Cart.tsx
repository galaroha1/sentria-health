import { useState } from 'react';
import { Trash2, Truck, ShieldCheck, CreditCard, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export function Cart() {
    const { items, removeFromCart, checkout, total } = useCart();
    const [orderComplete, setOrderComplete] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [orderId, setOrderId] = useState('');

    if (items.length === 0 && !orderComplete) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-slate-100 p-6">
                    <Truck className="h-12 w-12 text-slate-400" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900">Your cart is empty</h2>
                <p className="mt-2 text-slate-500">Start adding items from the marketplace.</p>
                <Link
                    to="/marketplace"
                    className="mt-6 rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                    Browse Marketplace
                </Link>
            </div>
        );
    }

    if (orderComplete) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-emerald-100 p-6">
                    <CheckCircle className="h-12 w-12 text-emerald-600" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900">Order Placed Successfully</h2>
                <p className="mt-2 text-slate-500">Order #{orderId} has been confirmed.</p>
                <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="font-medium text-slate-900">Logistics Status</h3>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                        <Truck className="h-4 w-4 text-primary-500" />
                        <span>Cold Chain Transport Scheduled</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        <span>DSCSA Verification Complete</span>
                    </div>
                </div>
                <Link
                    to="/"
                    className="mt-8 rounded-lg bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl">
            <h1 className="mb-8 text-2xl font-bold text-slate-900">Shopping Cart</h1>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <ul className="divide-y divide-slate-100">
                            {items.map((item) => (
                                <li key={item.id} className="flex items-center justify-between p-6">
                                    <div>
                                        <h3 className="font-medium text-slate-900">{item.name}</h3>
                                        <p className="text-sm text-slate-500">Seller: {item.seller}</p>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-emerald-600">
                                            <ShieldCheck className="h-3 w-3" />
                                            Verified Seller
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="font-medium text-slate-900">${item.price.toLocaleString()}</p>
                                            <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900">Logistics & Compliance</h3>
                        <div className="mt-4 space-y-4">
                            <label className="flex items-start gap-3 rounded-lg border border-primary-200 bg-primary-50 p-4">
                                <input type="radio" name="shipping" defaultChecked className="mt-1 text-primary-600" />
                                <div>
                                    <span className="block font-medium text-slate-900">Cold Chain Express</span>
                                    <span className="block text-sm text-slate-600">Temperature controlled, 24hr delivery</span>
                                    <span className="mt-1 block text-xs font-medium text-primary-700">Required for biologics</span>
                                </div>
                                <span className="ml-auto font-medium text-slate-900">$150.00</span>
                            </label>

                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                <span>Transaction will be recorded for DSCSA compliance</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900">Order Summary</h3>
                        <div className="mt-4 space-y-3 border-b border-slate-100 pb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Subtotal</span>
                                <span className="font-medium text-slate-900">${total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Shipping (Cold Chain)</span>
                                <span className="font-medium text-slate-900">$150.00</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Tax</span>
                                <span className="font-medium text-slate-900">$0.00</span>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-between">
                            <span className="font-bold text-slate-900">Total</span>
                            <span className="font-bold text-slate-900">${(total + 150).toLocaleString()}</span>
                        </div>

                        <button
                            onClick={async () => {
                                setIsCheckingOut(true);
                                try {
                                    const id = await checkout();
                                    setOrderId(id);
                                    setOrderComplete(true);
                                } catch (err) {
                                    console.error("Checkout failed:", err);
                                } finally {
                                    setIsCheckingOut(false);
                                }
                            }}
                            disabled={isCheckingOut}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isCheckingOut ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <CreditCard className="h-4 w-4" />
                                    Place Order
                                </>
                            )}
                        </button>

                        <p className="mt-4 text-center text-xs text-slate-500">
                            Secure payment processing via Stripe.
                            <br />
                            Encrypted & HIPAA Compliant.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
