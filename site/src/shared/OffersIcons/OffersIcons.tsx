import React from 'react';
import { IconType } from 'react-icons';
import { BsFillCreditCardFill, BsClockFill } from 'react-icons/bs';
import { IoIosListBox, IoIosCheckmark } from 'react-icons/io';
import { MdSignalCellularAlt, MdSearch } from 'react-icons/md';

export interface AdditionalInfoItem {
  id: string;
  label: string;
  Icon: IconType | React.FC<{ size?: number }>;
}

export const LoanIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <div className="relative flex" style={{ width: size, height: size }}>
    <BsFillCreditCardFill
      className="text-black m-auto"
      style={{ fontSize: size * 0.55 }}
    />
    <BsClockFill
      className="absolute"
      style={{
        top: size * 0.5,
        right: size * 0.17,
        fontSize: size * 0.25,
        background: '#F6F6F6',
        borderRadius: '50%',
      }}
    />
  </div>
);

export const AppraisalIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <div className="relative flex" style={{ width: size, height: size }}>
    <MdSignalCellularAlt
      className="transform -scale-x-100 text-black m-auto"
      style={{ fontSize: size * 0.55 }}
    />
    <MdSearch
      className="absolute"
      style={{
        top: size * 0.2,
        right: size * 0.23,
        fontSize: size * 0.32,
        background: '#F6F6F6',
        borderRadius: '50%',
      }}
    />
  </div>
);

export const InspectionIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <div className="relative flex" style={{ width: size, height: size }}>
    <IoIosListBox
      className="text-black m-auto"
      style={{ fontSize: size * 0.55 }}
    />
    <IoIosCheckmark
      className="absolute"
      style={{
        top: size * 0.5,
        right: size * 0.17,
        fontSize: size * 0.25,
        background: '#F6F6F6',
        borderRadius: '50%',
      }}
    />
  </div>
);

export const additionalInfoOptions: AdditionalInfoItem[] = [
  { id: 'loan', label: 'Loan', Icon: LoanIcon },
  { id: 'appraisal', label: 'Appraisal', Icon: AppraisalIcon },
  { id: 'inspection', label: 'Inspection', Icon: InspectionIcon },
];

export const getContingencyIconById = (id: string) => {
  const found = additionalInfoOptions.find((item) => item.id === id);
  return found ? found.Icon : null;
};

export const getContingencyIconByLabel = (label: string) => {
  const found = additionalInfoOptions.find((item) => item.label === label);
  return found ? found.Icon : null;
};
