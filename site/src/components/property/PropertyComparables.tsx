'use client';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Image as HeroImage,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader as HeroModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
  Tabs,
  Tab,
} from '@heroui/react';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { IconType } from 'react-icons';
import { BsSearch } from 'react-icons/bs';
import {
  FaKey,
  FaHandHoldingHeart,
  FaTools,
  FaGraduationCap,
  FaRoad,
  FaShoppingCart,
} from 'react-icons/fa';
import { ImEnlarge2 } from 'react-icons/im';
import {
  IoChevronBackOutline,
  IoCloseOutline,
  IoLinkOutline,
} from 'react-icons/io5';
import { toast } from 'react-toastify';

import { useRealEstate } from '@/hooks/useRealEstate';
import { PropertyComparable, Property } from '@/interfaces/property';
import {
  MLSDetailResponse,
  MLSDetailPropertyResponse,
} from '@/interfaces/realEstateApi';
import {
  createComparable,
  CreateComparablePayload,
  deleteComparable,
  getPropertyDetails,
} from '@/services/api';
import ConfirmationAlert from '@/shared/ConfirmationAlert';
import { formatPrice } from '@/utils/format';

const DEFAULT_PROPERTY_IMAGE_URL =
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';

interface ImageResolutionData {
  lowRes: string;
  midRes: string;
  highRes: string;
}

const getDisplayImageUrl = (
  imageDataJsonString: string | ImageResolutionData[] | null | undefined,
): string => {
  if (!imageDataJsonString) {
    return DEFAULT_PROPERTY_IMAGE_URL;
  }

  if (typeof imageDataJsonString === 'string') {
    if (
      imageDataJsonString.startsWith('http://') ||
      imageDataJsonString.startsWith('https://')
    ) {
      try {
        const parsedData = JSON.parse(imageDataJsonString);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          const firstImage = parsedData[0];
          return (
            firstImage.midRes ||
            firstImage.lowRes ||
            firstImage.highRes ||
            DEFAULT_PROPERTY_IMAGE_URL
          );
        }
      } catch (e) {
        return imageDataJsonString;
      }
    }
    return imageDataJsonString;
  }

  if (Array.isArray(imageDataJsonString) && imageDataJsonString.length > 0) {
    const firstImage = imageDataJsonString[0];
    return (
      firstImage.midRes ||
      firstImage.lowRes ||
      firstImage.highRes ||
      DEFAULT_PROPERTY_IMAGE_URL
    );
  }

  return DEFAULT_PROPERTY_IMAGE_URL;
};

interface AdditionalInfoItem {
  id: string;
  label: string;
  Icon: IconType;
}

const additionalInfoOptions: AdditionalInfoItem[] = [
  { id: 'moveInReady', label: 'Move in ready', Icon: FaKey },
  { id: 'needsCare', label: 'Needs some care', Icon: FaHandHoldingHeart },
  { id: 'fixerUpper', label: 'Fixer upper', Icon: FaTools },
  { id: 'greatSchools', label: 'Great schools', Icon: FaGraduationCap },
  { id: 'largeLot', label: 'Large lot', Icon: ImEnlarge2 },
  { id: 'nearFreeway', label: 'Near freeway', Icon: FaRoad },
  { id: 'nearGroceries', label: 'Near groceries', Icon: FaShoppingCart },
];

const labelToIconMap = new Map(
  additionalInfoOptions.map((option) => [option.label, option.Icon]),
);

type AddComparableModalProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
  onComparableAdded?: () => void;
  propertyId: number;
};

