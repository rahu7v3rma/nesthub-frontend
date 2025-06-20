'use client';

import { Image } from '@heroui/react';
import { useEffect, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import '@/styles/swiper-custom.css';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/swiper-bundle.css';

type PropertyImagesSwiperProps = {
  images: {
    lowRes?: string;
    midRes?: string;
    highRes?: string;
  }[];
  isMobile: boolean;
};

export default function PropertyImagesSwiper({
  images,
  isMobile,
}: PropertyImagesSwiperProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass>();
  return (
    <>
      <Swiper
        spaceBetween={10}
        thumbs={{
          swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
        }}
        modules={[FreeMode, Navigation, Thumbs]}
      >
        {images.map((image, index) => (
          <SwiperSlide key={`main_${index}`}>
            <Image
              src={image.highRes}
              alt="Property Image"
              classNames={{
                wrapper: '!max-w-full',
                img: 'w-full rounded-xl',
              }}
              height={isMobile ? '200px' : '400px'}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={isMobile ? 3 : 4}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="thumbSwiper mt-4"
      >
        {images.map((image, index) => (
          <SwiperSlide key={`small_image_${index}`}>
            <Image
              src={image.highRes}
              alt="Property Image"
              height={isMobile ? '80px' : '120px'}
              width={'200px'}
            />
          </SwiperSlide>
        ))}
        <div className="swiper-button-prev-custom absolute left-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/80 p-2 shadow-md hover:bg-white">
          <FaChevronLeft className="text-gray-800" size={isMobile ? 12 : 18} />
        </div>
        <div className="swiper-button-next-custom absolute right-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/80 p-2 shadow-md hover:bg-white">
          <FaChevronRight className="text-gray-800" size={isMobile ? 12 : 18} />
        </div>
      </Swiper>
    </>
  );
}
