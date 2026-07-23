'use client';

import { useEffect } from 'react';

export default function WebsiteError({ error, reset }) {
  useEffect(() => {
    console.error('Website error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl text-red-500">!</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Error</h1>
        <p className="text-gray-600 mb-6">
          Something went wrong loading this page.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
