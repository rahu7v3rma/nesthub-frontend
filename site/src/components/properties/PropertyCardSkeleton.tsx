import React from 'react';

export function PropertyCardSkeleton() {
  return (
    <article className="min-w-1 animate-pulse">
      {/* Image Placeholder */}
      <div className="relative">
        <div className="h-[200px] w-full bg-gray-300 rounded-3xl shadow-inner"></div>

        {/* Top-right Button Skeleton */}
        <div className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md z-10">
          <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      {/* Price Skeleton */}
      <div className="mt-2 h-5 w-1/3 bg-gray-300 rounded"></div>

      {/* Address Skeleton */}
      <div className="mt-1 h-4 w-3/4 bg-gray-200 rounded"></div>

      {/* Details Row Skeleton */}
      <div className="mt-2 flex gap-2">
        <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
        <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
        <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
      </div>
    </article>
  );
}
