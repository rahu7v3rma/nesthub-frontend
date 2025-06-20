'use client';

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';
import { Key, useEffect, useState } from 'react';
import {
  FaCalendarAlt,
  FaDollarSign,
  FaList,
  FaRegClock,
  FaStar,
} from 'react-icons/fa';
import { FiChevronDown, FiGrid } from 'react-icons/fi';
import { LuArrowUp, LuArrowDown } from 'react-icons/lu';

import { FetchPropertiesParams } from '@/app/properties/page';

type SortKey = 'price' | 'inputDate' | 'activityDate' | 'rating';

const sortLabels: Record<SortKey, string> = {
  price: 'Price offered',
  inputDate: 'Property input date',
  activityDate: 'Last activity date',
  rating: 'Rating',
};

const sortKeyApiMap: Record<SortKey, string> = {
  price: 'price',
  inputDate: 'date',
  activityDate: 'activity',
  rating: 'rating',
};

type SortOptionsProps = {
  layout: 'grid' | 'list';
  onLayoutChange: (newLayout: 'grid' | 'list') => void;
  fetchProperties?: (params: FetchPropertiesParams) => void;
};

export default function SortOptions({
  layout,
  onLayoutChange,
  fetchProperties,
}: SortOptionsProps) {
  const [sortKey, setSortKey] = useState<SortKey>('price');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  useEffect(() => {
    if (fetchProperties) {
      const apiSortKey = sortKeyApiMap[sortKey];
      const sortParam = `${apiSortKey}_${sortOrder}`;
      fetchProperties({ sort: sortParam });
    }
  }, [sortKey, sortOrder]);

  const handleSortKeyChange = (key: Key) => {
    if (Object.keys(sortLabels).includes(key as string)) {
      setSortKey(key as SortKey);
    }
  };

  return (
    <div className="flex items-center justify-end gap-4 mt-4 sm:mt-0">
      <div className="flex items-center">
        <Dropdown>
          <DropdownTrigger>
            <Button variant="light" className="text-gray-500">
              <span className="text-sm">
                <span className="font-medium">SORT BY:</span>{' '}
                {sortLabels[sortKey]}
              </span>
              <FiChevronDown />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Sort options"
            variant="faded"
            onAction={handleSortKeyChange}
            itemClasses={{
              title: 'text-gray-800',
            }}
          >
            <DropdownItem
              key="price"
              startContent={<FaDollarSign className="text-gray-400" />}
            >
              {sortLabels.price}
            </DropdownItem>
            <DropdownItem
              key="inputDate"
              startContent={<FaCalendarAlt className="text-gray-400" />}
            >
              {sortLabels.inputDate}
            </DropdownItem>
            <DropdownItem
              key="activityDate"
              startContent={<FaRegClock className="text-gray-400" />}
            >
              {sortLabels.activityDate}
            </DropdownItem>
            <DropdownItem
              key="rating"
              startContent={<FaStar className="text-gray-400" />}
            >
              {sortLabels.rating}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <div className="flex items-center">
          <LuArrowUp
            size={20}
            onClick={() => setSortOrder('ASC')}
            className={`cursor-pointer ${
              sortOrder === 'ASC' ? 'text-gray-800' : 'text-gray-400'
            }`}
            aria-label="Sort ascending"
          />
          <LuArrowDown
            size={20}
            onClick={() => setSortOrder('DESC')}
            className={`cursor-pointer -ml-1 ${
              sortOrder === 'DESC' ? 'text-gray-800' : 'text-gray-400'
            }`}
            aria-label="Sort descending"
          />
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-0">
        <div
          className={`${layout === 'list' ? 'border-b border-[#2D2C31]' : ''}`}
        >
          <Button
            isIconOnly
            variant="light"
            className={`${
              layout === 'list' ? 'text-primary' : 'text-gray-400'
            }`}
            onPress={() => onLayoutChange('list')}
            aria-label="Switch to list view"
          >
            <FaList size={20} />
          </Button>
        </div>
        <div
          className={`${layout === 'grid' ? 'border-b border-[#2D2C31]' : ''}`}
        >
          <Button
            isIconOnly
            variant="light"
            className={`${
              layout === 'grid' ? 'text-primary' : 'text-gray-400'
            }`}
            onPress={() => onLayoutChange('grid')}
            aria-label="Switch to grid view"
          >
            <FiGrid size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
