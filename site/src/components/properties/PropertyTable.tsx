import { Image, Tooltip } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';

import NewMessage from '@/assets/icons/newMessage';
import { Property } from '@/interfaces/property';
import New from '@/shared/New';
import Offer from '@/shared/Offer';
import { formatCurrency, formatQuantity } from '@/utils/format';

type PropertyTableProps = {
  property: Property;
};

export default function PropertyTable({ property }: PropertyTableProps) {
  const router = useRouter();
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserType = localStorage.getItem('user_type');
      setUserType(storedUserType);
    }
  }, []);

  const handleRedirect = () => {
    localStorage.setItem(
      'realtor_property_id',
      (property?.realtor_property_id || '') as string,
    );
    router?.push(`properties/${property.id}`);
  };

  const showNew = (): boolean => {
    if (property.is_property_viewed_by_client === null) {
      return false;
    }
    if (userType === 'realtor') {
      return property.is_property_viewed_by_client;
    } else if (userType === 'user') {
      return !property.is_property_viewed_by_client;
    }
    return false;
  };

  return (
    <>
      <div className="grid grid-cols-[1.5fr_10.5fr]  gap-1">
        <div className="md:flex md:m-auto">
          {property.image ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img
                alt={property.name}
                src={property.image}
                className="rounded-3xl cursor-pointer"
                onClick={handleRedirect}
                style={{ height: '80px', width: '120px', maxWidth: '100%' }}
              />
            </>
          ) : (
            <div
              className="flex items-center justify-center rounded-3xl bg-gray-100 shadow-inner cursor-pointer"
              onClick={handleRedirect}
              style={{ height: '80px', width: '120px', maxWidth: '100%' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5h18M3 19h18M5 7h14v10H5V7z"
                />
              </svg>
              <p>No Image</p>
            </div>
          )}
        </div>
        <div className="md:ml-3">
          <div className="grid grid-cols-12 gap-2 h-full">
            <div className="col-span-6 lg:col-span-4 my-auto">
              <span className="flex text-[13px] text-[#2D2C31] items-center whitespace-nowrap">
                <Image
                  alt={property.name}
                  src={'/svgs/address.svg'}
                  className="rounded-3xl"
                />
                {property.address}
                {property.city && `, ${property.city}`}
                {property.state_or_province &&
                  `, ${property.state_or_province}`}
              </span>
            </div>
            <div className="col-span-6 lg:col-span-2 my-auto">
              <p className="!font-[700] text-base text-[#2D2C31]">
                {formatCurrency(property.price)}
              </p>
              <div className="flex">
                <p className="text-[13px] text-[#A9A6B2]">Offered on</p>
                <p className="text-[13px] text-[#5E5E61] ml-1">
                  {property.created_at
                    ? new Date(property.created_at).toLocaleDateString('en-US')
                    : '-'}
                </p>
              </div>
            </div>
            <div className="col-span-6 lg:col-span-1 my-auto">
              <div className="flex mt-2 justify-start lg:justify-center">
                <p className="my-auto">{property.property_rating}</p>
                <span className="text-yellow-400 my-auto mx-1">
                  <FaStar />
                </span>
              </div>
            </div>
            <div className="col-span-6 lg:col-span-3 my-auto">
              <p className="text-xs flex gap-1 mt-1">
                <span className="text-[13px] text-[#5E5E61]">
                  {formatQuantity(property.no_of_beds, 'bed')} ·{' '}
                </span>
                <span className="text-[13px] text-[#5E5E61]">
                  {formatQuantity(property.no_of_baths, 'bath')} ·
                </span>
                <span className="text-[13px] text-[#5E5E61]">{`${property.square_feet_size} sq ft`}</span>
              </p>
            </div>
            <div className="col-span-6 lg:col-span-1 my-auto">
              <p className="text-[13px] text-[#A9A6B2]">Deadline</p>
              <p className="text-[13px] text-[#5E5E61]">
                {property.deadline_datetime
                  ? new Date(property.deadline_datetime).toLocaleDateString(
                      'en-US',
                    )
                  : '-'}
              </p>
            </div>
            <div className="col-span-3 lg:col-span-1 my-auto">
              <div className="flex gap-[5px]">
                {property.has_unread_messages && (
                  <NewMessage onClick={handleRedirect} />
                )}
                {property.has_disclosures && (
                  <Tooltip
                    color="primary"
                    content="Disclosure available"
                    showArrow={true}
                  >
                    <Image
                      alt={'lock'}
                      src={'/svgs/chat-lock.svg'}
                      className="rounded-3xl cursor-pointer hover:text-gray-400"
                    />
                  </Tooltip>
                )}
                {property.offers &&
                  property.offers.length > 0 &&
                  (() => {
                    if (property.offers.length === 1) {
                      return (
                        <Offer
                          amount={property.offers[0].amount}
                          offer_type="user"
                        />
                      );
                    } else {
                      const amountFromLast =
                        property.offers[property.offers.length - 1].amount;
                      const dateFromFirst = property.offers[0]?.date;
                      return (
                        <Offer
                          amount={amountFromLast}
                          offer_type="last"
                          last_offer_date={dateFromFirst}
                        />
                      );
                    }
                  })()}
                {showNew() && <New />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
