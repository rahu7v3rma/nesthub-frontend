import clsx from 'clsx';
import Image from 'next/image';
import React from 'react';

import Text from '@/shared/Text';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        ` bg-white min-h-screen flex justify-center max-sm:w-full flex-col items-center bg-border_gray overflow-y-scroll`,
      )}
    >
      <div className="w-full min-w-[300px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[536px] flex flex-col bg-white shadow-border-shadow rounded-24 p-4 break-words whitespace-normal">
        {children}
      </div>
    </div>
  );
}
