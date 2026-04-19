import { ArrowRight, QrCode, Sparkles } from "lucide-react";
import Link from "next/link";

export default function ActivationScreen({ tagCode, onActivate, isLoggedIn }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
                <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <QrCode size={32} className="text-white" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Activate Your InspireTag
                </h1>

                <p className="text-gray-600 mb-6">
                    This tag needs to be activated before you can unlock inspirational messages.
                </p>

                <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
                    <p className="text-sm text-gray-700 font-medium mb-2">
                        Tag Information:
                    </p>
                    <p className="text-xs font-mono text-gray-600 bg-white rounded px-2 py-1 inline-block break-all border border-gray-200">
                        {tagCode}
                    </p>
                </div>

                <div className="space-y-3">
                    {isLoggedIn ? (
                        <button
                            onClick={onActivate}
                            className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2"
                        >
                            Activate Now
                            <ArrowRight size={18} />
                        </button>
                    ) : (
                        <>
                            <Link
                                href={`/login?redirect=/t/${tagCode}`}
                                className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2"
                            >
                                Sign Up / Log In
                                <ArrowRight size={18} />
                            </Link>

                            <p className="text-xs text-gray-500 mt-3">
                                You'll need an account to activate and use this tag
                            </p>
                        </>
                    )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <Sparkles size={12} />
                        <span>Each tag gives you daily inspirational messages</span>
                    </div>
                </div>
            </div>
        </div>
    );
}