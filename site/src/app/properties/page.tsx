'use client';

import { useEffect, useState } from 'react';

import PropertiesContainer from '@/components/properties/PropertiesContainer';
import { PropertyListResponse } from '@/interfaces/property';
import { getPropertyListing } from '@/services/api';

export type FetchPropertiesParams = {
  signal?: AbortSignal;
  page?: number;
  limit?: number;
  sort?: string;
};

export default function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const [properties, setProperties] = useState<PropertyListResponse>({
    list: [],
    page: 1,
    has_next: false,
    total: 0,
  });
  const [error, setError] = useState(false);

  const fetchProperties = async ({
    signal,
    page = 1,
    limit = 12,
    sort,
  }: FetchPropertiesParams) => {
    try {
      const { search = '' } = await searchParams;

      const response = await getPropertyListing({
        search,
        page,
        limit,
        signal,
        sort,
        user_id: localStorage.getItem('clientId') || '',
      });
      setProperties(response);
    } catch (err) {
      if (signal?.aborted) {
        console.log('Fetch aborted');
      } else {
        console.error('Error fetching properties:', err);
        setError(true);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    fetchProperties({ signal });

    return () => {
      controller.abort();
    };
  }, [searchParams]);

  if (error) {
    return <div>Error loading properties</div>;
  }

  return (
    <section>
      <PropertiesContainer
        properties={properties}
        fetchProperties={fetchProperties}
      />
    </section>
  );
}
