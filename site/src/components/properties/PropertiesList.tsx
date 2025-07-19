import { useEffect } from 'react';

import useDeviceType from '@/hooks/useDeviceType';
import { Property, PropertyListResponse } from '@/interfaces/property';
import Pagination from '@/shared/Pagination';

import PropertyCard from './PropertyCard';
import PropertyTable from './PropertyTable';

interface PropertiesListProps {
  filteredProperties: Property[];
  properties: PropertyListResponse;
  layout: 'grid' | 'list';
  onLayoutChange?: (layout: 'grid' | 'list') => void;
  setLayout?: (val: 'grid' | 'list') => void;
  onPageChange: (page: number) => void;
}

export default function PropertiesList({
  properties,
  filteredProperties,
  layout,
  onLayoutChange,
  setLayout,
  onPageChange,
}: PropertiesListProps) {
  const { isTablet, isMobile } = useDeviceType();

  useEffect(() => {
    if (isTablet || isMobile) {
      setLayout?.('grid');
      localStorage.setItem('properties_list_layout', 'grid');
    }
  }, [isTablet, isMobile, setLayout]);

  if (filteredProperties.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No properties found.</p>
      </div>
    );
  }

  return (
    <>
      <div>
        {layout === 'list' ? (
          <section className="mt-4 flex flex-col gap-4">
            {filteredProperties.map((property) => (
              <div key={property.id} className="border-b py-2">
                <PropertyTable property={property} layout={layout} />
              </div>
            ))}
          </section>
        ) : (
          <section className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </section>
        )}
      </div>
      <div className="flex justify-end mt-5">
        <Pagination properties={properties} onPageChange={onPageChange} />
      </div>
    </>
  );
}
