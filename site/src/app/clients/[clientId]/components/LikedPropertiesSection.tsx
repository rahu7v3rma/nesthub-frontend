'use client';

import { Button } from '@heroui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Property } from '@/interfaces/property';
import { getPropertyListing } from '@/services/api';

import { LikedPropertyCard } from './LikedPropertyCard';

type LikedPropertiesSectionProps = {
  clientId: string;
};

export function LikedPropertiesSection({
  clientId,
}: LikedPropertiesSectionProps) {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchProperties() {
      try {
        const response = await getPropertyListing({
          search: '',
          page: 1,
          limit: 4,
          signal,
          user_id: clientId,
        });
        setProperties(response?.list || []);
      } catch (err) {
        if (signal.aborted) {
          console.log('Fetch aborted');
        } else {
          console.error('Error fetching properties:', err);
        }
      }
    }

    fetchProperties();

    return () => {
      controller.abort();
    };
  }, []);

  const handleViewClientProperties = () => {
    localStorage.setItem('clientId', clientId);
  };

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {' '}
          Liked properties{' '}
        </h2>
        <Link href={`/properties`} className="text-sm">
          <Button
            size="lg"
            variant="flat"
            radius="full"
            className="text-xs uppercase font-semibold !bg-[#F6F6F6] !text-gray-700"
            onPress={handleViewClientProperties}
          >
            {' '}
            View All{' '}
          </Button>
        </Link>
      </div>
      <div className="flex flex-col md:flex-row overflow-x-auto md:space-x-4 pb-4 -mx-1 px-1">
        {properties.map((property: Property) => (
          <LikedPropertyCard
            key={`property-card-${property.id}`}
            property={property}
          />
        ))}
        <div className="flex-shrink-0 w-1"></div>
      </div>
    </div>
  );
}
