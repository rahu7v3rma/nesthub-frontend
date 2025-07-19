'use client';

import { Card, Tooltip } from '@heroui/react';
import moment from 'moment';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import useDeviceType from '@/hooks/useDeviceType';
import { PropertyOffer, PropertyOfferGraph } from '@/interfaces/property';
import { deleteOffer, updatePropertyOffer } from '@/services/api';
import ConfirmationAlert from '@/shared/ConfirmationAlert';
import {
  getContingencyIconById,
  getContingencyIconByLabel,
  additionalInfoOptions,
} from '@/shared/OffersIcons/OffersIcons';
import { formatPrice } from '@/utils/format';

import AddOfferModal from '../properties/AddOfferModal';
import OfferOptionsDropdown from '../properties/OfferOptionsDropdown';

type PropertyOffersProps = {
  propertyId: string;
  offers: PropertyOffer[];
  offerChartDetails: PropertyOfferGraph;
  reloadPropertyDetails: (signal?: AbortSignal, loading?: boolean) => void;
};

export default function PropertyOffers({
  propertyId,
  offers,
  offerChartDetails,
  reloadPropertyDetails,
}: PropertyOffersProps) {
  const [addOfferModalOpen, setAddOfferModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<number | null>(null);
  const [isAcceptConfirmModalOpen, setIsAcceptConfirmModalOpen] =
    useState(false);
  const [offerToAccept, setOfferToAccept] = useState<number | null>(null);
  const [isRejectConfirmModalOpen, setIsRejectConfirmModalOpen] =
    useState(false);
  const [offerToReject, setOfferToReject] = useState<number | null>(null);
  const [isRealEstateUser, setIsRealEstateUser] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isUpdatingOffer, setIsUpdatingOffer] = useState<boolean>(false);
  const [offersGraphData, setOffersGraphData] = useState<
    {
      offer: number;
      width: number;
    }[]
  >([]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null,
  );
  const { isMobile } = useDeviceType();
  const router = useRouter();

  useEffect(() => {
    const firstOfferWidth =
      ((offerChartDetails.firstOffer - offerChartDetails.askedPrice) /
        (offerChartDetails.closingOffer - offerChartDetails.askedPrice)) *
      100;
    const secondOfferWidth =
      ((offerChartDetails.secondOffer - offerChartDetails.askedPrice) /
        (offerChartDetails.closingOffer - offerChartDetails.askedPrice)) *
      100;
    setOffersGraphData([
      { offer: offerChartDetails.firstOffer, width: firstOfferWidth },
      { offer: offerChartDetails.secondOffer, width: secondOfferWidth },
    ]);
  }, [offerChartDetails]);

  useEffect(() => {
    const userType = localStorage.getItem('user_type');
    setIsRealEstateUser(userType === 'realtor');
  }, []);

  const onAddOfferModalOpenChange = () => {
    setAddOfferModalOpen(false);
    reloadPropertyDetails();
  };

  const handleDelete = (offerId: number) => {
    setOfferToDelete(offerId);
    setIsConfirmModalOpen(true);
  };

  const executeDeleteOffer = async () => {
    if (offerToDelete === null) return;

    setIsDeleting(offerToDelete);
    setIsConfirmModalOpen(false);

    try {
      await deleteOffer(offerToDelete);
      toast.success('Offer deleted successfully');
      reloadPropertyDetails(undefined, false);
    } catch (error: any) {
      console.error('Failed to delete offer:', error);
      toast.error(error?.message || 'Failed to delete offer.');
    } finally {
      setIsDeleting(null);
      setOfferToDelete(null);
    }
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setOfferToDelete(null);
  };

  const handleAcceptOffer = (offerId: number) => {
    setOfferToAccept(offerId);
    setIsAcceptConfirmModalOpen(true);
  };

  const executeAcceptOffer = async () => {
    if (offerToAccept === null) return;

    setIsUpdatingOffer(true);
    setIsAcceptConfirmModalOpen(false);
    setOpenDropdownIndex(null);

    try {
      await updatePropertyOffer(offerToAccept, { offer_status: 'accepted' });
      toast.success('Offer accepted successfully');
      reloadPropertyDetails(undefined, false);
    } catch (error: any) {
      console.error('Failed to accept offer:', error);
      toast.error(error?.message || 'Failed to accept offer.');
    } finally {
      setIsUpdatingOffer(false);
      setOfferToAccept(null);
    }
  };

  const closeAcceptConfirmModal = () => {
    setIsAcceptConfirmModalOpen(false);
    setOfferToAccept(null);
  };

  const handleRejectOffer = (offerId: number) => {
    setOfferToReject(offerId);
    setIsRejectConfirmModalOpen(true);
  };

  const executeRejectOffer = async () => {
    if (offerToReject === null) return;

    setIsUpdatingOffer(true);
    setIsRejectConfirmModalOpen(false);
    setOpenDropdownIndex(null);

    try {
      await updatePropertyOffer(offerToReject, { offer_status: 'rejected' });
      toast.success('Offer rejected successfully');
      reloadPropertyDetails(undefined, false);
    } catch (error: any) {
      console.error('Failed to reject offer:', error);
      toast.error(error?.message || 'Failed to reject offer.');
    } finally {
      setIsUpdatingOffer(false);
      setOfferToReject(null);
    }
  };

  const closeRejectConfirmModal = () => {
    setIsRejectConfirmModalOpen(false);
    setOfferToReject(null);
  };

  const toggleDropdown = (
    index: number,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    if (openDropdownIndex === index) {
      setOpenDropdownIndex(null);
    } else {
      setOpenDropdownIndex(index);
    }
  };

  const DeleteConfirmationModal = () => (
    <ConfirmationAlert
      title="Delete offer"
      subTitle="Are you sure you want to delete this offer?"
      confirmBtnTitle="DELETE"
      onDismissBtnHandler={closeConfirmModal}
      onConfirmBtnHandler={executeDeleteOffer}
    />
  );

  const AcceptConfirmationModal = () => (
    <ConfirmationAlert
      title="Accept offer"
      subTitle="Are you sure you want to accept this offer?"
      confirmBtnTitle="ACCEPT"
      onDismissBtnHandler={closeAcceptConfirmModal}
      onConfirmBtnHandler={executeAcceptOffer}
    />
  );

  const RejectConfirmationModal = () => (
    <ConfirmationAlert
      title="Reject offer"
      subTitle="Are you sure you want to reject this offer?"
      confirmBtnTitle="REJECT"
      onDismissBtnHandler={closeRejectConfirmModal}
      onConfirmBtnHandler={executeRejectOffer}
    />
  );

  return (
    <Card
      className={`${offers && offers.length <= 0 ? 'py-[0]' : 'py-[35px]'} px-[28px]`}
    >
      <div className="flex gap-6 p-3 sm:gap-2 w-full h-full flex-col sm:flex-row">
        <div
          className={`flex gap-[10px] items-center ${offers.length <= 0 ? 'w-full justify-between' : ''}`}
        >
          <h2 className="text-[#2D2C31] font-[700] text-[18px] font-[Figtree]">
            Offers
          </h2>
          {localStorage.getItem('user_type') === 'realtor' && (
            <Image
              src="/svgs/add.svg"
              alt="Add"
              width={24}
              height={24}
              className="cursor-pointer"
              onClick={() => setAddOfferModalOpen(true)}
            />
          )}
        </div>
      </div>
      {offers && offers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 max-h-[250px]">
            <div
              aria-label="offers table"
              className="w-full p-0 shadow-none overflow-scroll"
            >
              <div className="flex w-full">
                <span className="w-[25%] font-[Almarai] bg-transparent text-[12px] font-[400] text-[#A8A6B0] border-b-[1px] border-b-[#F6F6F6]">
                  Date
                </span>
                <span className="w-[25%] font-[Almarai] bg-transparent text-[12px] font-[400] text-[#A8A6B0] border-b-[1px] border-b-[#F6F6F6]">
                  Amount
                </span>
                <span className="w-[25%] font-[Almarai] bg-transparent text-[12px] font-[400] text-[#A8A6B0] border-b-[1px] border-b-[#F6F6F6]">
                  Contingencies
                </span>
                <span className="w-[20%] font-[Almarai] bg-transparent text-[12px] font-[400] text-[#A8A6B0] border-b-[1px] border-b-[#F6F6F6]">
                  Actions
                </span>
              </div>
              <div className="w-full h-[1000px] overflow-scroll">
                {offers.map((offer, index) => (
                  <div key={index} className="w-full flex h-[50px]">
                    <span className="w-[25%] h-[50px] font-[Almarai] py-[20px] border-b-[1px] border-b-[#F6F6F6] text-[#5E5E61] text-[12px] min-w-[90px]">
                      {moment(offer.date).format('MMMM DD, h:mm a')}
                    </span>
                    <span className="w-[25%] h-[50px] font-[Almarai] py-[20px]  border-b-[1px] border-b-[#F6F6F6] text-[12px] min-w-[90px] text-gray-800 font-black">
                      {formatPrice(offer.amount)}
                    </span>
                    <span className="w-[25%] h-[50px] font-[Almarai] py-[20px]  border-b-[1px] border-b-[#F6F6F6] text-[#5E5E61] text-[12px] min-w-[90px] max-w-48">
                      {Array.isArray(offer.contingencies_info) &&
                      offer.contingencies_info.length > 0 ? (
                        <div className="flex gap-2">
                          {offer.contingencies_info.map((cont, idx) => {
                            const option = additionalInfoOptions.find(
                              (item) => item.id === cont || item.label === cont,
                            );
                            const Icon =
                              getContingencyIconById(cont) ||
                              getContingencyIconByLabel(cont);
                            return Icon ? (
                              <Tooltip
                                color="primary"
                                content={option ? option.label : cont}
                                showArrow={true}
                                key={cont + idx}
                              >
                                <span style={{ display: 'inline-flex' }}>
                                  <Icon size={24} />
                                </span>
                              </Tooltip>
                            ) : null;
                          })}
                        </div>
                      ) : typeof offer.contingencies_info === 'string' &&
                        offer.contingencies_info ? (
                        (() => {
                          const Icon =
                            getContingencyIconById(offer.contingencies_info) ||
                            getContingencyIconByLabel(offer.contingencies_info);
                          return Icon ? <Icon /> : offer.contingencies_info;
                        })()
                      ) : (
                        '-'
                      )}
                    </span>
                    {isRealEstateUser ? (
                      <span className="w-[25%] h-[50px] font-[Almarai] py-[20px]  border-b-[1px] border-b-[#F6F6F6] text-[#5E5E61] text-[12px] min-w-[90px] max-w-48 relative">
                        <button
                          className="w-6 h-6 flex items-center justify-center bg-[#F9F9F9] hover:bg-[#F1F1F1] rounded-[115.38px] relative"
                          onClick={(e) => toggleDropdown(index, e)}
                        >
                          <span className="flex items-center justify-center bold text-xl relative -top-[6px]">
                            ...
                          </span>
                        </button>

                        {openDropdownIndex === index && (
                          <div className="absolute top-11 right-3 w-max z-[100]">
                            <OfferOptionsDropdown
                              offerId={offer.id}
                              onDelete={handleDelete}
                              onClose={() => {
                                setOpenDropdownIndex(null);
                              }}
                              onAcceptOffer={handleAcceptOffer}
                              onRejectOffer={handleRejectOffer}
                              isUpdatingOffer={isUpdatingOffer}
                            />
                          </div>
                        )}
                      </span>
                    ) : (
                      <span className="w-[25%] h-[50px] hidden"> </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 max-h-[250px]">
            <div
              className="border border-[#F6F6F6] bg-[#FDFDFD] w-full rounded-[12px] h-[250px] p-4 sm:p-[24px] cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => router.push(`/properties/${propertyId}/bar-chart`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ')
                  router.push(`/properties/${propertyId}/bar-chart`);
              }}
              aria-label="View offers vs closing price chart"
            >
              <h2 className="text-[#2D2C31] font-[700] text-[16px] font-[Figtree]">
                Pricing chart
              </h2>
              <div className="relative h-[100px] flex justify-center items-center px-2 mt-[30px]">
                <div className="relative w-full h-[1px] bg-[#F1F1F1] flex justify-center">
                  <div className="relative w-[90%] h-[1px]">
                    {
                      // offersGraphData.map((offer, index) => (
                      //   <div key={`offer_${index}`}>
                      //     <div
                      //       key={`main_offer_${index}`}
                      //       className={`absolute -top-[27px] sm:-top-[31px] gap-2 flex justify-end`}
                      //       style={{
                      //         width: `${offer.width}%`,
                      //       }}
                      //     >
                      //       <div className="flex flex-col justify-between items-center w-max gap-2 relative -right-[35px]">
                      //         <span className="w-max text-[11px] sm:text-[13.5px] font-[Figtree] font-[600] text-[#2D2C31] relative -top-[20px] sm:-top-0">
                      //           {formatPrice(offer.offer)}
                      //         </span>
                      //         {isMobile && (
                      //           <div className="h-full border-[0.5px] border-[#2D2C31] absolute border-dashed" />
                      //         )}
                      //         <span className="w-[6px] h-[6px] rounded-full bg-black" />
                      //         <span className="w-max text-[11px] sm:text-[12px] text-[#A8A6B0] font-[Almarai] relative -bottom-[20px] sm:-top-0">
                      //           {['First', 'Second'][index]} offer
                      //         </span>
                      //       </div>
                      //     </div>
                      //     {index == offersGraphData.length - 1 && (
                      //       <div
                      //         key={`offer_${index}`}
                      //         className={`h-[1px] bg-black`}
                      //         style={{
                      //           width: `${offer.width}%`,
                      //         }}
                      //       />
                      //     )}
                      //   </div>
                      // ))
                    }
                    <div
                      className={`absolute flex flex-col justify-between items-center w-max -top-[27px] sm:-top-[31px] gap-2 ${
                        offers?.length > 0 &&
                        offers[offers.length - 1]?.amount <
                          offerChartDetails.askedPrice
                          ? '-right-[8%]'
                          : '-left-[7%]'
                      }`}
                    >
                      <span className="text-[11px] sm:text-[13.5px] font-[Figtree] font-[600] text-[#2D2C31]">
                        {formatPrice(offerChartDetails.askedPrice)}
                      </span>
                      <span className="w-[6px] h-[6px] rounded-full bg-black" />
                      <span className="text-[11px] sm:text-[12px] text-[#A8A6B0] font-[Almarai]">
                        Asked price
                      </span>
                    </div>

                    {offers?.length > 0 && (
                      <div
                        className={`absolute flex flex-col justify-between items-center w-max -top-[27px] sm:-top-[31px] gap-2 ${
                          offers[offers.length - 1]?.amount <
                          offerChartDetails.askedPrice
                            ? '-left-[7%]'
                            : '-right-[8%]'
                        }`}
                      >
                        <span className="text-[11px] sm:text-[13.5px] font-[Figtree] font-[600] text-[#A8A6B0]">
                          {formatPrice(offers[offers.length - 1]?.amount)}
                        </span>
                        <span className="w-[6px] h-[6px] rounded-full bg-[#A8A6B0]" />
                        <span className="text-[11px] sm:text-[12px] text-[#A8A6B0] font-[Almarai]">
                          Latest Offer
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="lg:col-span-2 max-h-[250px]">
          <div className="flex flex-col flex-1 gap-2 h-full">
            <div className="gap-4 p-[15px] border border-[#F6F6F6] bg-[#FDFDFD] flex justify-center items-center flex-1 rounded-[12px]">
              <div className="sm:w-[20%]">
                <div className="w-[36px] h-[36px] bg-[#FFF0F0] rounded-full flex items-center justify-center">
                  <Image
                    src="/svgs/higher.svg"
                    alt="Higher"
                    width={16}
                    height={14}
                  />
                </div>
              </div>
              <span className="w-[80%] text-[13px] text-[#2D2C31] font-[Almarai]">
                Closing price <span className="font-[700]">31% higher</span>{' '}
                asking
              </span>
            </div>
            <div className="gap-4 p-[15px] border border-[#F6F6F6] bg-[#FDFDFD] flex justify-center items-center flex-1 rounded-[12px]">
              <div className="sm:w-[20%]">
                <div className="w-[36px] h-[36px] bg-[#EEF8F5] rounded-full flex items-center justify-center">
                  <Image
                    src="/svgs/lower.svg"
                    alt="Lower"
                    width={16}
                    height={14}
                  />
                </div>
              </div>
              <span className="w-[80%] text-[13px] text-[#2D2C31] font-[Almarai]">
                Your offer is <span className="font-[700]">14% lower</span> than
                the closing price
              </span>
            </div>
          </div>
        </div> */}
        </div>
      )}

      <AddOfferModal
        isOpen={addOfferModalOpen}
        onOpenChange={onAddOfferModalOpenChange}
        onClose={() => setAddOfferModalOpen(false)}
      />
      {isConfirmModalOpen && <DeleteConfirmationModal />}
      {isAcceptConfirmModalOpen && <AcceptConfirmationModal />}
      {isRejectConfirmModalOpen && <RejectConfirmationModal />}
    </Card>
  );
}
