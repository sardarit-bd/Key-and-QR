'use client';

/**
 * Scan History Loading Skeleton
 */
export default function ScanHistorySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-[#121526] border border-white/5 rounded-2xl overflow-hidden"
        >
          <div className="h-48 bg-gray-800/50 animate-pulse">
            <div className="w-full h-full bg-gradient-to-r from-[#121526] via-gray-800/30 to-[#121526] animate-shimmer" />
          </div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-800/50 rounded-lg animate-pulse w-3/4" />
            <div className="h-4 bg-gray-800/50 rounded-lg animate-pulse w-1/2" />
            <div className="flex justify-between items-center">
              <div className="h-3 bg-gray-800/50 rounded-lg animate-pulse w-20" />
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-gray-800/50 rounded-full animate-pulse" />
                <div className="h-8 w-8 bg-gray-800/50 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}