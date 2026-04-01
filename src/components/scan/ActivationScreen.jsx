import { ArrowRight, QrCode, Sparkles } from "lucide-react";
import Link from "next/link";

export default function ActivationScreen({ tagCode, onActivate, isLoggedIn }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <QrCode size={32} className="text-white" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Activate Your InspireTag</h1>
                <p className="text-gray-600 mb-6">
                    This tag needs to be activated before you can unlock inspirational messages.
                </p>

                <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                    <p className="text-sm text-blue-800 font-medium mb-2">Tag Information:</p>
                    <p className="text-xs font-mono text-blue-600 bg-white rounded px-2 py-1 inline-block">
                        {tagCode}
                    </p>
                </div>

                <div className="space-y-3">
                    {isLoggedIn ? (
                        <button
                            onClick={onActivate}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2"
                        >
                            Activate Now
                            <ArrowRight size={18} />
                        </button>
                    ) : (
                        <>
                            <Link
                                href={`/login?redirect=/t/${tagCode}`}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2"
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

                <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <Sparkles size={12} />
                        <span>Each tag gives you daily inspirational messages</span>
                    </div>
                </div>
            </div>
        </div>
    );
}