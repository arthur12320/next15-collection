"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useZxing } from "react-zxing";
import { Input } from "./ui/input";

interface BarcodeScannerProps {
  onGameFound: (gameInfo: { barcode: string }) => void;
  testing: boolean;
}

export function BarcodeScanner({ onGameFound, testing }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [testBarcode, setTestBarcode] = useState("");

  const { ref } = useZxing({
    onDecodeResult(result) {
      setIsScanning(false);
      onGameFound({ barcode: result.getText() });
    },
    paused: !isScanning,
    constraints: {
      video: { facingMode: "environment" },
    },
  });

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button onClick={() => setIsScanning(!isScanning)}>
        {isScanning ? "Stop Scanning" : "Start Scanning"}
      </Button>
      {!testing ? (
        <div className={`w-full max-w-sm ${isScanning ? "block" : "hidden"}`}>
          <video ref={ref} className="w-full" />
        </div>
      ) : (
        <div className={`w-full max-w-sm ${isScanning ? "block" : "hidden"}`}>
          <Input
            value={testBarcode}
            onChange={(e) => setTestBarcode(e.target.value)}
            placeholder="Search for a barcode"
            className="pl-10"
          />
          <Button onClick={() => onGameFound({ barcode: testBarcode })}>
            ok
          </Button>
        </div>
      )}

      {isScanning && (
        <p className="text-sm text-gray-500">
          Position the barcode within the camera view. Supported formats: UPC-A,
          UPC-E, EAN-8, EAN-13
        </p>
      )}
    </div>
  );
}
