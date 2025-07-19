import Image from 'next/image';
import React, { ChangeEvent, FunctionComponent, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  value: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  name: string;
  checkedColor?: string;
  rounded?: string;
};

const Checkbox: FunctionComponent<Props> = ({
  children,
  value,
  onChange,
  name,
  checkedColor = '#ED6943',
  rounded = 'rounded-full',
}: Props) => {
  return (
    <label className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={value}
        onChange={onChange}
        name={name}
        className="hidden"
      />
      <div
        className={`w-5 h-5 flex items-center justify-center transition-colors ${rounded}`}
        style={{
          backgroundColor: value ? checkedColor : '#E5E5E5',
        }}
      >
        {value && (
          <Image
            src="/svgs/tick-white.svg"
            width={13}
            height={10}
            alt="White Tick"
          />
        )}
      </div>
      <span className="ml-2 flex items-center">{children}</span>
    </label>
  );
};

export default Checkbox;
