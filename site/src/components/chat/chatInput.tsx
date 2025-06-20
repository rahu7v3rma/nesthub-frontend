'use client';

import Image from 'next/image';
import React, { useState, ChangeEvent, useRef, useEffect } from 'react';

import { emojiUnicodeMap, comprehensiveEmojis } from '@/data/emoji';

type ChatInputProps = {
  sendMessage: (message: string) => void;
};

const FREQUENTLY_USED_STORAGE_KEY = 'frequentlyUsedEmojis';
const MAX_FREQUENTLY_USED = 16;

const ChatInput = ({ sendMessage }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [frequentlyUsed, setFrequentlyUsed] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUnicodeSuggestions, setShowUnicodeSuggestions] = useState(false);
  const [unicodeSuggestions, setUnicodeSuggestions] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const storedEmojis = localStorage.getItem(FREQUENTLY_USED_STORAGE_KEY);
    if (storedEmojis) {
      try {
        setFrequentlyUsed(JSON.parse(storedEmojis));
      } catch (e) {
        console.error(
          'Failed to parse frequently used emojis from local storage',
          e,
        );
        setFrequentlyUsed([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      FREQUENTLY_USED_STORAGE_KEY,
      JSON.stringify(frequentlyUsed),
    );
  }, [frequentlyUsed]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e?.target?.value || '';
    setMessage(value);
    setCursorPosition(e.target.selectionStart || 0);

    const lastWord =
      value
        .slice(0, e.target.selectionStart || 0)
        .split(/\s/)
        .pop() || '';
    if (lastWord.startsWith(':')) {
      const suggestions = Object.entries(emojiUnicodeMap)
        .filter(([key]) => key.toLowerCase().includes(lastWord.toLowerCase()))
        .map(([_, emoji]) => emoji);
      setUnicodeSuggestions(suggestions);
      setShowUnicodeSuggestions(suggestions.length > 0);
    } else {
      setShowUnicodeSuggestions(false);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const processedMessage = message.replace(
        /:(\w+):/g,
        (match) => emojiUnicodeMap[match] || match,
      );
      sendMessage(processedMessage.trim());
      setMessage('');
      setCursorPosition(0);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const updateFrequentlyUsed = (emoji: string) => {
    setFrequentlyUsed((prevEmojis) => {
      const newEmojis = prevEmojis.filter((e) => e !== emoji);
      return [emoji, ...newEmojis].slice(0, MAX_FREQUENTLY_USED);
    });
  };

  const handleEmojiClick = (emoji: string) => {
    const newMessage =
      message.slice(0, cursorPosition) + emoji + message.slice(cursorPosition);
    setMessage(newMessage);
    const newCursorPosition = cursorPosition + emoji.length;
    setCursorPosition(newCursorPosition);
    updateFrequentlyUsed(emoji);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(
          newCursorPosition,
          newCursorPosition,
        );
      }
    }, 0);
  };

  const handleUnicodeSuggestionClick = (emoji: string) => {
    const words = message.split(/\s/);
    const lastWordIndex = words.length - 1;
    words[lastWordIndex] = emoji;
    const newMessage = words.join(' ');
    setMessage(newMessage);
    setShowUnicodeSuggestions(false);
    setCursorPosition(newMessage.length);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
    if (!showEmojiPicker) {
      setTimeout(() => {
        const searchInput =
          emojiPickerRef.current?.querySelector('input[type="text"]');
        if (searchInput) {
          (searchInput as HTMLInputElement).focus();
        }
      }, 0);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleInputClick = () => {
    setTimeout(() => {
      if (inputRef.current) {
        setCursorPosition(inputRef.current.selectionStart || 0);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Escape') {
      if (showEmojiPicker) {
        setShowEmojiPicker(false);
      }
      if (showUnicodeSuggestions) {
        setShowUnicodeSuggestions(false);
      }
    }

    setTimeout(() => {
      if (inputRef.current) {
        setCursorPosition(inputRef.current.selectionStart || 0);
      }
    }, 0);
  };

  const filteredEmojis = Object.entries(comprehensiveEmojis).reduce(
    (acc, [category, emojiList]) => {
      const filteredList = emojiList.filter(
        (emoji) =>
          emoji.includes(searchTerm) ||
          Object.entries(emojiUnicodeMap)
            .filter(([key, value]) => value === emoji)
            .some(([key]) =>
              key.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
      );
      if (filteredList.length > 0) {
        acc[category] = filteredList;
      }
      return acc;
    },
    {} as Record<string, string[]>,
  );

  if (searchTerm === '' && frequentlyUsed.length > 0) {
    filteredEmojis['Frequently Used'] = frequentlyUsed;
  }

  // Create an ordered array of categories to ensure Frequently Used is first
  const orderedCategories = [
    'Frequently Used',
    ...Object.keys(filteredEmojis).filter((cat) => cat !== 'Frequently Used'),
  ];

  return (
    <div className="relative">
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-full left-0 mb-2 z-50 bg-cardBg rounded-[24px] shadow-custom-combined border border-cardBorder overflow-hidden"
          style={{
            width: '320px',
            height: '400px',
            transform: 'translateY(-8px)',
          }}
        >
          <div className="p-3 border-b border-cardBorder flex items-center bg-white">
            <Image
              src="/svgs/search.svg"
              alt="Search"
              width={16}
              height={16}
              className="mr-2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search emoji"
              className="w-full text-sm outline-none bg-transparent placeholder:text-[#A9A6B2] focus:placeholder:text-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-y-auto h-[calc(100%-50px)] p-2 custom-scrollbar">
            {orderedCategories.map((category) => (
              <div key={category} className="mb-4 last:mb-0">
                {category !== 'Frequently Used' && searchTerm === '' && (
                  <h3 className="text-xs font-semibold text-[#5E5E61] uppercase mb-2 px-2">
                    {category}
                  </h3>
                )}
                {category === 'Frequently Used' &&
                  searchTerm === '' &&
                  frequentlyUsed.length > 0 && (
                    <h3 className="text-xs font-semibold text-[#5E5E61] uppercase mb-2 px-2">
                      {category}
                    </h3>
                  )}
                <div className="grid grid-cols-8 gap-1">
                  {filteredEmojis[category]?.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => handleEmojiClick(emoji)}
                      className="p-1 text-xl hover:bg-gray-200 rounded-sm transition-colors duration-100 focus:outline-none flex items-center justify-center"
                      type="button"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(filteredEmojis).length === 0 && searchTerm !== '' && (
              <div className="text-center text-gray-500 text-sm">
                No emojis found for &quot;{searchTerm}&quot;
              </div>
            )}
          </div>
        </div>
      )}

      {showUnicodeSuggestions && unicodeSuggestions.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
          <div className="flex flex-wrap gap-1">
            {unicodeSuggestions?.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleUnicodeSuggestionClick(emoji)}
                className="p-1 text-xl hover:bg-gray-100 rounded-sm transition-colors duration-100 focus:outline-none"
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center rounded-full p-[6px] mt-[10px] bg-white h-[48px] shadow-sm border border-gray-100">
        <button
          ref={emojiButtonRef}
          onClick={toggleEmojiPicker}
          className="cursor-pointer ml-[10px] p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          aria-label="Open emoji picker"
          type="button"
        >
          <Image
            width={18}
            height={18}
            alt="emoji"
            src="/pngs/emoji.png"
            className="pointer-events-none"
          />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          placeholder="Type message (use :emoji: for shortcuts)"
          className="mb-[4px] flex-1 outline-none ml-[12px] placeholder:text-[#A9A6B2] placeholder:text-[13px] font-[400] focus:placeholder:text-gray-400 transition-colors duration-200"
          maxLength={1000}
          autoComplete="off"
        />

        <button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
          type="button"
        >
          <Image
            width={36}
            height={36}
            alt="send message"
            src="/pngs/send-icon.png"
            className="pointer-events-none"
          />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
