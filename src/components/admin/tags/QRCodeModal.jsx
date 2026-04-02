import { Check, Copy, Download, ExternalLink, X, Mail } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";

export default function QRCodeModal({ isOpen, onClose, tag }) {
    const { user } = useAuthStore();
    const [copied, setCopied] = useState(false);

    const getProviderInfo = () => {
        if (user?.provider === "google") {
            return { icon: <FaGoogle size={12} className="text-blue-500" />, text: "Google" };
        }
        return { icon: <Mail size={12} className="text-gray-500" />, text: "Email" };
    };

    const providerInfo = getProviderInfo();

    const handleCopyUrl = (url) => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const canvas = document.querySelector("#qr-canvas canvas");
        if (canvas) {
            const link = document.createElement("a");
            link.download = `qr-${tag.tagCode}.png`;
            link.href = canvas.toDataURL();
            link.click();
        }
    };

    if (!isOpen || !tag) return null;

    const baseUrl =
        process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin;

    const url = `${baseUrl}/t/${tag.tagCode}`;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-gray-900">QR Code</h2>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                            {providerInfo.icon}
                            <span className="text-gray-500">{providerInfo.text} Admin</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 text-center">
                    <div id="qr-canvas" className="bg-white p-4 rounded-lg inline-block mb-4">
                        <QRCodeCanvas
                            value={url}
                            size={200}
                            level="H"
                            includeMargin={true}
                        />
                    </div>
                    <p className="font-mono text-sm text-gray-600 mb-2 break-all">{url}</p>
                    <button
                        onClick={() => handleCopyUrl(url)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? "Copied!" : "Copy URL"}
                    </button>
                </div>
                <div className="flex gap-3 p-6 pt-0">
                    <Link
                        href={`/t/${tag.tagCode}`}
                        target="_blank"
                        className="flex-1 bg-black text-white py-2 rounded-lg text-center hover:bg-gray-800"
                    >
                        <ExternalLink size={16} className="inline mr-2" />
                        Open Tag
                    </Link>
                    <button
                        onClick={handleDownload}
                        className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Download size={16} />
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
}