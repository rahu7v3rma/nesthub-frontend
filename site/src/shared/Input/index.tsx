'use client';

import clsx from 'clsx';
import { Assistant } from 'next/font/google';
import Image from 'next/image';
import { useState, FunctionComponent, InputHTMLAttributes } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

const assistant = Assistant({ subsets: ['latin'] });

type Props = {
  label?: string;
  className?: string;
  lableClass?: string;
  type?: string;
  height?: 'md' | 'sm' | 'xs';
  isError?: boolean | string;
  isRequired?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

const Input: FunctionComponent<Props> = ({
  label = '',
  className = '',
  lableClass = '',
  type = 'text',
  height = 'md',
  isError,
  isRequired,
  ...props
}: Props) => {
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <div className="w-full relative">
      <label
        className={clsx(
          'block text-[#969495] text-[13px] leading-5 pb-2',
          lableClass,
        )}
      >
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={type === 'password' ? (visible ? 'text' : type) : type}
          className={clsx(
            `rounded-[48px] border-[1px] pl-7 pr-12 outline-none focus:shadow-xl
    font-normal text-[17px] text-gray_850 bg-[#F7F7F7] h-[48px] w-full`,
            className,
          )}
          {...props}
        />
        {type === 'password' && (
          <div
            className={`
              absolute
              ${isError ? 'with-error' : 'without-error'}
              top-1/2
              -translate-y-1/2
            `}
          >
            {visible ? (
              <AiOutlineEyeInvisible
                className={'cursor-pointer'}
                onClick={() => setVisible(!visible)}
                size={20}
              />
            ) : (
              <AiOutlineEye
                className={'cursor-pointer right-0'}
                onClick={() => setVisible(!visible)}
                size={20}
              />
            )}
          </div>
        )}
      </div>
      {isError && (
        <Image
          src={'/svgs/exclamation-outline.svg'}
          width={20}
          height={20}
          alt="password eye"
          className={'cursor-pointer absolute right-5 top-[calc(65%-8px)]'}
        />
      )}
    </div>
  );
};

export default Input;
