"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function DedicatedScanPage() {
  const router = useRouter();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "full-screen-qr-reader",
      { fps: 10, qrbox: { width: 300, height: 300 } },
      /* verbose= */ false
    );
    
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        // Stop scanning after a successful scan
        scanner.clear();
        // In a real app, we'd query the DB to find the asset ID. 
        // For now, redirect with the tag as a param or directly to the detail view.
        router.push(`/portal/equipment/${encodeURIComponent(decodedText)}`);
      },
      (errorMessage) => {
        // Ignore continuous scan errors
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [router]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-busia-black)]">Scan Asset</h1>
          <p className="text-sm text-gray-500 mt-1">Look up an existing asset to update status or reassign.</p>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 flex flex-col items-center justify-center min-h-[60vh]">
        
        {error ? (
          <div className="text-center space-y-4">
            <div className="text-[var(--color-status-warning)] bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <p className="font-medium">Camera Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button 
              onClick={() => router.push("/portal/equipment")}
              className="px-4 py-2 bg-[var(--color-busia-blue)] text-white rounded-md"
            >
              Go to Manual Search
            </button>
          </div>
        ) : (
          <div className="w-full max-w-lg space-y-6">
            <div id="full-screen-qr-reader" className="w-full rounded-lg overflow-hidden border-2 border-[var(--color-busia-green)]"></div>
            <div className="text-center">
              <p className="text-gray-600">Point your camera at the asset's QR code or barcode.</p>
              <p className="text-sm text-gray-400 mt-2">The record will open automatically upon successful scan.</p>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
