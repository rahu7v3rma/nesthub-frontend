'use client';

import { Navbar } from '@heroui/react';
import { ReactNode } from 'react';

interface AppNavbarProps {
  children?: ReactNode;
}

export default function AppNavbar({ children }: AppNavbarProps) {
  return (
    <Navbar
      classNames={{
        base: 'flex z-40 w-full h-[var(--navbar-height)] items-center justify-center data-[menu-open=true]:border-none',
        wrapper: 'px-0 max-w-full',
        content: 'basis-full flex-grow-0',
      }}
      height="auto"
    >
      {children}
    </Navbar>
  );
}
