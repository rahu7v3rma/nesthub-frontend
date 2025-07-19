'use client';

import { Modal, ModalBody, ModalContent } from '@heroui/react';
import { useRouter } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';

import OffersBarChart from '@/components/properties/OffersBarChart';
import useDeviceType from '@/hooks/useDeviceType';

const MobileChartLegend = () => (
  <div className="flex flex-col gap-1.5 px-4 pt-4">
    <div className="flex items-center gap-2">
      <span className="inline-block w-3 h-3 rounded-full bg-[#BDBDBD]" />
      <span className="text-sm text-gray-600">Offer price, $</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="inline-block w-3 h-3 rounded-full bg-[#333333]" />
      <span className="text-sm text-gray-600">Closing price, $</span>
    </div>
  </div>
);

// TODO: Replace with real data fetching
const mockData = [
  { name: 'Property A', offerPrice: 400000, closingPrice: 420000 },
  { name: 'Property B', offerPrice: 250000, closingPrice: 240000 },
  { name: 'Property C', offerPrice: 370000, closingPrice: 390000 },
  { name: 'Property D', offerPrice: 480000, closingPrice: 510000 },
  { name: 'Property E', offerPrice: 320000, closingPrice: 330000 },
];

export default function BarChartPage() {
  const { isMobile } = useDeviceType();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [isMobile]);

  const handleClose = () => {
    router.back();
  };

  const chartComponent = React.useMemo(
    () => (
      <Suspense
        fallback={
          <div className="w-full flex justify-center items-center min-h-[400px]">
            <span>Loading...</span>
          </div>
        }
      >
        <OffersBarChart data={mockData} showTitle={!isMobile} />
      </Suspense>
    ),
    [isMobile],
  );

  if (isMobile) {
    return (
      <div className="container mx-auto">
        <Modal
          isOpen={isModalOpen}
          onClose={handleClose}
          size="xl"
          className="my-auto mx-2"
        >
          <ModalContent>
            {() => (
              <>
                <div className="flex items-center justify-center p-4">
                  <h3 className="font-semibold text-lg text-gray-800">
                    Offer vs. Closing prices
                  </h3>
                </div>
                <ModalBody className="p-0">
                  <MobileChartLegend />
                  <div className="overflow-x-auto">
                    <div className="min-h-[400px] flex items-center">
                      {chartComponent}
                    </div>
                  </div>
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    );
  }

  // Desktop/Tablet View
  return (
    <div className="container mx-auto mt-8">
      <div className="bg-white rounded-lg shadow p-8">{chartComponent}</div>
    </div>
  );
}
