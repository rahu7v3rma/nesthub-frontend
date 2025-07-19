import React, { useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { IoIosCloseCircle } from 'react-icons/io';
import { RiDeleteBinFill } from 'react-icons/ri';

interface OfferOptionsDropdownProps {
  offerId: number;
  onDelete: (offerId: number) => void;
  onClose: () => void;
  onAcceptOffer: (offerId: number) => void;
  onRejectOffer: (offerId: number) => void;
  isUpdatingOffer: boolean;
}

export default function OfferOptionsDropdown({
  offerId,
  onDelete,
  onClose,
  onAcceptOffer,
  onRejectOffer,
  isUpdatingOffer,
}: OfferOptionsDropdownProps) {
  useEffect(() => {
    const handleClickOutside = () => {
      onClose();
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);
  return (
    <div className="z-20 bg-white rounded-lg px-2 py-3 gap-2 flex flex-col shadow-2xl">
      <button
        className="flex items-center gap-2 w-full text-left hover:bg-gray-50 rounded px-2 py-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => {
          onAcceptOffer(offerId);
          onClose();
        }}
        disabled={isUpdatingOffer}
      >
        <div className="w-4 flex justify-center">
          <FaCheckCircle className="text-gray-800" size={12} />
        </div>
        <span className="font-normal text-[13px] leading-[150%] tracking-[0.01em] text-gray-600">
          Offer accepted
        </span>
      </button>

      <div className="w-31 border-t border-gray-100" />

      <button
        className="flex items-center gap-2 w-full text-left hover:bg-gray-50 rounded px-2 py-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => {
          onRejectOffer(offerId);
          onClose();
        }}
        disabled={isUpdatingOffer}
      >
        <div className="w-4 flex justify-center">
          <IoIosCloseCircle className="text-gray-800" size={15} />
        </div>
        <span className="font-normal text-[13px] leading-[150%] tracking-[0.01em] text-gray-600">
          Offer rejected
        </span>
      </button>

      <div className="w-31 border-t border-gray-100" />

      <button
        className="flex items-center gap-2 w-full text-left hover:bg-gray-50 rounded px-2 py-1 transition-colors"
        onClick={() => {
          onDelete(offerId);
          onClose();
        }}
      >
        <div className="w-4 flex justify-center">
          <RiDeleteBinFill className="text-gray-800" size={14} />
        </div>
        <span className="font-normal text-[13px] leading-[150%] tracking-[0.01em] text-gray-600">
          Delete offer
        </span>
      </button>
    </div>
  );
}
