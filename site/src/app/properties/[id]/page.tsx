'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import PropertyDetails from '@/components/properties/PropertyDetails';
import { PropertyDetails as IPropertyDetails } from '@/interfaces/property';
import { getPropertyDetails } from '@/services/api';

import PropertyDetailSkeleton from './components/PropertyDetailSkeleton';

export default function PropertyPage() {
  const params = useParams();
  const { id } = params || {};
  const [property, setProperty] = useState<IPropertyDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reRenderFlag, setRerenderFlag] = useState<boolean>(false);

  const fetchPropertyDetails = useCallback(
    async (signal?: AbortSignal, loading: boolean = true) => {
      if (loading) {
        setLoading(true);
      }
      setError(null);

      try {
        const realtor_property_id = localStorage.getItem('realtor_property_id');
        if (!realtor_property_id) {
          throw new Error('Realtor property ID not found');
        }

        const property = await getPropertyDetails(
          id as string,
          realtor_property_id,
        );
        if (!signal?.aborted) {
          setProperty(property);
          if (loading) {
            setLoading(false);
          }
        }
      } catch (err) {
        if (!signal?.aborted) {
          console.error('Error fetching property details:', err);
          setError('Failed to load property details');
          if (loading) {
            setLoading(false);
          }
        }
      }
    },
    [id],
  );

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    if (!id) {
      setError('Property ID not found');
      setLoading(false);
      return;
    }

    fetchPropertyDetails(signal);

    return () => {
      controller.abort();
    };
  }, [id, reRenderFlag, fetchPropertyDetails]);

  if (loading) {
    return <PropertyDetailSkeleton />;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!property) {
    return <div className="p-4">No property data available</div>;
  }

  return (
    <PropertyDetails
      property={property}
      flag={setRerenderFlag}
      reloadPropertyDetails={fetchPropertyDetails}
    />
  );
}
