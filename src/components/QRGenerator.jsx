import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRGenerator({ value, size = 150, title = "Verification QR" }) {
  if (!value) return null;

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-xl border border-slate-200 w-max shadow-lg">
      <QRCodeSVG 
        value={value} 
        size={size}
        level="Q" // Higher error correction
        includeMargin={false}
      />
      <p className="mt-3 text-xs font-bold text-slate-800 tracking-wider uppercase">{title}</p>
    </div>
  );
}
