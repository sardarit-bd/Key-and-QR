"use client";

export default function Subscription() {
    return (
        <div className="p-6 bg-white rounded-xl shadow-sm max-w-2xl mx-auto">

            <h2 className="text-2xl font-semibold text-center">Premium Membership</h2>
            <p className="text-center text-gray-600 mb-8">
                Unlock full access to motivational quote collections.
            </p>

            <div className="border rounded-xl p-8 shadow-sm text-center space-y-4">
                <h3 className="text-3xl font-bold">$2.99<span className="text-sm text-gray-500">/month</span></h3>
                <p className="text-sm text-gray-500">Cancel anytime • No commitment</p>

                <ul className="text-left space-y-2 text-sm text-gray-700 max-w-xs mx-auto">
                    <li>✔ Access to all premium categories</li>
                    <li>✔ Hundreds of curated motivational quotes</li>
                    <li>✔ New quotes added weekly</li>
                    <li>✔ Ad-free experience</li>
                    <li>✔ Priority customer support</li>
                </ul>

                <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition">
                    Start Premium Trial — 7 Days Free
                </button>

                <p className="text-xs text-gray-500">Then $2.99/month. Cancel anytime.</p>
            </div>
        </div>
    );
}
