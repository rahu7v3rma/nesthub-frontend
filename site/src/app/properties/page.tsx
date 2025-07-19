'use client';

import { useEffect, useState, useCallback } from 'react';

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

  const fetchProperties = useCallback(
    async ({ signal, page = 1, limit = 12, sort }: FetchPropertiesParams) => {
      const properties_page = localStorage.getItem('properties_page');
      const PropertyPage = Number(properties_page);
      try {
        const { search = '' } = await searchParams;

        const response = await getPropertyListing({
          search,
          page: PropertyPage ? PropertyPage : page,
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
    },
    [searchParams],
  );

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    fetchProperties({ signal });

    return () => {
      controller.abort();
    };
  }, [fetchProperties]);

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
