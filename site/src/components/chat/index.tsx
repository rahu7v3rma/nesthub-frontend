'use client';

import moment from 'moment';
import { useParams } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useUser } from '@/hooks/useUser';
import {
  sendChatMessage,
  getChatMessages,
  getPollNewMessages,
} from '@/services/api';

import ChatInput from './chatInput';
import Conversation from './conversation';
import SearchBar from './searchbar';

type Chat = {
  id: number;
  message: string;
  time: string;
  date: string;
  sender: string;
  isReceiver: boolean;
};

type Height = {
  windowHeight?: number;
  isMobile?: boolean;
};

const Chat = ({ windowHeight, isMobile }: Height) => {
  const { user } = useUser();
  const params = useParams();
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const [chatHeight, setChatHeight] = useState<number>(0);
  const [loggedInUser, setLoggedInUser] = useState(user);

  const { id: property_id } = params || {};

  let realtor_property_id = localStorage.getItem('realtor_property_id');
  realtor_property_id = realtor_property_id
    ? JSON.parse(realtor_property_id)
    : '';

  useEffect(() => {
    if (isMobile && chatRef.current) {
      const height = chatRef.current.getBoundingClientRect().height;
      setChatHeight(height);
    }
  }, [chats, windowHeight, isMobile]);

  const fetchChats = useCallback(
    (signal?: AbortSignal) => {
      getChatMessages({
        realtor_property_id: realtor_property_id as string,
        property_id: property_id as string,
      })
        .then((response) => {
          const mappedMessages =
            response?.messages?.map((msg: any) => {
              const { id, message, timestamp, user } = msg || {};

              return {
                id,
                message,
                time: moment(timestamp).format('HH:mm'),
                date: moment(timestamp).format('MMM D, YYYY'),
                sender: user?.name || '',
                isReceiver: user?.id !== loggedInUser?.id,
              };
            }) || [];

          setChats(mappedMessages);
        })
        .catch((err) => {
          if (signal?.aborted) console.log('Fetch aborted');
          else console.error('Error fetching chats:', err);
        });
    },
    [realtor_property_id, property_id, loggedInUser?.id],
  );

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    fetchChats(signal);

    return () => {
      controller.abort();
    };
  }, [fetchChats]);

  const lastMessageId = chats.length > 0 ? chats[chats.length - 1].id : 0;

  const lastMessageIdRef = useRef(lastMessageId);

  useEffect(() => {
    lastMessageIdRef.current = lastMessageId;
  }, [lastMessageId]);

  useEffect(() => {
    const interval = setInterval(() => {
      getPollNewMessages({
        realtor_property_id: realtor_property_id as string,
        property_id: property_id as string,
        last_message_id: lastMessageIdRef.current,
      }).then((response) => {
        const mappedMessages =
          response?.messages?.map((msg: any) => {
            const { id, message, timestamp, user } = msg || {};

            return {
              id,
              message,
              time: moment(timestamp).format('HH:mm'),
              date: moment(timestamp).format('MMM D, YYYY'),
              sender: user?.name || '',
              isReceiver: user?.id !== loggedInUser?.id,
            };
          }) || [];

        if (mappedMessages.length > 0) {
          setChats((prev) => {
            const existingIds = new Set(prev.map((chat) => chat.id));
            const newMessages = mappedMessages.filter(
              (msg: any) => !existingIds.has(msg.id),
            );
            return newMessages.length > 0 ? [...prev, ...newMessages] : prev;
          });
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  });

  const sendMessage = (message: string) => {
    sendChatMessage({
      realtor_property_id: realtor_property_id as string,
      message,
    }).then((res) => {
      // setChats(chats => {
      //   return [
      //     ...chats,
      //     {
      //       id: res?.id || '',
      //       message,
      //       time: moment().format("HH:mm"),
      //       sender: loggedInUser?.name || '',
      //       isReceiver: false
      //     }
      //   ]
      // });
    });
  };

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredChats(chats);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = chats.filter(
      (chat) =>
        chat.message.toLowerCase().includes(searchTermLower) ||
        chat.sender.toLowerCase().includes(searchTermLower),
    );
    setFilteredChats(filtered);
  };

  useEffect(() => {
    setFilteredChats(chats);
  }, [chats]);

  return (
    <div
      ref={chatRef}
      className="px-[12px] py-[15px] bg-[#F9F9F9] rounded-[12px] relative h-full flex flex-col md:static md:h-[50%]"
    >
      {chats.length !== 0 && <SearchBar onSearch={handleSearch} />}
      <Conversation
        chatHeight={chatHeight}
        isMobile={isMobile}
        chats={filteredChats}
      />
      <div className="mt-auto">
        <ChatInput sendMessage={sendMessage} />
      </div>
    </div>
  );
};
export default Chat;
