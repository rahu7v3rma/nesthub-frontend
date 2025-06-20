interface MessageBubbleProps {
  message: string;
  isReceiver: boolean;
  sender: string;
  time: string;
}

const MessageBubble = ({
  message,
  sender,
  time,
  isReceiver,
}: MessageBubbleProps) => {
  const isLeft = isReceiver;

  return (
    <div
      className={`flex ${isLeft ? 'justify-start' : 'justify-end'} !mb-[22px]`}
    >
      <div
        className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'} gap-[10px]`}
      >
        <p className="text-[10.5px] font-[700] uppercase text-[#2D2C31]">
          {sender}
        </p>

        <div
          className={`flex items-center gap-2 ${isLeft ? '' : 'flex-row-reverse'}`}
        >
          <div
            className={`max-w-[264px] min-h-[63px] h-full flex items-center ${isLeft ? 'justify-start' : 'justify-end'} p-4 gap-[12px] ${isLeft ? 'rounded-tr-[16px]' : 'rounded-tl-[16px]'} rounded-br-[16px] rounded-bl-[16px] ${isLeft ? 'bg-[#F1F1F1]' : 'bg-white'}`}
          >
            <span className="text-[13px] font-[400] text-[#5E5E61]">
              {message}
            </span>
          </div>

          <span className="text-[12px] text-[#A9A6B2] font-[400]">{time}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
