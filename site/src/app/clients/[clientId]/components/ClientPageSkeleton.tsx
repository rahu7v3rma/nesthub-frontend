import React from 'react';

export function ClientPageSkeleton() {
  return (
    <div className="m-2 p-6 md:p-10 bg-white rounded-xl shadow-md max-w-7xl mx-auto border border-gray-200 animate-pulse">
      {/* Skeleton Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div className="h-8 bg-gray-300 rounded-md w-1/3"></div>
        <div className="flex flex-wrap gap-3">
          <div className="h-10 w-24 bg-gray-300 rounded-full"></div>
          <div className="h-10 w-24 bg-gray-300 rounded-full"></div>
          <div className="h-10 w-24 bg-gray-300 rounded-full"></div>
          <div className="h-10 w-24 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      {/* Skeleton Form Rows */}
      <div className="flex flex-col gap-6 mb-4">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
          >
            <div className="flex flex-col md:flex-row gap-3 w-full flex-grow">
              {/* Input Skeletons */}
              {[...Array(4)].map((_, inputIndex) => (
                <div key={inputIndex} className="w-full md:flex-1 space-y-2">
                  {/* Label Skeleton */}
                  <div className="h-4 bg-gray-300 rounded w-1/4 ml-4"></div>{' '}
                  {/* Input Skeleton */}
                  <div className="h-12 bg-gray-200 rounded-full w-full"></div>{' '}
                </div>
              ))}
            </div>
            {/* Action Button Skeleton */}
            <div className="w-full md:w-auto h-[48px] flex-shrink-0 flex items-center justify-end md:justify-center pt-1 md:pt-6">
              <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton Add Button */}
      <div className="flex justify-start mb-12">
        <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
      </div>

      {/* Skeleton Liked Properties */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          {/* Title Skeleton */}
          <div className="h-6 bg-gray-300 rounded w-1/4"></div>{' '}
          {/* Button Skeleton */}
          <div className="h-10 w-24 bg-gray-300 rounded-full"></div>{' '}
        </div>
        <div className="flex overflow-x-auto space-x-4 pb-4 -mx-1 px-1">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex-shrink-0 w-64 space-y-3">
              <div className="h-40 bg-gray-300 rounded-lg"></div>{' '}
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>{' '}
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>{' '}
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>{' '}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
