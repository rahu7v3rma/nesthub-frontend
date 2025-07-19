'use client';

import { Button, Chip, Tab, Tabs, useDisclosure } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { Key, useState, useCallback, useEffect } from 'react';
import { MdEdit } from 'react-icons/md';

import { FetchPropertiesParams } from '@/app/properties/page';
import { Property, PropertyListResponse } from '@/interfaces/property';
import { getPropertyListing, getClientDetails } from '@/services/api';
import SearchInput from '@/shared/SearchInput/index';
import SortOptions from '@/shared/SortOptions/SortOptions';

import AddPropertyModal from './AddPropertyModal';
import PropertiesList from './PropertiesList';
import { PropertyCardSkeleton } from './PropertyCardSkeleton';

type PropertiesContainerProps = {
  properties: PropertyListResponse;
  fetchProperties: (params: FetchPropertiesParams) => void;
};

export default function PropertiesContainer({
  properties,
  fetchProperties,
}: PropertiesContainerProps) {
  const [selectedTabKey, setSelectedTabKey] = useState('all');
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [newProperties, setNewProperties] =
    useState<PropertyListResponse>(properties);
  const [clientName, setClientName] = useState('');
  const [sorting, setSorting] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const router = useRouter();

  useEffect(() => {
    const getLayout = localStorage.getItem('properties_list_layout');
    if (getLayout === 'grid' || getLayout === 'list') {
      setLayout(getLayout);
    } else {
      localStorage.setItem('properties_list_layout', 'grid');
      setLayout('grid');
    }
    const fetchClientDetails = async () => {
      setLoading(true);
      if (typeof window !== 'undefined') {
        const clientId = localStorage.getItem('clientId');
        const clientName = localStorage.getItem('clientName');
        if (clientName) {
          setClientName(clientName);
        } else if (clientId) {
          try {
            const clientDetails = await getClientDetails(clientId);
            if (clientDetails && clientDetails.name) {
              setClientName(clientDetails.name);
            }
          } catch (error) {
            console.error('Failed to fetch client details:', error);
          }
        }
      }
      setLoading(false);
    };
    fetchClientDetails();
  }, []);

  useEffect(() => {
    if (!properties) return;

    const propertiesWithIds = properties.list.map((prop) => ({
      ...prop,
      id: prop.id || `local-${prop.address.replace(/\s+/g, '-').toLowerCase()}`,
    }));
    setNewProperties(properties);
    setFilteredProperties(propertiesWithIds);
    setAllProperties(propertiesWithIds);
  }, [properties]);

  //  filtering logic
  const offerProperties = allProperties.filter((prop) => prop.price < 500000);
  const attentionProperties = allProperties.filter(
    (property) => property.id !== '1',
  );

  const tabSelectionHandler = (key: Key) => {
    setSelectedTabKey(key as string);
    switch (key) {
      case 'all':
        setFilteredProperties([...allProperties]);
        break;
      case 'offers':
        setFilteredProperties(offerProperties);
        break;
      case 'attention':
        setFilteredProperties(attentionProperties);
        break;
    }
  };

  const searchCompareFn = useCallback(
    (items: Property[], searchQuery: string) => {
      return items.filter((item) =>
        item.address.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    },
    [],
  );

  const handleSearch = useCallback(
    (searchQuery: string) => {
      const searchResults = searchCompareFn(allProperties, searchQuery);
      setFilteredProperties(searchResults);
    },
    [searchCompareFn, allProperties],
  );

  // Handler for layout change (grid or list)
  const handleLayoutChange = (newLayout: 'grid' | 'list') => {
    localStorage.setItem('properties_list_layout', newLayout);
    setLayout(newLayout);
  };

  const handleSortingChange = useCallback((sorting: string) => {
    setSorting(sorting);
  }, []);

  const handleAddProperty = async () => {
    const response: PropertyListResponse = await getPropertyListing({
      page: 1,
      limit: 12,
      user_id: localStorage.getItem('clientId') || '',
    });

    if (!response.list) return;

    const propertiesWithIds = response.list.map((prop) => ({
      ...prop,
      id: prop.id || `local-${prop.address.replace(/\s+/g, '-').toLowerCase()}`,
    }));

    setNewProperties(response);
    setFilteredProperties(propertiesWithIds);
    setAllProperties(propertiesWithIds);
  };

  const onPageChange = async (page: number) => {
    localStorage.setItem('properties_page', page.toString());
    const response: PropertyListResponse = await getPropertyListing({
      page: page,
      limit: 12,
      sort: sorting,
      user_id: localStorage.getItem('clientId') || '',
    });

    if (!response.list) return;

    const propertiesWithIds = response.list.map((prop) => ({
      ...prop,
      id: prop.id || `local-${prop.address.replace(/\s+/g, '-').toLowerCase()}`,
    }));

    setNewProperties(response);
    setFilteredProperties(propertiesWithIds);
    setAllProperties(propertiesWithIds);
  };

  return (
    <div className="properties-container py-4 px-6">
      {/* Header Section */}
      <div className="hidden sm:flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-xl text-black font-semibold">
          {loading ? (
            <div className="bg-gray-300 rounded animate-pulse h-8 w-72"></div>
          ) : (
            `${clientName}'s Properties`
          )}
        </h1>

        <div className="flex items-center gap-4">
          <div className="w-[300px]">
            <SearchInput onSearch={handleSearch} />
          </div>
          <Button isIconOnly variant="flat" size="lg" radius="full">
            <MdEdit
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const clientId = localStorage.getItem('clientId');
                  if (clientId) {
                    router.push(`/clients/${clientId}`);
                  }
                }
              }}
              size={18}
              className="text-primary"
            />
          </Button>
          <Button
            size="lg"
            color="primary"
            radius="full"
            className="uppercase text-sm font-semibold shrink-0"
            onPress={onOpen}
          >
            Add Property
          </Button>
          <AddPropertyModal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onClose={onClose}
            onAdd={handleAddProperty}
          />
        </div>
      </div>

      {/* Small Screen Layout */}
      <div className="sm:hidden">
        <div className="flex items-center mb-6">
          <div className="flex-1">
            <h1 className="text-xl text-black font-semibold">Properties</h1>
            <p className="text-black">{clientName}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button isIconOnly variant="flat" radius="full">
              <MdEdit size={18} className="text-primary" />
            </Button>
            <Button
              color="primary"
              radius="full"
              className="uppercase text-sm font-semibold shrink-0"
              onPress={onOpen}
            >
              Add Property
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <SearchInput onSearch={handleSearch} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row md:border-b sm:items-center sm:justify-between mb-4">
        <div className="border-b md:border-none flex items-center gap-3 overflow-auto scrollbar-hide">
          <div
            className={`flex-1 text-center ${selectedTabKey === 'all' ? 'border-b border-[#2D2C31]' : ''}`}
          >
            <Button
              variant="light"
              className={`w-full py-3 ${selectedTabKey === 'all' ? 'text-primary' : 'text-gray-400'}`}
              onPress={() => {
                tabSelectionHandler('all');
              }}
            >
              <div className="flex items-center justify-center w-full gap-2">
                <span className="uppercase text-xs">All Properties</span>
                <Chip
                  size="sm"
                  color={selectedTabKey === 'all' ? 'primary' : 'default'}
                  className="h-5"
                >
                  {allProperties?.length || 0}
                </Chip>
              </div>
            </Button>
          </div>
          <div
            className={`flex-1 text-center ${selectedTabKey === 'offers' ? 'border-b border-[#2D2C31]' : ''}`}
          >
            <Button
              variant="light"
              className={`w-full py-3 ${selectedTabKey === 'offers' ? 'text-primary' : 'text-gray-400'}`}
              onPress={() => {
                tabSelectionHandler('offers');
              }}
            >
              <div className="flex items-center justify-center w-full gap-2">
                <span className="uppercase text-xs">Your Offers</span>
                <Chip
                  size="sm"
                  color={selectedTabKey === 'offers' ? 'primary' : 'default'}
                  className="h-5"
                >
                  {offerProperties?.length || 0}
                </Chip>
              </div>
            </Button>
          </div>
          <div
            className={`flex-1 text-center ${selectedTabKey === 'attention' ? 'border-b border-[#2D2C31]' : ''}`}
          >
            <Button
              variant="light"
              className={`w-full py-3 ${selectedTabKey === 'attention' ? 'text-primary' : 'text-gray-400'}`}
              onPress={() => {
                tabSelectionHandler('attention');
              }}
            >
              <div className="flex items-center justify-center w-full gap-2">
                <span className="uppercase text-xs">Require Attention</span>
                <Chip
                  size="sm"
                  color={selectedTabKey === 'attention' ? 'primary' : 'default'}
                  className="h-5"
                >
                  {attentionProperties?.length || 0}
                </Chip>
              </div>
            </Button>
          </div>
        </div>

        <SortOptions
          fetchProperties={fetchProperties}
          layout={layout}
          onLayoutChange={handleLayoutChange}
          onSortingChange={handleSortingChange}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <PropertyCardSkeleton key={index} />
          ))}
        </div>
      ) : allProperties.length === 0 ? (
        <div className="text-center p-4">No properties available.</div>
      ) : (
        <PropertiesList
          filteredProperties={filteredProperties}
          properties={newProperties}
          layout={layout}
          onLayoutChange={handleLayoutChange}
          setLayout={(val: 'grid' | 'list') => setLayout(val)}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
