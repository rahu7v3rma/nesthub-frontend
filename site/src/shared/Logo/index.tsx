import Image from 'next/image';
import React, { FunctionComponent } from 'react';

type Props = {
  width?: number;
  height?: number;
  className?: string;
};

const Logo: FunctionComponent<Props> = ({
  width = 225,
  height = 225,
  className,
}: Props) => {
  return (
    <Image
      className={className}
      src="/pngs/logo.png"
      alt="Logo"
      width={width}
      height={height}
    />
  );
};

export default Logo;
