'use client';

import clsx from 'clsx';
import { Almarai } from 'next/font/google';
import { FunctionComponent, useEffect, useRef, useState } from 'react';

import EmailIcon from '@/assets/icons/emailIcon';
import LicenseIcon from '@/assets/icons/licenseIcon';
import PhoneIcon from '@/assets/icons/phoneIcon';

const almarai = Almarai({ subsets: ['latin'], weight: '400' });

type Option = {
  icon: React.ReactNode;
  text: string;
};

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
  className?: string;
};

const options: Option[] = [
  { icon: <PhoneIcon />, text: '+1 554 9937738' },
  { icon: <EmailIcon />, text: 'daniel.cohen@gmail.com' },
  { icon: <LicenseIcon />, text: 'SA1240394' },
];

const LicenseDropdown: FunctionComponent<Props> = ({
  isOpen,
  setIsOpen,
  className = '',
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string | number>(0);

  useEffect(() => {
    if (isOpen) {
      setHeight(dropdownRef.current?.scrollHeight || 'auto');
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative w-[205px] min-h-[128px] p-2">
      <div
        className={clsx(
          'absolute w-full mt-1 flex flex-col justify-around bg-white border rounded-xl shadow-xl max-h-60 overflow-y-auto transition-all duration-300',
          { 'opacity-0': !isOpen, 'opacity-100': isOpen },
        )}
        style={{ height }}
      >
        {options.map((option, index) => (
          <div
            key={index}
            className={clsx('py-2 px-4 flex items-center', className)}
          >
            <span className="mr-3">{option.icon}</span>
            <span
              className={clsx(
                'text-[#5E5E61] font-normal text-[13px] leading-[150%] tracking-[2%]',
                almarai.className,
              )}
            >
              {option.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LicenseDropdown;
