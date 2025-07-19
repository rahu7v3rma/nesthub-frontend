import React from 'react';

export default function SkeletonClientsContainer() {
  return (
    <div className="p-4 md:p-8 lg:p-10 bg-white rounded-2xl shadow-none md:shadow-lg animate-pulse">
      <div className="hidden md:flex flex-row items-center justify-between gap-4 mb-6">
        <div className="h-9 w-40 bg-gray-800/20 rounded-lg" />
        <div className="flex flex-row items-center gap-4">
          {/* Switch skeleton */}
          <div className="h-7 w-48 bg-gray-800/20 rounded-lg" />
          {/* Search skeleton */}
          <div className="h-12 w-72 bg-gray-800/10 rounded-full" />
          <div className="h-10 w-32 bg-gray-800/20 rounded-full" />
        </div>
      </div>
      <div className="flex flex-col md:hidden gap-3 mb-6 px-4">
        <div className="flex justify-between items-center w-full">
          <div className="h-9 w-40 bg-gray-800/20 rounded-lg" />
          <div className="h-10 w-28 bg-gray-800/20 rounded-full" />
        </div>
        {/* Switch skeleton */}
        <div className="h-7 w-48 bg-gray-800/20 rounded-lg" />
        {/* Search skeleton */}
        <div className="h-12 w-full bg-gray-800/10 rounded-full" />
      </div>

      <div className="py-6">
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                {[...Array(6)].map((_, i) => (
                  <th key={i} className="py-4 px-4 text-left">
                    <div className="h-5 bg-gray-800/20 rounded-full w-3/4" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-t border-gray-100">
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="py-4 px-4">
                      <div className="h-6 bg-gray-800/10 rounded-full w-full" />
                    </td>
                  ))}
                  <td className="py-4 px-4">
                    <div className="h-7 w-12 bg-gray-800/20 rounded-full mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List Skeleton */}
        <div className="block md:hidden px-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="mb-6">
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center w-full">
                  <div className="h-6 w-40 bg-gray-800/10 rounded-full" />
                  <div className="h-5 w-24 bg-gray-800/10 rounded-full" />
                </div>
                <div className="h-5 w-48 bg-gray-800/10 rounded-full" />
                <div className="h-5 w-36 bg-gray-800/10 rounded-full" />
                <div className="flex justify-between items-end w-full">
                  <div className="h-5 w-32 bg-gray-800/10 rounded-full" />
                  <div className="h-7 w-12 bg-gray-800/20 rounded-full" />
                </div>
              </div>
              <div className="my-4 h-[1px] bg-gray-800/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
