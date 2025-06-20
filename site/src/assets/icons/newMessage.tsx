import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const NewMessage: React.FC<IconProps> = (props) => (
  <button className="h-[30px] w-[30px] rounded-[115px] bg-[#FFFFFFE5] flex items-center justify-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      {...props}
    >
      <path
        d="M1.33301 16.6663V4.66634C1.33301 4.29967 1.46367 3.9859 1.72501 3.72501C1.98634 3.46412 2.30012 3.33345 2.66634 3.33301H13.333C13.6997 3.33301 14.0137 3.46367 14.275 3.72501C14.5363 3.98634 14.6668 4.30012 14.6663 4.66634V12.6663C14.6663 13.033 14.5359 13.347 14.275 13.6083C14.0141 13.8697 13.7001 14.0001 13.333 13.9997H3.99967L1.33301 16.6663ZM3.99967 11.333H9.33301V9.99967H3.99967V11.333ZM3.99967 9.33301H11.9997V7.99967H3.99967V9.33301ZM3.99967 7.33301H11.9997V5.99967H3.99967V7.33301Z"
        fill="#2D2C31"
      />
      <circle cx={15.5} cy={2.5} r={2.5} fill="#DF6161" />
    </svg>
  </button>
);

export default NewMessage;
