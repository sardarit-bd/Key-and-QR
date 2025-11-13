"use client";

import { QrCode } from "lucide-react";

const scans = [
    { code: "QR-1762829221", date: "11/12/2025", device: "iPhone 14" },
    { code: "QR-1755633490", date: "11/11/2025", device: "Samsung S22" },
];

export default function QRHistory() {
    return (
        <div className="p-6 bg-white rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-6">QR Scan History</h2>

            <div className="space-y-4">
                {scans.map((scan, i) => (
                    <div key={i} className="flex justify-between items-center border rounded-xl p-4">
                        <div>
                            <p className="font-medium">{scan.code}</p>
                            <p className="text-sm text-gray-500">{scan.date}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <QrCode size={18} />
                            <span className="text-gray-700 text-sm">{scan.device}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
