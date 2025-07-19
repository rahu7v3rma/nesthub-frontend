'use client';

import { useEffect, useState } from 'react';

export type DeviceType = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
};

export default function useDeviceType(): DeviceType {
  const [device, setDevice] = useState<DeviceType>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      if (width <= 767) {
        setDevice({ isMobile: true, isTablet: false, isDesktop: false });
      } else if (width <= 1023) {
        setDevice({ isMobile: false, isTablet: true, isDesktop: false });
      } else {
        setDevice({ isMobile: false, isTablet: false, isDesktop: true });
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return device;
}
