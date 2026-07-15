"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, Camera, RefreshCw } from "lucide-react";

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
  title?: string;
}

export default function AssetScanner({ isOpen, onClose, onScan, title = "Scan Asset Tag" }: ScannerModalProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string>("");
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error).finally(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        });
      }
      return;
    }

    setIsStarting(true);
    setError("");

    // Create the scanner instance directly to bypass the file upload fallback UI
    const scanner = new Html5Qrcode("qr-reader", { 
      verbose: false,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.EAN_13,
      ]
    });
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: "environment" }, // Request rear camera
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      (decodedText) => {
        scanner.stop().then(() => {
          scanner.clear();
          onScan(decodedText);
          onClose();
        }).catch(console.error);
      },
      (errorMessage) => {
        // We ignore continuous scan errors as they just mean "no code found yet"
      }
    ).catch((err) => {
      console.error("Camera start error:", err);
      setError("Could not access the camera. Please ensure you have granted camera permissions in your browser settings.");
    }).finally(() => {
      setIsStarting(false);
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error).finally(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        });
      }
    };
  }, [isOpen, onScan, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-[var(--color-busia-blue)]" />
            <h3 className="font-heading font-bold text-lg text-gray-800">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 bg-white flex-1 flex flex-col items-center">
          {error ? (
            <div className="text-center p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 w-full">
              {error}
            </div>
          ) : (
            <div className="relative w-full max-w-[300px] aspect-square rounded-xl overflow-hidden shadow-inner border-2 border-gray-100 bg-black flex items-center justify-center">
              {isStarting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
                  <RefreshCw className="w-8 h-8 text-[var(--color-busia-blue)] animate-spin mb-3" />
                  <p className="text-white text-sm font-medium">Accessing Camera...</p>
                  <p className="text-gray-400 text-xs mt-1 text-center px-4">If prompted, please allow camera permissions.</p>
                </div>
              )}
              <div id="qr-reader" className="w-full h-full"></div>
            </div>
          )}
          <p className="text-center text-sm text-gray-500 mt-6 font-medium">
            Center the barcode or QR code in the frame to scan automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
