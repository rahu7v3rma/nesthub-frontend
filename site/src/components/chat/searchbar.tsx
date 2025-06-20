import Image from 'next/image';
import { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(searchTerm.trim());
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, onSearch]);

  return (
    <div className="flex items-center p-[6px] rounded-full bg-white h-[48px]">
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="ml-[12px] mb-[4px] flex-1 bg-white outline-none placeholder:text-[#A9A6B2] placeholder:text-[13px] placeholder:font-[400]"
      />
      <Image
        width={16}
        height={16}
        alt="search icon"
        src="/svgs/search.svg"
        className="mr-[10px]"
      />
    </div>
  );
};

export default SearchBar;
