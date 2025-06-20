import React, { useEffect, useState } from 'react';

const PropertyDetailSkeleton = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 rounded-none sm:rounded-3xl bg-gray-100 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full">
          {/* Image/Photos Section */}
          <div className="lg:col-span-3">
            <div
              className="bg-gray-200 rounded-3xl"
              style={{ height: '400px', width: '100%' }}
            ></div>

            {/* Price and Features */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 sm:gap-8 mt-4 sm:mt-8">
              <div className="flex-shrink-0">
                <div className="h-8 w-40 bg-gray-200 rounded"></div>
                <div className="flex gap-4 mt-2">
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="p-2 bg-gray-200 border border-gray-300 flex-1 rounded">
                  <div className="h-4 w-24 bg-gray-300 rounded"></div>
                  <div className="h-3 w-40 bg-gray-300 rounded mt-2"></div>
                </div>
                <div className="p-4 bg-gray-200 border border-gray-300 rounded">
                  <div className="flex gap-4">
                    <div className="h-9 w-9 bg-gray-300 rounded-full"></div>
                    <div className="h-9 w-9 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="p-4 mt-2 bg-gray-200 border border-gray-300 rounded">
              <div className="h-4 w-40 bg-gray-300 rounded"></div>
              <div className="h-3 w-full bg-gray-300 rounded mt-4"></div>
              <div className="h-3 w-3/4 bg-gray-300 rounded mt-2"></div>
            </div>
          </div>

          {/* Map and Chat Section */}
          <div className="lg:col-span-2 mt-2 sm:mt-0">
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            <div
              className="mt-2 mb-2 bg-gray-200 rounded"
              style={{ height: '300px' }}
            ></div>

            {!isMobile && (
              <div className="h-9 w-9 bg-gray-200 rounded-full"></div>
            )}

            {/* Chat Section */}
            {!isMobile && (
              <>
                <div className="flex items-center justify-between mb-3 mt-8">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-9 w-9 bg-gray-200 rounded-full"></div>
                </div>
                <div
                  className="bg-gray-200 rounded-lg p-4"
                  style={{ height: '200px' }}
                ></div>
              </>
            )}

            {/* Mobile Chat Modal Skeleton */}
            {isMobile && (
              <div
                className="bg-gray-200 rounded-lg p-4"
                style={{ height: '100px' }}
              >
                <div className="h-4 w-32 bg-gray-300 rounded"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Placeholder for other sections */}
      <div
        className="bg-gray-100 animate-pulse rounded-lg p-4"
        style={{ height: '200px' }}
      ></div>
      <div
        className="bg-gray-100 animate-pulse rounded-lg p-4"
        style={{ height: '150px' }}
      ></div>
      <div
        className="bg-gray-100 animate-pulse rounded-lg p-4"
        style={{ height: '250px' }}
      ></div>
    </div>
  );
};

export default PropertyDetailSkeleton;
