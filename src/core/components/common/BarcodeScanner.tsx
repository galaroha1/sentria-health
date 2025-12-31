import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera, AlertCircle } from 'lucide-react';

interface BarcodeScannerProps {
    onScan: (decodedText: string) => void;
    onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Initialize scanner
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            },
            /* verbose= */ false
        );

        scanner.render(
            (decodedText) => {
                onScan(decodedText);
                // Optional: Stop scanning after success if desired, 
                // but usually we let the parent control that via onClose or state
            },
            (errorMessage) => {
                // parse error, ignore it.
                if (errorMessage && errorMessage.length > 1000) {
                    setError("Scanner error"); // Just to use the setter
                }
            }
        );

        scannerRef.current = scanner;

        // Cleanup
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode scanner. ", error);
                });
            }
        };
    }, [onScan]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 p-4">
                    <div className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-primary-600" />
                        <h3 className="font-bold text-slate-900">Scan Barcode</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div id="reader" className="overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50"></div>

                    <div className="mt-4 text-center text-sm text-slate-500">
                        <p>Point your camera at a barcode or QR code.</p>
                        <p className="mt-1 text-xs text-slate-400">Supported formats: UPC, EAN, Code 128, QR</p>
                    </div>

                    {error && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
