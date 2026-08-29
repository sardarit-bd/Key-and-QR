"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        retry: 1,
                        staleTime: 30 * 1000,
                        gcTime: 5 * 60 * 1000,
                    },
                    mutations: {
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3500,
                    style: {
                        borderRadius: '12px',
                        background: '#18181b',
                        color: '#f4f4f5',
                        border: '1px solid rgba(255,255,255,0.15)',
                    },
                    success: {
                        duration: 3500,
                        iconTheme: {
                            primary: '#22c55e',
                            secondary: '#ffffff',
                        },
                    },
                    error: {
                        duration: 4500,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#ffffff',
                        },
                    },
                }}
            />
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </QueryClientProvider>
    );
}