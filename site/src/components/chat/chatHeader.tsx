interface ChatHeaderProps {
  date: string;
}
const ChatHeader = ({ date }: ChatHeaderProps) => (
  <div className="w-full flex justify-center my-4">
    <div className="bg-[#F1F1F1]  px-4 py-1.5 rounded-full flex items-center justify-center">
      <span className="text-[12px] font-[400] text-[#A9A6B2]">{date}</span>
    </div>
  </div>
);

export default ChatHeader;