function AddComparableModal({
  isOpen,
  onOpenChange,
  onClose,
  onComparableAdded,
  propertyId,
}: AddComparableModalProps) {
  const [selectedTab, setSelectedTab] = useState<'address' | 'link'>('address');
  const [addressSearch, setAddressSearch] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<any>({});
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedAddressFull, setSelectedAddressFull] = useState('');
  const [selectedAdditionalInfo, setSelectedAdditionalInfo] = useState<
    string[]
  >([]);
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [linkUrlError, setLinkUrlError] = useState<string | null>(null);
  const [hasLinkOnlyComparable, setHasLinkOnlyComparable] = useState(false);
  const [hasAddressComparable, setHasAddressComparable] = useState(false);

  const { getMLSDetail, getMLSSearch, loading } = useRealEstate();

  useEffect(() => {
    const checkExistingComparables = async () => {
      try {
        const response = await getPropertyDetails(
          propertyId.toString(),
          localStorage.getItem('realtor_property_id') || '',
        );
        const comparables = response?.comparables || [];

        const hasLink = comparables.some(
          (comp: PropertyComparable) => comp.is_link_only,
        );
        const hasAddress = comparables.some(
          (comp: PropertyComparable) => !comp.is_link_only,
        );

        setHasLinkOnlyComparable(hasLink);
        setHasAddressComparable(hasAddress);

        if (hasLink) {
          setSelectedTab('link');
        } else if (hasAddress) {
          setSelectedTab('address');
        }
      } catch (error) {
        console.error('Error checking existing comparables:', error);
      }
    };

    if (isOpen) {
      checkExistingComparables();
    }
  }, [isOpen, propertyId]);

  const resetForm = useCallback(() => {
    setAddressSearch('');
    setLinkUrl('');
    setSelectedAddressFull('');
    setSelectedAdditionalInfo([]);
    setSearchResults([]);
    setIsSubmitting(false);
    setAddressError(null);
    setLinkUrlError(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleTabChange = (key: React.Key) => {
    const newTab = key.toString() as 'address' | 'link';

    if (
      (newTab === 'address' && hasLinkOnlyComparable) ||
      (newTab === 'link' && hasAddressComparable)
    ) {
      toast.error(
        `Cannot add ${newTab === 'address' ? 'address' : 'link'} when ${newTab === 'address' ? 'link' : 'address'} exists`,
      );
      return;
    }

    setSelectedTab(newTab);
    if (newTab === 'address') {
      setLinkUrl('');
      setLinkUrlError(null);
    }
    if (newTab === 'link') {
      setAddressSearch('');
      setSearchResults([]);
    }
  };

  const handleAddressInputChange = useCallback(
    async (query: string) => {
      setAddressSearch(query);
      setSelectedAddressFull(query);
      if (addressError) {
        setAddressError(null);
      }

      if (query.trim().length < 3) {
        setSearchResults([]);
        return;
      }

      try {
        const response = (await getMLSSearch({
          address: query,
        })) as MLSDetailResponse;
        if (response?.data && response.data.length > 0) {
          const newProperties: Property[] = response.data.map((prop: any) => ({
            id:
              prop.listingId ||
              `api-${prop.listing.address.unparsedAddress.replace(/\s+/g, '-').toLowerCase()}`,
            address:
              prop.listing.address.unparsedAddress || 'No address available',
            city: prop.listing.address.city || '',
            county_or_parish: prop.listing.address.countyOrParish || '',
            state_or_province: prop.listing.address.stateOrProvince || '',
            zip_code: prop.listing.address.zipCode || '',
            name: prop.listingAgent?.fullName || 'Unknown',
            image:
              prop.listing.media?.primaryListingImageUrl ||
              DEFAULT_PROPERTY_IMAGE_URL,
            no_of_baths: prop.listing.property?.bathroomsTotal || 0,
            no_of_beds: prop.listing.property?.bedroomsTotal || 0,
            price: prop.listing?.listPriceLow || 0,
            square_feet_size: prop.listing.property?.livingArea || 0,
            description: prop.listing?.publicRemarks || '',
            status: prop.listing?.standardStatus || '',
            yearBuilt: prop.listing.property?.yearBuilt || '',
            propertyType: prop.listing.property?.propertyType || '',
            location: {
              latitude: prop.listing.property?.latitude || 0,
              longitude: prop.listing.property?.longitude || 0,
            },
            is_property_viewed_by_client: false,
            has_disclosures: false,
            offers: [],
            has_unread_messages: false,
          }));
          setSearchResults(newProperties);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error('Error searching addresses:', err);
        setSearchResults([]);
      }
    },
    [getMLSSearch],
  );

  const handleSelectAddress = (property: Property) => {
    setSelectedProperty(property);
    const fullAddress = `${property.address}${property.city ? `, ${property.city}` : ''}${property.state_or_province ? `, ${property.state_or_province}` : ''}`;
    setAddressSearch(fullAddress);
    setSelectedAddressFull(fullAddress);
    setSearchResults([]);
    if (addressError) {
      setAddressError(null);
    }
  };

  const toggleAdditionalInfo = (id: string) => {
    setSelectedAdditionalInfo((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const validateUrl = (url: string) => {
    if (!url.trim()) return 'Please enter a URL';
    if (!/^https?:\/\/.+\..+/.test(url.trim())) {
      return 'Please enter a valid URL (include http:// or https://)';
    }
    return '';
  };

  const handleSave = async () => {
    if (selectedTab === 'link') {
      const urlError = validateUrl(linkUrl);
      if (urlError) {
        setLinkUrlError(urlError);
        return;
      }
      await saveLinkComparable();
    } else {
      if (!isEmpty(searchResults)) {
        toast.error('Select the address from dropdown');
      } else {
        if (
          !selectedAddressFull.trim() ||
          !propertyId ||
          isEmpty(selectedProperty)
        ) {
          toast.error('Address or Property ID is missing for save.');
          if (!selectedAddressFull.trim()) {
            setAddressError('Address is required.');
          }
        } else {
          await saveAddressComparable();
        }
      }
    }
  };

  const saveLinkComparable = async () => {
    if (!linkUrl.trim()) {
      setLinkUrlError('Please enter a valid URL');
      return;
    }

    setIsSubmitting(true);

    const additionalInfoLabels = selectedAdditionalInfo
      .map((id) => additionalInfoOptions.find((opt) => opt.id === id)?.label)
      .filter((label): label is string => typeof label === 'string');

    const payload: CreateComparablePayload = {
      realtor_property_id: localStorage.getItem('realtor_property_id') || '',
      client_id: localStorage.getItem('clientId') || '',
      url: linkUrl.trim(),
      is_link_only: true,
      additional_info:
        additionalInfoLabels.length > 0 ? additionalInfoLabels : undefined,
    };

    try {
      await createComparable(propertyId, payload);
      if (onComparableAdded) {
        onComparableAdded();
      }
      handleCloseModal();
      toast.success('Link added successfully');
    } catch (apiError: any) {
      console.error('Failed to add comparable:', apiError);
      toast.error(
        apiError.message ||
          'An unexpected error occurred while adding the comparable.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveAddressComparable = async () => {
    setIsSubmitting(true);

    const additionalInfoLabels = selectedAdditionalInfo
      .map((id) => additionalInfoOptions.find((opt) => opt.id === id)?.label)
      .filter((label): label is string => typeof label === 'string');

    if (selectedProperty && selectedProperty.id) {
      try {
        const response = (await getMLSDetail({
          listing_id: Number(selectedProperty?.id),
        })) as MLSDetailPropertyResponse;

        const address = {
          name: response?.data?.listingAgent?.fullName || '',
          price: response?.data?.listPrice || 0,
          listing_id: selectedProperty.id,
          no_of_beds: response?.data?.property?.bedroomsTotal || 0,
          no_of_baths: response?.data?.property?.bathroomsTotal || 0,
          square_feet_size: response?.data?.property?.livingArea || 0,
          image: response?.data?.media?.primaryListingImageUrl || null,
          photosList: response?.data?.media?.photosList || null,
          longitude: response?.data?.property?.longitude || null,
          latitude: response?.data?.property?.latitude || null,
          additional_information: response?.data?.publicRemarks || null,
          address: response?.data?.address?.unparsedAddress || null,
          city: response?.data?.address?.city || null,
          county_or_parish: response?.data?.address?.countyOrParish || null,
          state_or_province: response?.data?.address?.stateOrProvince || null,
          zip_code: response?.data?.address?.zipCode || null,
          deadline_datetime: null,
          is_deadline_checked: false,
          note: '',
        };

        const payload: CreateComparablePayload = {
          address,
          realtor_property_id:
            localStorage.getItem('realtor_property_id') || '',
          client_id: localStorage.getItem('clientId') || '',
          is_link_only: false,
        };

        if (additionalInfoLabels.length > 0) {
          payload.additional_info = additionalInfoLabels;
        }

        await createComparable(propertyId, payload);
        if (onComparableAdded) {
          onComparableAdded();
        }
        handleCloseModal();
        setSelectedProperty({});
        toast.success('Comparable added successfully');
      } catch (apiError: any) {
        console.error('Failed to add comparable:', apiError);
        toast.error(
          apiError.message ||
            'An unexpected error occurred while adding the comparable.',
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.error('Select the address from dropdown');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      size="xl"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={!isSubmitting}
      hideCloseButton={true}
      className="rounded-xl"
    >
      <ModalContent className="p-0">
        {() => (
          <>
            <HeroModalHeader className="flex items-center justify-between px-6 py-4">
              <Button
                isIconOnly
                variant="light"
                onPress={handleCloseModal}
                aria-label="Back"
                className="text-gray-500 hover:bg-gray-100 rounded-full p-2"
                disabled={isSubmitting}
              >
                <IoChevronBackOutline size={24} />
              </Button>
              <h2 className="text-xl font-semibold text-gray-800">
                Add comparable
              </h2>
              <Button
                isIconOnly
                variant="light"
                onPress={handleCloseModal}
                aria-label="Close"
                className="text-gray-500 hover:bg-gray-100 rounded-full p-2"
                disabled={isSubmitting}
              >
                <IoCloseOutline size={24} />
              </Button>
            </HeroModalHeader>

            <ModalBody className="px-6 py-4">
              <Tabs
                key={selectedTab}
                selectedKey={selectedTab}
                onSelectionChange={handleTabChange}
                color="primary"
                radius="full"
                size="lg"
                classNames={{
                  base: 'justify-center',
                  tabList: 'p-0 gap-0',
                  tab: 'h-12',
                  tabContent:
                    'text-xs font-semibold text-foreground group-data-[selected=true]:text-primary-foreground uppercase',
                }}
              >
                <Tab
                  key="address"
                  title="SEARCH ADDRESS"
                  isDisabled={hasLinkOnlyComparable}
                >
                  <div className="space-y-4 pt-4">
                    <div className="relative">
                      <Input
                        label="Address"
                        labelPlacement="outside"
                        placeholder="Search"
                        value={addressSearch}
                        onChange={(e) =>
                          handleAddressInputChange(e.target.value)
                        }
                        onBlur={() => {
                          if (!selectedAddressFull.trim()) {
                            setAddressError('Address is required.');
                          }
                        }}
                        radius="full"
                        size="lg"
                        endContent={
                          <BsSearch className="text-gray-400" size={18} />
                        }
                        classNames={{
                          inputWrapper: addressError
                            ? 'border-1 border-red-500'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300 focus-within:border-primary shadow-none',
                          input: 'bg-transparent',
                          label: 'text-gray-700 font-medium',
                        }}
                        disabled={isSubmitting}
                      />
                      {addressError && (
                        <p className="text-red-500 text-sm mt-1">
                          {addressError}
                        </p>
                      )}
                      {loading && (
                        <div className="absolute z-50 w-full mt-2 flex justify-center items-center h-28 bg-white shadow-lg rounded-lg border border-gray-200">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                      )}
                      {searchResults.length > 0 &&
                        addressSearch.trim().length > 0 && (
                          <div className="absolute z-50 w-full max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-lg mt-2">
                            {searchResults.map((property, index) => {
                              const fullAddress = `${property.address}${property.city ? `, ${property.city}` : ''}${property.state_or_province ? `, ${property.state_or_province}` : ''}`;
                              return (
                                <div
                                  key={property.id || index}
                                  className="p-2 px-3 cursor-pointer hover:bg-gray-100 text-sm text-gray-700"
                                  onClick={() => handleSelectAddress(property)}
                                >
                                  {fullAddress}
                                </div>
                              );
                            })}
                          </div>
                        )}
                    </div>
                  </div>
                </Tab>
                <Tab
                  key="link"
                  title="ADD LINK"
                  isDisabled={hasAddressComparable}
                >
                  <div className="space-y-4 pt-4">
                    <Input
                      label="Link"
                      labelPlacement="outside"
                      placeholder="https://"
                      value={linkUrl}
                      onChange={(e) => {
                        setLinkUrl(e.target.value);
                        setLinkUrlError(null);
                      }}
                      onBlur={() => {
                        const error = validateUrl(linkUrl);
                        if (error) setLinkUrlError(error);
                      }}
                      radius="full"
                      size="lg"
                      type="url"
                      classNames={{
                        inputWrapper: linkUrlError
                          ? 'border-1 border-red-500'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300 focus-within:border-primary shadow-none',
                        input: 'bg-transparent',
                        label: 'text-gray-700 font-medium',
                      }}
                      disabled={isSubmitting}
                    />
                    {linkUrlError && (
                      <p className="text-red-500 text-sm mt-1">
                        {linkUrlError}
                      </p>
                    )}
                  </div>
                </Tab>
              </Tabs>

              {selectedTab === 'address' && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Additional info
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-x-2 gap-y-4 justify-items-center">
                    {additionalInfoOptions.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col items-center text-center w-full max-w-[100px]"
                      >
                        <button
                          type="button"
                          onClick={() => toggleAdditionalInfo(item.id)}
                          aria-pressed={selectedAdditionalInfo.includes(
                            item.id,
                          )}
                          className={`size-10 rounded-full flex items-center justify-center mb-1.5 transition-all duration-150 ease-in-out
                          ${
                            selectedAdditionalInfo.includes(item.id)
                              ? 'bg-gray-300 ring-2 ring-primary'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                          disabled={isSubmitting}
                        >
                          <item.Icon
                            className={`${
                              selectedAdditionalInfo.includes(item.id)
                                ? 'text-primary'
                                : 'text-gray-900'
                            }`}
                          />
                        </button>
                        <span className="text-xs text-gray-600 leading-tight">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                size="lg"
                radius="full"
                className="w-full mt-8 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3"
                onPress={handleSave}
                disabled={isSubmitting || loading}
                isLoading={isSubmitting}
              >
                SAVE
              </Button>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

const OnMarketDisplay = ({ onMarketDate }: { onMarketDate: string | null }) => {
  const [displayText, setDisplayText] = useState('N/A');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (onMarketDate && moment(onMarketDate).isValid()) {
        setDisplayText(`${moment().diff(moment(onMarketDate), 'weeks')} weeks`);
      } else {
        setDisplayText('N/A');
      }
    }
  }, [onMarketDate, isMounted]);

  return <>{displayText}</>;
};

type PropertyComparablesProps = {
  comparables: PropertyComparable[];
  onComparableAdded?: () => void;
};

export default function PropertyComparables({
  comparables = [],
  onComparableAdded,
}: PropertyComparablesProps) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [userType, setUserType] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [comparableToDelete, setComparableToDelete] = useState<number | null>(
    null,
  );

  const params = useParams();
  const propertyIdFromParams = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserType = localStorage.getItem('user_type');
      setUserType(storedUserType);
    }
  }, []);

  const handleComparableAddedSuccess = () => {
    if (onComparableAdded) {
      onComparableAdded();
    }
  };

  const handleDelete = async (comparableId: number) => {
    setComparableToDelete(comparableId);
    setIsConfirmModalOpen(true);
  };

  const executeDeleteComparable = async () => {
    if (comparableToDelete === null) return;
    if (numericPropertyId === null || isNaN(numericPropertyId)) {
      toast.error('Property ID is missing or invalid.');
      setIsConfirmModalOpen(false);
      setComparableToDelete(null);
      return;
    }

    setIsDeleting(comparableToDelete);
    setIsConfirmModalOpen(false);

    try {
      await deleteComparable(numericPropertyId, comparableToDelete);
      toast.success('Comparable deleted successfully');
      if (onComparableAdded) {
        onComparableAdded();
      }
    } catch (error: any) {
      console.error('Failed to delete comparable:', error);
      toast.error(error?.message || 'Failed to delete comparable.');
    } finally {
      setIsDeleting(null);
      setComparableToDelete(null);
    }
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setComparableToDelete(null);
  };

  const numericPropertyId = propertyIdFromParams
    ? parseInt(propertyIdFromParams, 10)
    : null;
  const isValidNumericPropertyId =
    numericPropertyId !== null && !isNaN(numericPropertyId);

  const linkOnlyComparable = comparables.find((comp) => comp.is_link_only);
  const addressComparables = comparables.filter((comp) => !comp.is_link_only);

  return (
    <>
      <Card className="p-[35px_28px] mb-[5rem]">
        <CardHeader>
          <div className="flex gap-[10px] items-center">
            <h2 className="text-[#2D2C31] font-[700] text-[18px] font-[Figtree]">
              Comparables
            </h2>
            {userType === 'realtor' && (
              <>
                {linkOnlyComparable ? (
                  <div className="flex items-center gap-2">
                    <IoLinkOutline
                      className="text-gray-600 cursor-pointer"
                      size={24}
                      onClick={() => {
                        if (linkOnlyComparable.url) {
                          window.open(linkOnlyComparable.url, '_blank');
                        }
                      }}
                    />
                    <div
                      className={`cursor-pointer w-[24px] h-[24px] bg-[#F9F9F9] rounded-full flex items-center justify-center ${isDeleting === linkOnlyComparable.comparable_id ? 'opacity-50' : ''}`}
                      onClick={() =>
                        !isDeleting &&
                        linkOnlyComparable.comparable_id &&
                        handleDelete(linkOnlyComparable.comparable_id)
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          !isDeleting &&
                            linkOnlyComparable.comparable_id &&
                            handleDelete(linkOnlyComparable.comparable_id);
                        }
                      }}
                      aria-disabled={!!isDeleting}
                      aria-label="Remove comparable"
                    >
                      {isDeleting === linkOnlyComparable.comparable_id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-700" />
                      ) : (
                        <HeroImage
                          src={'/svgs/remove.svg'}
                          alt="remove"
                          width={10}
                          height={10}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <HeroImage
                    src="/svgs/add.svg"
                    alt="Add Comparable"
                    width={24}
                    height={24}
                    className="cursor-pointer"
                    onClick={onOpen}
                  />
                )}
              </>
            )}
          </div>
        </CardHeader>
        <CardBody>
          {addressComparables.length > 0 ? (
            <Table
              aria-label="comparables table"
              classNames={{
                base: 'w-full',
                wrapper: 'p-0 shadow-none',
                th: 'bg-transparent text-[12px] font-[Almarai] font-[400] text-[#A8A6B0] border-b-[1px] border-b-[#F6F6F6]',
                td: 'py-[10px] border-b-[1px] border-b-[#F6F6F6] text-[#5E5E61] text-[13px] font-[Almarai]',
              }}
            >
              <TableHeader>
                <TableColumn>Property</TableColumn>
                <TableColumn>Address</TableColumn>
                <TableColumn>Sq ft</TableColumn>
                <TableColumn>Listing price ($)</TableColumn>
                <TableColumn>Closing price ($)</TableColumn>
                <TableColumn>Price/Sq ft ($)</TableColumn>
                <TableColumn>Bedrooms</TableColumn>
                <TableColumn>Bathrooms</TableColumn>
                <TableColumn>On market</TableColumn>
                <TableColumn>Additional Info</TableColumn>
                <TableColumn> </TableColumn>
              </TableHeader>
              <TableBody>
                {addressComparables.map((item, index) => (
                  <TableRow key={item.comparable_id || index}>
                    <TableCell>
                      <HeroImage
                        src={getDisplayImageUrl(item.image)}
                        alt="property"
                        width={75}
                        height={40}
                        className="rounded-[4px] object-cover"
                      />
                    </TableCell>
                    <TableCell className="min-w-[200px]">
                      {item.address}
                    </TableCell>
                    <TableCell>
                      {typeof item.squareFeet === 'number'
                        ? item.squareFeet.toLocaleString('en-US')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {formatPrice(item.listingPrice || 0).replace('$ ', '')}
                    </TableCell>
                    <TableCell>
                      {item.closingPrice !== null &&
                      typeof item.closingPrice === 'number'
                        ? formatPrice(item.closingPrice).replace('$ ', '')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {typeof item.amountPerSqrFeet === 'number'
                        ? item.amountPerSqrFeet.toFixed(2)
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{item.bedsCount || 'N/A'}</TableCell>
                    <TableCell>{item.bathsCount || 'N/A'}</TableCell>
                    <TableCell>
                      <OnMarketDisplay onMarketDate={item.onMarket} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-x-3">
                        {item.additional_info?.map((info, index) => {
                          const Icon = labelToIconMap.get(info);
                          return Icon ? (
                            <Tooltip
                              color="primary"
                              content={info}
                              key={index}
                              showArrow={true}
                            >
                              <Icon size={16} className="text-gray-700" />
                            </Tooltip>
                          ) : null;
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {userType === 'realtor' && (
                        <div className="flex gap-[4px]">
                          {/* <div className="cursor-pointer w-[24px] h-[24px] bg-[#F9F9F9] rounded-full flex items-center justify-center">
                        <HeroImage
                          src={'/svgs/edit-icon.svg'}
                          alt="edit"
                          width={10}
                          height={10}
                        />
                      </div> */}
                          <div
                            className={`cursor-pointer w-[24px] h-[24px] bg-[#F9F9F9] rounded-full flex items-center justify-center ${isDeleting === item.comparable_id ? 'opacity-50' : ''}`}
                            onClick={() =>
                              !isDeleting &&
                              item.comparable_id &&
                              handleDelete(item.comparable_id)
                            }
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                !isDeleting &&
                                  item.comparable_id &&
                                  handleDelete(item.comparable_id);
                              }
                            }}
                            aria-disabled={!!isDeleting}
                            aria-label="Remove comparable"
                          >
                            {isDeleting === item.comparable_id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-700" />
                            ) : (
                              <HeroImage
                                src={'/svgs/remove.svg'}
                                alt="remove"
                                width={10}
                                height={10}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !linkOnlyComparable && (
              <p className="text-gray-500 text-sm">No comparables added yet.</p>
            )
          )}
        </CardBody>
      </Card>

      {userType === 'realtor' &&
        isValidNumericPropertyId &&
        numericPropertyId && (
          <AddComparableModal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onClose={onClose}
            onComparableAdded={handleComparableAddedSuccess}
            propertyId={numericPropertyId}
          />
        )}

      {isConfirmModalOpen && (
        <ConfirmationAlert
          title="Delete Comparable"
          subTitle="Are you sure you want to delete this comparable?"
          confirmBtnTitle="Delete"
          onConfirmBtnHandler={executeDeleteComparable}
          onDismissBtnHandler={closeConfirmModal}
        />
      )}
    </>
  );
}
