// this component has to be a server component for csp nonces to be applied
import { HeroUIProvider } from '@heroui/react';
import type { Metadata } from 'next';
import { Inter, Figtree, Almarai } from 'next/font/google';

import AppNavbar from '@/components/navbar/Navbar';
import { UserProvider } from '@/contexts/UserContext';
import ToastProvider from '@/utils/customToast';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const almarai = Almarai({
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Nesthub',
  description: 'Nesthub',
  icons: {
    icon: '/favicon.ico',
  },
};

// we sadly need to force the layout to be dynamic for inline nextjs scripts to
// use the nonce value properly
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light text-foreground bg-background">
      <body
        className={
          (inter.className, figtree.className, almarai.className, 'h-screen')
        }
      >
        <UserProvider>
          <HeroUIProvider>
            <ToastProvider>
              <AppNavbar />
              <main className="container">{children}</main>
            </ToastProvider>
          </HeroUIProvider>
        </UserProvider>
      </body>
    </html>
  );
}
