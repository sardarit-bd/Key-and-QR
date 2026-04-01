import { RefreshCw } from "lucide-react";

export default function LoadingScreen({ message = "Opening your InspireTag..." }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
            <div className="text-center max-w-md">
                <div className="relative mb-6">
                    <div className="w-24 h-24 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
                        <div className="absolute inset-2 rounded-full bg-purple-100 flex items-center justify-center">
                            <RefreshCw size={28} className="text-purple-600 animate-pulse" />
                        </div>
                    </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{message}</h2>
                <p className="text-gray-500">Please wait while we prepare your experience</p>
            </div>
        </div>
    );
}