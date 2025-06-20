'use client';

import clsx from 'clsx';
import { Assistant } from 'next/font/google';
import Image from 'next/image';
import { useState, FunctionComponent } from 'react';

const assistant = Assistant({ subsets: ['latin'] });

type Option = {
  value: string;
  label: string;
};

type Props = {
  label?: string;
  className?: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  height?: 'md' | 'sm' | 'xs';
};

const Dropdown: FunctionComponent<Props> = ({
  label = '',
  className = '',
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  height = 'md',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="w-full relative">
      <label className="block text-[#969495] text-[13px] leading-5 pb-2">
        {label}
      </label>
      <div
        className={clsx(
          `relative rounded-xl border-[1px] pl-7 pr-12 outline-none cursor-pointer
           font-normal text-[17px] text-gray_850 bg-[#F7F7F7] ${assistant.className}`,
          height === 'md'
            ? 'py-[19px]'
            : height === 'sm'
              ? 'py-[14px]'
              : 'py-[8px]',
          className,
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? '' : 'text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <Image
          src="/svgs/chevron-down.svg"
          width={20}
          height={20}
          alt="dropdown arrow"
          className={clsx(
            'absolute right-5 top-1/2 -translate-y-1/2 transition-transform',
            {
              'rotate-180': isOpen,
            },
          )}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className={clsx(
                'py-2 px-7 cursor-pointer hover:bg-[#F7F7F7]',
                option.value === value && 'bg-[#F7F7F7]',
              )}
              onClick={() => {
                onChange?.(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
