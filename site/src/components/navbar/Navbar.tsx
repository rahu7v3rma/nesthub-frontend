'use client';

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  Link,
} from '@heroui/react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { FiUsers } from 'react-icons/fi';

import { ROUTES } from '@/constants';

import MenuIcon from './menuIcon';
import ProfileDropdown from './ProfileDropdown';

const { otpVerification, signin, signup, resetPassword, verifyAccount } =
  ROUTES;

const publicRoutes = [
  otpVerification,
  signin,
  signup,
  resetPassword,
  verifyAccount,
];

export default function AppNavbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isRealEstateUser, setIsRealEstateUser] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const userType = localStorage.getItem('user_type');
    setIsRealEstateUser(userType === 'realtor');
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      const userType = localStorage.getItem('user_type');
      setIsRealEstateUser(userType === 'realtor');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  if (publicRoutes.includes(pathname)) {
    return null;
  } else {
    return (
      <Navbar
        classNames={{
          base: 'container py-2 px-3',
          wrapper: 'max-w-full px-0',
        }}
        onMenuOpenChange={setIsMenuOpen}
      >
        <div className="mx-3">
          <NavbarBrand>
            <Link href={isRealEstateUser ? '/clients' : '/properties'}>
              <Image
                height={100}
                width={100}
                src="/images/nest-logo.svg"
                alt="logo"
                className="cursor-pointer"
              />
            </Link>
          </NavbarBrand>
        </div>
        <NavbarContent className="flex gap-10" justify="end">
          {/* <NavbarItem>
            <Link
              color="foreground"
              href={pathname === '/' ? undefined : '/'}
              className="text-sm font-semibold cursor-pointer"
            >
              Offers
            </Link>
          </NavbarItem> */}
          {isRealEstateUser && !isMobile && (
            <NavbarItem>
              <Link
                color="foreground"
                href={pathname === '/clients' ? undefined : '/clients'}
                className="text-sm font-semibold cursor-pointer"
              >
                Clients
              </Link>
            </NavbarItem>
          )}
          {/* <NavbarItem>
            <Link
              color="foreground"
              href={pathname === '/' ? undefined : '/'}
              className="text-sm font-semibold flex items-center gap-2 cursor-pointer"
            >
              License
              <FaChevronDown className="text-xs mt-0.5" />
            </Link>
          </NavbarItem> */}
          <ProfileDropdown isMobile={isMobile} />
        </NavbarContent>
      </Navbar>
    );
  }
}
