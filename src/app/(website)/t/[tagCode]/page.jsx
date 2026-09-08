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

    // "loading" | "success" | "invalid" | "inactive" | "error"
    const [status, setStatus] = useState("loading");
    const [quoteData, setQuoteData] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchQuote = useCallback(async () => {
        setStatus("loading");
        setErrorMessage("");

        try {
            const response = await api.get(`/scan/public/${tagCode}`);
            const data = response.data?.data;

            if (!data) {
                setStatus("error");
                setErrorMessage("No data returned for this QR code.");
                return;
            }

            setQuoteData(data);
            setStatus("success");
        } catch (err) {
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

    useEffect(() => {
        const originalBg = document.body.style.backgroundColor;
        const originalOverflow = document.body.style.overflow;
        document.body.style.backgroundColor = '#000000';
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.backgroundColor = originalBg;
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    if (status === "loading") {
        return (
            <div className="min-h-screen w-full bg-black overscroll-none select-none">
                <ScanLoadingScreen message="Awakening your inspiration..." />
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