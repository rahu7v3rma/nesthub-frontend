import React from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

import { PropertyListResponse } from '@/interfaces/property';

interface PaginationProps {
  properties: PropertyListResponse;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  properties,
  onPageChange,
}) => {
  const currentPage = properties.page;
  const hasNext = properties.has_next;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-center space-x-4 py-4">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="text-xl font-bold px-3 py-1 rounded disabled:opacity-50 hover:bg-gray-100 transition"
      >
        <IoIosArrowBack />
      </button>
      <span className="text-[13px] font-normal">Page {currentPage}</span>
      <button
        onClick={handleNext}
        disabled={!hasNext}
        className="text-xl font-bold px-3 py-1 rounded disabled:opacity-50 hover:bg-gray-100 transition"
      >
        <IoIosArrowForward />
      </button>
    </div>
  );
};

export default Pagination;
