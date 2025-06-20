import { Tooltip } from '@heroui/react';
import Image from 'next/image';
import { FC } from 'react';

interface InfoIconProps {
  tooltipText: string;
  onClick?: () => void;
}

const InfoIcon: FC<InfoIconProps> = ({ tooltipText, onClick }) => {
  return (
    <div
      className={onClick ? 'cursor-pointer' : ''}
      onClick={onClick}
      role="button"
      tabIndex={onClick ? 0 : -1}
    >
      <Tooltip
        content={tooltipText}
        placement="top"
        showArrow={true}
        classNames={{
          base: 'bg-white text-spanish_gray shadow-2xl rounded-xl p-4',
          content: 'text-[12px] max-w-[200px]',
        }}
      >
        <Image
          src="/svgs/info-icon.svg"
          width={18}
          height={18}
          className="text-liberty"
          alt="Info icon"
          aria-hidden="true"
        />
      </Tooltip>
    </div>
  );
};

export default InfoIcon;
