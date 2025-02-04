"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useZxing } from "react-zxing";

interface BarcodeScannerProps {
  onGameFound: (gameInfo: { barcode: string }) => void;
}

export function BarcodeScanner({ onGameFound }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);

  const { ref } = useZxing({
    onDecodeResult(result) {
      console.log("foundddd");
      setIsScanning(false);
      onGameFound({ barcode: result.getText() });
    },
    paused: !isScanning,
  });

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button onClick={() => setIsScanning(!isScanning)}>
        {isScanning ? "Stop Scanning" : "Start Scanning"}
      </Button>
      <div className={`w-full max-w-sm ${isScanning ? "block" : "hidden"}`}>
        <video ref={ref} className="w-full" />
      </div>
    </div>
  );
}
