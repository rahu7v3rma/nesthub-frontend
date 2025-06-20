'use client';

import {
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import moment from 'moment';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { IoIosClose } from 'react-icons/io';
import { toast } from 'react-toastify';

import { PropertyOffer, PropertyOfferGraph } from '@/interfaces/property';
import { deleteOffer } from '@/services/api';
import ConfirmationAlert from '@/shared/ConfirmationAlert';
import { formatPrice } from '@/utils/format';

import AddOfferModal from '../properties/AddOfferModal';

type PropertyOffersProps = {
  propertyId: string;
  offers: PropertyOffer[];
  offerChartDetails: PropertyOfferGraph;
  reloadPropertyDetails: () => void;
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
  const [isRealEstateUser, setIsRealEstateUser] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [offersGraphData, setOffersGraphData] = useState<
    {
      offer: number;
      width: number;
    }[]
  >([]);
  const [isMobile, setIsMobile] = useState(false);

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
    setIsMobile(window.innerWidth < 768);
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
      const PropertyId = Number(propertyId);
      await deleteOffer(PropertyId, offerToDelete);
      toast.success('Offer deleted successfully');
      reloadPropertyDetails();
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

  const DeleteConfirmationModal = () => (
    <ConfirmationAlert
      title="Delete offer"
      subTitle="Are you sure you want to delete this offer?"
      confirmBtnTitle="DELETE"
      onDismissBtnHandler={closeConfirmModal}
      onConfirmBtnHandler={executeDeleteOffer}
    />
  );

  return (
    <Card className="p-[35px_28px]">
      <div className="flex gap-6 p-3 sm:gap-2 w-full h-full flex-col sm:flex-row">
        <div>
          <div className="flex gap-[10px]">
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
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 max-h-[250px] overflow-auto">
          <Table
            aria-label="offers table"
            classNames={{
              base: 'w-full',
              wrapper: 'p-0 shadow-none',
              th: 'font-[Almarai] bg-transparent text-[12px] font-[400] text-[#A8A6B0] border-b-[1px] border-b-[#F6F6F6]',
              td: 'font-[Almarai] py-[20px]  border-b-[1px] border-b-[#F6F6F6] text-[#5E5E61] text-[12px] min-w-[90px]',
            }}
          >
            <TableHeader className="">
              <TableColumn>Date</TableColumn>
              <TableColumn>Amount</TableColumn>
              <TableColumn>Offers</TableColumn>
              <TableColumn> </TableColumn>
            </TableHeader>
            <TableBody>
              {offers.map((offer, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {moment(offer.date).format('MMMM DD, h:mm a')}
                  </TableCell>
                  <TableCell>{formatPrice(offer.amount)}</TableCell>
                  <TableCell className="max-w-48">{offer.offer}</TableCell>
                  {isRealEstateUser ? (
                    <TableCell className="max-w-48">
                      <button
                        onClick={() => offer.id && handleDelete(offer.id)}
                        className="p-1 hover:bg-[#F0F0F0] rounded-full transition-colors"
                        aria-label="Delete offer"
                      >
                        <IoIosClose
                          size={18}
                          className="bg-[#F9F9F9] rounded-full"
                        />
                      </button>
                    </TableCell>
                  ) : (
                    <TableCell className="hidden"> </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="lg:col-span-6 max-h-[250px]">
          <div className="border border-[#F6F6F6] bg-[#FDFDFD] w-full rounded-[12px] h-[250px] p-4 sm:p-[24px]">
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

      <AddOfferModal
        isOpen={addOfferModalOpen}
        onOpenChange={onAddOfferModalOpenChange}
        onClose={() => setAddOfferModalOpen(false)}
      />
      {isConfirmModalOpen && <DeleteConfirmationModal />}
    </Card>
  );
}
