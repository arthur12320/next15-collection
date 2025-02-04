"use client";

import { Button } from "@/components/ui/button";
import Quagga from "@ericblade/quagga2";
import { useEffect, useRef, useState } from "react";

interface BarcodeScannerProps {
  onGameFound: (gameInfo: { barcode: string }) => void;
}

export function BarcodeScanner({ onGameFound }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isScanning) {
      Quagga.init(
        {
          inputStream: {
            type: "LiveStream",
            constraints: {
              width: 640,
              height: 480,
              facingMode: "environment", // or 'user' for front camera
            },
            target: scannerRef.current!,
          },
          decoder: {
            readers: [
              "ean_reader",
              "upc_reader",
              "upc_e_reader",
              "ean_8_reader",
            ],
          },
        },
        (err) => {
          if (err) {
            console.error("Failed to initialize Quagga:", err);
            return;
          }
          Quagga.start();
        }
      );

      Quagga.onDetected((result) => {
        if (result.codeResult.code && result.codeResult.code.length >= 12) {
          console.log(result);
          onGameFound({ barcode: result.codeResult.code });
          setIsScanning(false);
        }
      });

      return () => {
        Quagga.stop();
      };
    }
  }, [isScanning, onGameFound]);

  const toggleScanning = () => {
    setIsScanning(!isScanning);
    if (isScanning) {
      Quagga.stop();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button onClick={toggleScanning}>
        {isScanning ? "Stop Scanning" : "Start Scanning"}
      </Button>
      <div
        ref={scannerRef}
        className={`w-full max-w-sm ${isScanning ? "block" : "hidden"}`}
      />
    </div>
  );
}
