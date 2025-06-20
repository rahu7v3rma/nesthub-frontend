import Image from 'next/image';
import React, { ChangeEvent } from 'react';

import { ClientFormRowData } from '@/interfaces/client';
import Input from '@/shared/Input';

type ClientFormRowProps = {
  client: ClientFormRowData;
  index: number;
  errors: { [field: string]: string } | undefined;
  isParent: boolean;
  isDeleting: boolean;
  isFormLoading: boolean;
  onChange: (index: number, name: string, value: string) => void;
  onDeleteMember: (index: number, memberId: number | null) => void;
};

export function ClientFormRow({
  client,
  index,
  errors = {},
  isParent,
  isDeleting,
  isFormLoading,
  onChange,
  onDeleteMember,
}: ClientFormRowProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(index, e.target.name, e.target.value);
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full">
      <div className="flex flex-col md:flex-row gap-3 w-full flex-grow mb-6 md:mb-0">
        <div className="w-full md:flex-1">
          <Input
            label={
              isParent ? 'Primary First Name' : `Member ${index} First Name`
            }
            className="!bg-[#F9F9F9] !rounded-[48px] w-full h-[48px] !border-none px-4"
            lableClass="text-[#A8A6B0] font-normal text-sm mb-1 ml-4"
            onChange={handleChange}
            name="firstName"
            value={client.firstName}
            aria-invalid={!!errors.firstName}
            aria-describedby={
              errors.firstName ? `firstName-error-${index}` : undefined
            }
          />
          {errors.firstName && (
            <p
              id={`firstName-error-${index}`}
              className="text-red-500 text-xs mt-1 ml-4"
            >
              {errors.firstName}
            </p>
          )}
        </div>
        <div className="w-full md:flex-1">
          <Input
            label={isParent ? 'Primary Last Name' : `Member ${index} Last Name`}
            className="!bg-[#F9F9F9] !rounded-[48px] w-full h-[48px] !border-none px-4"
            lableClass="text-[#A8A6B0] font-normal text-sm mb-1 ml-4"
            onChange={handleChange}
            name="lastName"
            value={client.lastName}
            aria-invalid={!!errors.lastName}
            aria-describedby={
              errors.lastName ? `lastName-error-${index}` : undefined
            }
          />
          {errors.lastName && (
            <p
              id={`lastName-error-${index}`}
              className="text-red-500 text-xs mt-1 ml-4"
            >
              {errors.lastName}
            </p>
          )}
        </div>
        <div className="w-full md:flex-1">
          <Input
            label={isParent ? 'Primary Email' : `Member ${index} Email`}
            type="email"
            className="!bg-[#F9F9F9] !rounded-[48px] w-full h-[48px] !border-none px-4"
            lableClass="text-[#A8A6B0] font-normal text-sm mb-1 ml-4"
            onChange={handleChange}
            name="email"
            value={client.email}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `email-error-${index}` : undefined}
          />
          {errors.email && (
            <p
              id={`email-error-${index}`}
              className="text-red-500 text-xs mt-1 ml-4"
            >
              {errors.email}
            </p>
          )}
        </div>
        <div className="w-full md:flex-1">
          <Input
            label={
              isParent
                ? 'Primary Phone (Optional)'
                : `Member ${index} Phone (Optional)`
            }
            type="tel"
            className="!bg-[#F9F9F9] !rounded-[48px] w-full h-[48px] !border-none px-4"
            lableClass="text-[#A8A6B0] font-normal text-sm mb-1 ml-4"
            onChange={handleChange}
            name="phone"
            value={client.phone}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? `phone-error-${index}` : undefined}
          />
          {errors.phone && (
            <p
              id={`phone-error-${index}`}
              className="text-red-500 text-xs mt-1 ml-4"
            >
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      {/* Action Button Area */}
      {!isParent ? (
        <div className="w-full md:w-auto h-[48px] flex-shrink-0 mt-0 md:mt-7 flex items-center justify-end md:justify-center">
          <button
            type="button"
            onClick={() => onDeleteMember(index, client.id)}
            className={`flex items-center justify-center bg-[#F6F6F6] font-bold text-2xl leading-[30px] rounded-full w-[48px] h-[48px] flex-shrink-0 text-gray-600 cursor-pointer hover:bg-red-100 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed ${isDeleting ? 'animate-pulse' : ''}`}
            title="Remove Member"
            disabled={isDeleting || isFormLoading}
          >
            {isDeleting ? (
              <svg
                className="animate-spin h-5 w-5 text-red-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <Image
                height={20}
                width={20}
                src="/svgs/delete-black.svg"
                alt="Remove Member"
              />
            )}
          </button>
        </div>
      ) : (
        <div className="w-full md:w-auto h-[48px] flex-shrink-0 mt-0 md:mt-7 flex items-center justify-end md:justify-center">
          <div className="w-[48px] h-[48px] flex-shrink-0" />
        </div>
      )}
    </div>
  );
}
