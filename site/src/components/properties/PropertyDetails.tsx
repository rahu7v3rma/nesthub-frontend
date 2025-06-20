'use client';

import {
  Card,
  CardBody,
  useDisclosure,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Checkbox,
} from '@heroui/react';
import moment from 'moment';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { BsChatTextFill } from 'react-icons/bs';
import { FaLocationDot } from 'react-icons/fa6';
import { toast } from 'react-toastify';

import { PropertyDetails as IPropertyDetails } from '@/interfaces/property';
import { updatePropertyRating, updatePropertyToured } from '@/services/api';
import LeafletMap from '@/shared/Map';
import { StarRating } from '@/shared/StarRating/StarRating';
import { formatPrice, formatQuantity } from '@/utils/format';

import Chat from '../chat';
import PropertyComparables from '../property/PropertyComparables';
import PropertyDisclosures from '../property/PropertyDisclosures';
import PropertyOffers from '../property/PropertyOffers';

import PropertyImagesSwiper from './PropertyImagesSwiper';

type PropertyDetailsProps = {
  property: IPropertyDetails;
  flag: React.Dispatch<React.SetStateAction<boolean>>;
  reloadPropertyDetails: () => void;
};

export default function PropertyDetails({
  property,
  flag,
  reloadPropertyDetails,
}: PropertyDetailsProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [displayRating, setDisplayRating] = useState(
    property.property_rating ? property.property_rating.toFixed(1) : '0',
  );
  const [savedRating, setSavedRating] = useState(
    property.property_rating ? property.property_rating.toFixed(1) : '0',
  );
  const [isClientUser, setIsClientUser] = useState(false);
  const [isRealEstateUser, setIsRealEstateUser] = useState(false);
  const [isToured, setIsToured] = useState<boolean>(
    property.is_property_toured,
  );
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const userType = localStorage.getItem('user_type');
    setIsRealEstateUser(userType === 'realtor');
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  useEffect(() => {
    const handleResize = () => {
      const newHeight = window.innerHeight;
      if (newHeight !== windowHeight) {
        setWindowHeight(newHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [windowHeight]);

  useEffect(() => {
    const userType = localStorage.getItem('user_type');
    if (userType === 'realtor') {
      setIsClientUser(true);
    }
  });

  const handleDisclosureSuccessfullyAdded = useCallback(() => {
    flag((prev) => !prev);
    console.log('PropertyDetails: Signalling PropertyPage to refetch data.');
  }, [flag]);

  const handleComparableSuccessfullyAdded = useCallback(() => {
    flag((prev) => !prev);
    console.log('PropertyDetails: Signalling PropertyPage to refetch data.');
  }, [flag]);

  if (!property) {
    return <div>Loading property information...</div>;
  }

  const formatRating = (rating: number): string => {
    if (rating === 0) return '0';
    return rating.toFixed(1);
  };

  const handleRatingChange = async (rating: number) => {
    const formattedRating = formatRating(rating);
    try {
      setSavedRating(formattedRating);
      setDisplayRating(formattedRating);
      const realtor_property_id = localStorage.getItem('realtor_property_id');
      const PropertyId = Number(realtor_property_id);
      await updatePropertyRating(PropertyId, rating);
      toast.success('Rating saved successfully');
      console.log('Rating saved successfully');
      reloadPropertyDetails();
    } catch (error) {
      console.error('Failed to save rating:', error);
      toast.error('Failed to save rating.');
      const fallbackRating = property.property_rating
        ? formatRating(property.property_rating)
        : '0';
      setSavedRating(fallbackRating);
      setDisplayRating(fallbackRating);
    }
  };

  const handleTouredChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;

    try {
      const realtor_property_id = localStorage.getItem('realtor_property_id');
      const PropertyId = Number(realtor_property_id);
      await updatePropertyToured(PropertyId, newValue);
      toast.success('Toured status saved successfully');
      setIsToured(newValue);
    } catch (error) {
      console.error('Failed to update toured status:', error);
      toast.error('Failed to update toured status.');
    }
  };

  const handleHoverChange = (rating: number) => {
    setDisplayRating(formatRating(rating));
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <Card className="p-4 rounded-none sm:rounded-3xl md:my-3">
          <CardBody>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full">
              <div className="lg:col-span-3">
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => router.back()}
                    className="flex items-center justify-center w-[30px] h-[30px] rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Image
                      src={'/svgs/back-btn.svg'}
                      width={20}
                      height={20}
                      alt="Back"
                    />
                  </button>
                  <p className="text-lg font-[600] text-[#2D2C31] flex items-center font-[Figtree]">
                    {property.address}
                    {property.city && `, ${property.city}`}
                  </p>
                </div>
                {property.photos_list && property.photos_list.length > 0 ? (
                  <PropertyImagesSwiper
                    images={property.photos_list}
                    isMobile={isMobile}
                  />
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                    <img
                      alt={property.address}
                      src={property.image}
                      className="rounded-3xl cursor-pointer"
                      style={{
                        height: '400px',
                        width: '100%',
                        maxWidth: '100%',
                      }}
                    />
                  </>
                )}
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 sm:gap-8 mt-4 sm:mt-8">
                  <div className="flex-shrink-0">
                    <p className="font-[700] text-[28px] text-[#2D2C31] font-[Almarai]">
                      {formatPrice(property.price)}
                    </p>
                    <div className="text-[13px] flex gap-4 mt-1 items-center text-[#5E5E61] font-[Almarai] font-[400]">
                      <div className="flex gap-2 items-center">
                        <Image
                          src="/svgs/bed.svg"
                          alt="Bed"
                          width={14}
                          height={11}
                        />
                        <span>{formatQuantity(property.bedsCount, 'bed')}</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Image
                          src="/svgs/bath.svg"
                          alt="Bath"
                          width={14}
                          height={11}
                        />
                        <span>
                          {formatQuantity(property.bathsCount, 'bath')}
                        </span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Image
                          src="/svgs/area.svg"
                          alt="Square Feet"
                          width={14}
                          height={11}
                        />
                        <span>{`${property.squareFeet} sq ft`}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    {property.offers && property.offers.length > 0 ? (
                      <Card className="sm:p-2 shadow-none border-1 bg-cardBg border-cardBorder flex-1">
                        <CardBody className="flex justify-center">
                          <h3 className="text-[16px] font-[700] text-[#2D2C31] font-[Figtree]">
                            Your Offer
                          </h3>
                          <p className="text-[10.5px] mt-2 text-[#5E5E61] font-[700] font-[Figtree]">
                            {formatPrice(
                              property.offers[property.offers.length - 1]
                                .amount,
                            )}
                          </p>
                        </CardBody>
                      </Card>
                    ) : property.deadline_datetime ? (
                      <Card className="sm:p-2 shadow-none border-1 bg-cardBg border-cardBorder flex-1">
                        <CardBody className="flex justify-center">
                          <h3 className="text-[16px] font-[700] text-[#2D2C31] font-[Figtree]">
                            Offer Deadline
                          </h3>
                          <p className="text-[10.5px] mt-2 text-[#5E5E61] font-[700] font-[Figtree]">
                            {moment(property.deadline_datetime).format(
                              'dddd, MMMM Do, h:mm A',
                            )}
                          </p>
                        </CardBody>
                      </Card>
                    ) : null}
                    <Card className="sm:p-2 shadow-none border-1 bg-cardBg border-cardBorder flex-1">
                      <CardBody className="flex justify-center">
                        <h3 className="text-[16px] font-[700] text-[#2D2C31] font-[Figtree]">
                          Open houses
                        </h3>
                        <p className="text-[10.5px] mt-2 text-[#5E5E61] font-[700] font-[Figtree]">
                          {moment(property.openHouseTime)
                            .format('dddd, MMMM D, YYYY - hh:mm A')
                            .toUpperCase()}
                        </p>
                      </CardBody>
                    </Card>
                  </div>
                </div>
                <Card className="p-1 mt-[8px] shadow-none border-1 bg-cardBg border-cardBorder">
                  <CardBody>
                    <div className="flex justify-between">
                      {(property.note || property.additional_information) && (
                        <h3 className="text-[16px] font-[700] text-[#2D2C31] font-[Figtree] py-2">
                          Additional information
                        </h3>
                      )}
                      <div className="flex justify-between ml-auto">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-semibold text-[#2D2C31]">
                            {displayRating}
                          </span>
                          <StarRating
                            initialRating={parseFloat(savedRating)}
                            onRatingChange={handleRatingChange}
                            onHoverChange={handleHoverChange}
                            size="sm"
                            readOnly={isClientUser}
                          />
                        </div>
                      </div>
                    </div>
                    {(property.note || property.additional_information) && (
                      <p className="text-[13px] mt-[15px] text-[#5E5E61] font-[Almarai]">
                        {property.note || property.additional_information}
                      </p>
                    )}
                    <div className="mt-3">
                      <Checkbox
                        className={`my-1 ${isRealEstateUser ? 'pointer-events-none' : ''}`}
                        isSelected={isToured}
                        onChange={
                          !isRealEstateUser ? handleTouredChange : undefined
                        }
                      >
                        <span
                          className={`font-normal text-[13px] ${isRealEstateUser ? 'text-gray-500' : 'text-inherit'}`}
                        >
                          Property was toured
                        </span>
                      </Checkbox>
                    </div>
                  </CardBody>
                </Card>
              </div>
              <div className="lg:col-span-2 mt-2 sm:mt-0 h-fit">
                <p className="text-[13.5px] font-[600] text-[#2D2C31] flex items-center font-[Figtree]">
                  <FaLocationDot className="mr-1" />
                  {property.address}
                  {property.city && `, ${property.city}`}
                  {property.state_or_province &&
                    `, ${property.state_or_province}`}
                </p>
                <div className="mt-2 mb-2">
                  <LeafletMap
                    latitude={property.latitude}
                    longitude={property.longitude}
                    zoom={12}
                    height="300px"
                  />
                </div>

                {/* Regular chat (desktop) */}
                {!isMobile && (
                  <>
                    <div className="flex items-center justify-between mb-[12px] mt-[36px]">
                      <h2 className="text-[16px] text-[#2D2C31] font-[700] sm:ml-[20px]">
                        Chat with {isRealEstateUser ? 'client' : 'realtor'}
                      </h2>
                    </div>
                    <Chat />
                  </>
                )}

                {/* Chat modal (mobile) */}
                {isMobile && (
                  <Modal
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                    className="h-[70vh]"
                    style={{ minHeight: '400px' }}
                  >
                    <ModalContent>
                      {(onClose) => (
                        <>
                          <ModalHeader className="flex justify-between items-center pt-10 px-8">
                            <h2 className="text-[16px] text-[#2D2C31] font-[700] sm:ml-[20px]">
                              Chat with{' '}
                              {isRealEstateUser ? 'client' : 'realtor'}
                            </h2>
                          </ModalHeader>
                          <ModalBody className="p-2">
                            <Chat
                              windowHeight={windowHeight}
                              isMobile={isMobile}
                            />
                          </ModalBody>
                        </>
                      )}
                    </ModalContent>
                  </Modal>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        <PropertyOffers
          propertyId={property.id}
          offers={property.offers!}
          offerChartDetails={property.offerGraph}
          reloadPropertyDetails={reloadPropertyDetails}
        />
        <PropertyDisclosures
          disclosures={property.disclosure || []}
          onDisclosureAdded={handleDisclosureSuccessfullyAdded}
        />
        <PropertyComparables
          comparables={property.comparables || []}
          onComparableAdded={handleComparableSuccessfullyAdded}
        />
      </div>
      {isMobile && (
        <button
          onClick={onOpen}
          className="bg-white text-black p-3 rounded-full shadow hover:shadow-md transition fixed bottom-[5%] right-[5%] "
        >
          <BsChatTextFill size={30} />
        </button>
      )}
    </>
  );
}
