import Image from 'next/image';
import { useEffect, useRef, useState, useMemo } from 'react';

import { ChatType } from '@/interfaces/chat';

import ChatHeader from './chatHeader';
import MessageBubble from './messageBubble';

interface ConversationProps {
  chats: ChatType;
  chatHeight?: number;
  isMobile?: boolean;
}
const Conversation = ({ chats, chatHeight, isMobile }: ConversationProps) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [prevChatLength, setPrevChatLength] = useState(chats.length);

  useEffect(() => {
    if (chats.length > prevChatLength && chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
    setPrevChatLength(chats.length);
  }, [chats, prevChatLength]);

  const dynamicStyle = useMemo(() => {
    if (isMobile) {
      return {
        maxHeight:
          chatHeight && chatHeight > 0 ? `${chatHeight * 0.5}px` : '42vh',
      };
    } else {
      return { height: '42vh' };
    }
  }, [isMobile, chatHeight]);

  console.log('Chat Message:   ', chats);
  return (
    <div
      ref={chatContainerRef}
      className={`flex mt-auto overflow-x-auto scroll-smooth flex-col space-y-2 ${chats.length === 0 && 'flex items-center justify-center'}`}
      style={dynamicStyle}
    >
      {chats.length === 0 ? (
        <div className="flex items-center justify-center flex-col">
          <Image src="/pngs/messages.png" alt="404" height={90} width={194} />
          <span className="text-[12px] text-[#C6C6C6] font-[400]">
            No messages yet
          </span>
        </div>
      ) : (
        (() => {
          const groupedMessages: { [date: string]: typeof chats } = {};
          chats.forEach((chat) => {
            const date = chat.date;
            if (!groupedMessages[date]) {
              groupedMessages[date] = [];
            }
            groupedMessages[date].push(chat);
          });

          return Object.entries(groupedMessages).map(([date, messages]) => (
            <div key={date} className="space-y-2">
              <ChatHeader date={date} />
              {messages.map((chat, index) => (
                <MessageBubble
                  key={`${date}-${index}`}
                  sender={chat.sender}
                  message={chat.message}
                  time={chat.time}
                  isReceiver={chat.isReceiver}
                />
              ))}
            </div>
          ));
        })()
      )}
    </div>
  );
};

export default Conversation;
