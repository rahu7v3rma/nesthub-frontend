'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { ROUTES } from '@/constants';

import DownIconSvg from './_components/downIcon';

const NavBar: React.FC = () => {
  const router = useRouter();

  const handleLogoClick = useCallback(() => {
    router.push(ROUTES.root);
  }, [router]);

  return (
    <div className="w-full h-[70px] px-[75px] py-[15px]">
      <div className="flex justify-between">
        <span
          className="font-[700] text-xl text-dark_charcoal cursor-pointer"
          onClick={handleLogoClick}
        >
          Nesthub
        </span>
        <div className="flex gap-10 items-center">
          <span className="font-[700] text-[10.5px] uppercase cursor-pointer">
            Offers
          </span>
          <span className="font-[700] text-[10.5px] uppercase cursor-pointer">
            clients
          </span>
          <div className="flex items-center gap-2">
            <span className="font-[700] text-[10.5px] uppercase">License</span>
            <DownIconSvg />
          </div>
          <div className="flex items-center gap-2">
            <Image src="/avatar.png" height={40} width={40} alt="user image" />
            <span className="font-[700] text-[13.5px] uppercase">
              Daniel Cohen
            </span>
            <DownIconSvg />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
