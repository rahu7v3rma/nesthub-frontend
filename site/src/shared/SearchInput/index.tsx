import { Input } from '@heroui/react';
import { useState } from 'react';
import { MdSearch } from 'react-icons/md';
import { useDebouncedCallback } from 'use-debounce';

interface SearchInputProps {
  onSearch: (searchQuery: string) => void | Promise<void>;
  className?: string;
  debounceMs?: number;
}

export default function SearchInput({
  onSearch,
  className = '',
  debounceMs = 500,
}: SearchInputProps) {
  const [query, setQuery] = useState('');

  const debouncedSearch = useDebouncedCallback((value: string) => {
    onSearch(value);
  }, debounceMs);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return (
    <div className={className}>
      <Input
        classNames={{
          base: 'w-full',
          mainWrapper: 'h-full',
          input: 'text-small',
          inputWrapper:
            'h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20',
        }}
        size="lg"
        radius="full"
        placeholder="Search"
        value={query}
        onChange={handleChange}
        endContent={
          <MdSearch
            size={24}
            className="text-default-400 pointer-events-none flex-shrink-0"
          />
        }
      />
    </div>
  );
}
