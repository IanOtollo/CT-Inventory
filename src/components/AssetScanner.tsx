"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X } from "lucide-react";

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
  title?: string;
}

export default function AssetScanner({ isOpen, onClose, onScan, title = "Scan Asset" }: ScannerModalProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
      return;
    }

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        // Use a rectangular box which is much better for scanning 1D barcodes (serial numbers)
        qrbox: { width: 350, height: 150 },
        // Explicitly declare support for common inventory barcode types
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ]
      },
      /* verbose= */ false
    );
    
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScan(decodedText);
        onClose();
      },
      (errorMessage) => {
        // We ignore continuous scan errors as they just mean "no code found yet"
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [isOpen, onScan, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="font-heading font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        <div className="p-4 bg-gray-50 flex-1">
          <div id="qr-reader" className="w-full h-full min-h-[300px]"></div>
          <p className="text-center text-sm text-gray-500 mt-4">
            Point your camera at the barcode or QR code.
          </p>
        </div>
      </div>
    </div>
  );
}
