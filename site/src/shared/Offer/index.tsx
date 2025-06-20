import React, { FunctionComponent } from 'react';

import ClockLoader from '@/assets/icons/clockLoader';

type Props = {
  amount: number;
  offer_type: 'user' | 'last';
  last_offer_date?: string;
};

const Offer: FunctionComponent<Props> = ({
  amount,
  offer_type,
  last_offer_date,
}: Props) => {
  const formattedDate =
    last_offer_date &&
    new Date(last_offer_date).toLocaleString('default', {
      month: 'long',
      day: 'numeric',
    });

  return (
    <span className="bg-[#FFFFFFB2] rounded-[115px] flex items-center justify-center p-[10px]">
      <label className="text-[8px] font-semibold text-[#5E5E61] uppercase">
        {' '}
        {offer_type == 'user' ? 'Offered' : 'Last offer'}
      </label>
      <label className="text-[10px] font-[700] text-[#2D2C31] ml-[5px]">
        {`$${numberWithCommas(amount)}`}
      </label>
      {offer_type == 'last' && (
        <div className=" flex gap-[5px] ml-[10px]">
          <ClockLoader />
          {last_offer_date && (
            <label className="text-[8px] font-semibold text-[#5E5E61] uppercase">
              {formattedDate}
            </label>
          )}
        </div>
      )}
    </span>
  );
};

const numberWithCommas = (x: number): string => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default Offer;
