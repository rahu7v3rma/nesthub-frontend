import moment from 'moment';
import React, { FunctionComponent } from 'react';

import ClockLoader from '@/assets/icons/clockLoader';

type Props = {
  deadlineDate: string | Date | undefined;
};

const OfferDeadlineBadge: FunctionComponent<Props> = ({
  deadlineDate,
}: Props) => {
  const formattedDate =
    deadlineDate && moment(deadlineDate).format('MMMM D').toUpperCase();

  return (
    <span className="bg-[#FFFFFFB2] rounded-[115px] flex items-center justify-center p-[10px]">
      <label className="text-[8px] font-semibold text-[#5E5E61] uppercase">
        OFFER DEADLINE
      </label>
      <div className="flex gap-[5px] ml-[5px] items-center">
        <ClockLoader />
        {deadlineDate && (
          <label className="text-[10px] font-[700] text-[#2D2C31]">
            {formattedDate}
          </label>
        )}
      </div>
    </span>
  );
};

export default OfferDeadlineBadge;
