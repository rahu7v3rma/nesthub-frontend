import { Tooltip, Image } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';

import NewMessage from '@/assets/icons/newMessage';
import { Property } from '@/interfaces/property';
import New from '@/shared/New';
import Offer from '@/shared/Offer';
import OfferDeadlineBadge from '@/shared/OfferDeadlineBadge';
import { formatCurrency, formatQuantity } from '@/utils/format';

type PropertyCardProps = {
  property: Property;
};

export default function PropertyCard({ property }: PropertyCardProps) {
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
    <article className="min-w-1">
      <div className="relative">
        {property.image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img
              alt={property.name}
              src={property.image}
              className="rounded-3xl cursor-pointer"
              onClick={handleRedirect}
              style={{ height: '200px', width: '100%', maxWidth: '100%' }}
            />
          </>
        ) : (
          <div
            className="flex items-center justify-center rounded-3xl bg-gray-100 shadow-inner cursor-pointer"
            onClick={handleRedirect}
            style={{ height: '200px', width: '100%' }}
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
        {/* Message Icon in top-right corner with z-index */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {property?.offers && property.offers.length > 0 ? (
            property.offers.length === 1 ? (
              <Offer amount={property.offers[0].amount} offer_type="user" />
            ) : (
              <Offer
                amount={property.offers.reverse()[0].amount}
                offer_type="last"
                last_offer_date={property.offers.reverse()[0]?.date}
              />
            )
          ) : property.deadline_datetime ? (
            // Show OfferDeadlineBadge if no offers but has deadline
            <OfferDeadlineBadge deadlineDate={property.deadline_datetime} />
          ) : null}
        </div>
        <div className="absolute top-3 right-3 flex gap-1 z-10">
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
          {showNew() && <New />}
        </div>
      </div>
      <div className="flex justify-between">
        <p className="font-semibold text-lg text-primary mt-2">
          {formatCurrency(property.price)}
        </p>
        <div className="flex mt-2">
          <p className="my-auto">{property.property_rating}</p>
          <span className="text-yellow-400 my-auto mx-1">
            <FaStar />
          </span>
        </div>
      </div>
      <div className="overflow-hidden overflow-ellipsis">
        <span className="text-xs whitespace-nowrap">
          {property.address}
          {property.city && `, ${property.city}`}
          {property.state_or_province && `, ${property.state_or_province}`}
        </span>
      </div>
      <p className="text-xs flex gap-1 mt-1">
        <span>{formatQuantity(property.no_of_beds, 'bed')} &middot; </span>
        <span>{formatQuantity(property.no_of_baths, 'bath')} &middot;</span>
        <span>{`${property.square_feet_size} sq ft`}</span>
      </p>
    </article>
  );
}
