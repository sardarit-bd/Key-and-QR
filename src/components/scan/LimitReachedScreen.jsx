import { ArrowRight, Calendar, Clock } from "lucide-react";
import Link from "next/link";

export default function LimitReachedScreen({ dailyLimit = 3 }) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tomorrowFormatted = tomorrow.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock size={32} className="text-white" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Come Back Tomorrow
                </h1>

                <p className="text-gray-600 mb-4">
                    You've used all {dailyLimit} unlocks for today.
                </p>

                <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-yellow-800 mb-2">
                        <Calendar size={16} />
                        <span className="font-medium">Next available:</span>
                    </div>
                    <p className="text-yellow-800 font-semibold">{tomorrowFormatted}</p>
                </div>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-yellow-700 transition"
                >
                    Return Home
                    <ArrowRight size={18} />
                </Link>

                <p className="text-xs text-gray-400 mt-6">
                    Each InspireTag gives you {dailyLimit} free unlocks per day
                </p>
            </div>
        </div>
    );
}