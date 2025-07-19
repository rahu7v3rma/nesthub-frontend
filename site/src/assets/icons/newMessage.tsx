import React from 'react';
import { BiSolidMessageSquareDetail } from 'react-icons/bi';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const NewMessage: React.FC<IconProps> = (props) => (
  <button className="h-[30px] w-[30px] rounded-3xl text-gray-800 bg-[#F6F6F6] flex items-center justify-center">
    <BiSolidMessageSquareDetail />
  </button>
);

export default NewMessage;
