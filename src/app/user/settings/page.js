"use client";

export default function Settings() {
    return (
        <div className="p-6 bg-white text-center rounded-xl shadow-sm max-w-xl">

            <h2 className="text-xl font-semibold mb-6">Account Settings</h2>

            <div className="space-y-4 mx-auto max-w-xs">

                <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full border rounded-lg px-4 py-2"
                />

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border rounded-lg px-4 py-2"
                />

                <input
                    type="password"
                    placeholder="New Password"
                    className="w-full border rounded-lg px-4 py-2"
                />

                <button className="bg-black text-white w-full py-3 rounded-lg hover:bg-gray-900">
                    Save Changes
                </button>
            </div>

        </div>
    );
}
