"use client";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
export default function Cta() {
        const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <div className="py-16 bg-[#f4f5f7] rounded-lg flex flex-col items-center justify-center gap-4 text-center px-4">
            <h1 className="text-5xl font-bold mb-4">Ready to Create Your Story ?</h1>
            <p className="text-gray-500 text-lg mb-4">Join thousands of people who carry inspiration with them every day</p>
            <Link
                href="/signup"
                onClick={() => setIsModalOpen(false)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition"
            >
                Start Your Story Now
                <Sparkles size={16} />
            </Link>
        </div>
    )
}
