"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ChangePasswordPage() {
    const router = useRouter();
    const { changePassword, loading } = useAuthStore();

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validations
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters");
            return;
        }

        if (oldPassword === newPassword) {
            setError("New password must be different from old password");
            return;
        }

        const success = await changePassword(oldPassword, newPassword);

        if (success) {
            setSuccess(true);
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");

            // Auto hide success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } else {
            setError("Failed to change password. Old password may be incorrect.");
        }
    };

    return (
        <div className="flex-1 w-full p-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-6">Change Password</h2>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4 text-sm">
                        Password changed successfully!
                    </div>
                )}

                <form onSubmit={handleSubmit} className="max-w-md">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                        </label>
                        <input
                            type="password"
                            className="w-full border border-gray-300 px-4 py-2 rounded-md"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            className="w-full border border-gray-300 px-4 py-2 rounded-md"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            className="w-full border border-gray-300 px-4 py-2 rounded-md"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}