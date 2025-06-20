import { Spinner } from '@heroui/react';
import clsx from 'clsx';
import React from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  color?: string;
  backgroundColor?: string;
  className?: string;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  color,
  backgroundColor,
  className,
  isLoading,
  ...props
}) => {
  const combineClass = `h-[60px] flex items-center justify-center rounded-full font-semibold ${color || 'text-white'} border-0 w-52 ${backgroundColor || 'bg-[#4A4A4A]'}`;
  const buttonClass = clsx(combineClass, className);

  return (
    <button disabled={isLoading} className={buttonClass} {...props}>
      {isLoading && <Spinner variant="simple" color="white" />}
      {children}
    </button>
  );
};

export default Button;
