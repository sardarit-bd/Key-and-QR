"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const loading = useAuthStore((state) => state.loading);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        const success = await login({ email, password });
        if (success) {
            router.push("/user");
        } else {
            setError("Invalid email or password!");
        }
    };

    return (
        <div className="p-3">
            <div className="max-w-md mx-auto my-36 p-6 border rounded-xl shadow-sm bg-white">
                <h2 className="text-2xl font-semibold mb-4">Sign In</h2>

                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

                <input
                    className="w-full border px-4 py-2 rounded-md mb-3"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    className="w-full border px-4 py-2 rounded-md mb-4"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleLogin}
                    className="w-full bg-black text-white py-3 rounded-md"
                >
                    {loading ? "Authenticating..." : "Login"}
                </button>
            </div>
        </div>
    );
}
