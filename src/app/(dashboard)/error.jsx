'use client';

import { useEffect } from 'react';

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#090b14] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">!</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard Error</h1>
        <p className="text-gray-400 mb-6">
          Something went wrong loading the dashboard.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#e3ba85] text-black font-medium rounded-xl hover:bg-[#d4a976] transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
