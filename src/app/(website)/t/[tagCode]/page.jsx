"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import ScanLoadingScreen from "@/components/scan/public/ScanLoadingScreen";
import PublicQuoteDisplay from "@/components/scan/public/PublicQuoteDisplay";
import InvalidQrScreen from "@/components/scan/public/InvalidQrScreen";
import InactiveQrScreen from "@/components/scan/public/InactiveQrScreen";
import ScanErrorScreen from "@/components/scan/public/ScanErrorScreen";

// Error codes returned by GET /scan/public/:tagCode (see tag-unlock.service.js)
const INVALID_CODES = ["INVALID_TAG_CODE", "TAG_NOT_FOUND"];
const INACTIVE_CODES = ["TAG_INACTIVE", "TAG_NOT_ACTIVATED"];

export default function PublicScanPage() {
    const { tagCode } = useParams();

    // "loading" | "success" | "invalid" | "inactive" | "error" | "offline"
    const [status, setStatus] = useState("loading");
    const [quoteData, setQuoteData] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchQuote = useCallback(async () => {
        // Fast offline check before initiating network request
        if (typeof window !== "undefined" && typeof navigator !== "undefined" && !navigator.onLine) {
            setStatus("offline");
            return;
        }

        setStatus("loading");
        setErrorMessage("");

        // 8-second request timeout controller to prevent 30s hangs on poor cellular networks
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
            const response = await api.get(`/scan/public/${tagCode}`, {
                signal: controller.signal,
                timeout: 8000,
            });
            clearTimeout(timeoutId);
            const data = response.data?.data;

            if (!data) {
                setStatus("error");
                setErrorMessage("No data returned for this QR code.");
                return;
            }

            setQuoteData(data);
            setStatus("success");
        } catch (err) {
            clearTimeout(timeoutId);

            // Detect offline connectivity, connection dropped, or 8s timeout abort
            const isOffline =
                (typeof navigator !== "undefined" && !navigator.onLine) ||
                err.code === "ERR_NETWORK" ||
                err.code === "ECONNABORTED" ||
                err.name === "CanceledError" ||
                err.name === "AbortError" ||
                err.message?.toLowerCase().includes("network") ||
                err.message?.toLowerCase().includes("timeout") ||
                err.message?.toLowerCase().includes("abort");

            if (isOffline) {
                setStatus("offline");
                return;
            }

            const code = err.response?.data?.code;
            const message = err.response?.data?.message;

            if (INVALID_CODES.includes(code)) {
                setStatus("invalid");
                return;
            }

            if (INACTIVE_CODES.includes(code)) {
                setStatus("inactive");
                return;
            }

            setErrorMessage(message || "Failed to load this QR code. Please try again.");
            setStatus("error");
        }
    }, [tagCode]);

    useEffect(() => {
        if (tagCode) {
            fetchQuote();
        }
    }, [tagCode, fetchQuote]);

    // Auto-recover when connectivity is restored without requiring a manual browser refresh
    useEffect(() => {
        const handleOnline = () => {
            if (status === "offline" || status === "error") {
                fetchQuote();
            }
        };

        const handleOffline = () => {
            if (status !== "success") {
                setStatus("offline");
            }
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [status, fetchQuote]);

    useEffect(() => {
        const originalBg = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#000000';
        return () => {
            document.body.style.backgroundColor = originalBg || '';
        };
    }, []);

    if (status === "loading") {
        return (
            <div className="min-h-screen w-full bg-black overscroll-none select-none">
                <ScanLoadingScreen message="Awakening your inspiration..." />
            </div>
        );
    }

    if (status === "offline") {
        return (
            <div className="min-h-screen w-full bg-black overscroll-none select-none">
                <ScanErrorScreen isOffline={true} onRetry={fetchQuote} />
            </div>
        );
    }

    if (status === "invalid") {
        return (
            <div className="min-h-screen w-full bg-black overscroll-none select-none">
                <InvalidQrScreen tagCode={tagCode} />
            </div>
        );
    }

    if (status === "inactive") {
        return (
            <div className="min-h-screen w-full bg-black overscroll-none select-none">
                <InactiveQrScreen tagCode={tagCode} />
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="min-h-screen w-full bg-black overscroll-none select-none">
                <ScanErrorScreen message={errorMessage} onRetry={fetchQuote} />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-black overscroll-none select-none">
            <PublicQuoteDisplay data={quoteData} tagCode={tagCode} />
        </div>
    );
}