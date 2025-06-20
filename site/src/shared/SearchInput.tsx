import { Input } from '@heroui/react';
import { useState } from 'react';
import { MdSearch } from 'react-icons/md';

interface SearchInputProps {
  onSearch: (searchQuery: string) => void | Promise<void>;
  className?: string;
}

export default function SearchInput({ onSearch, className }: SearchInputProps) {
  const [value, setValue] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
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
        value={value}
        onChange={(e) => setValue(e.target.value)}
        endContent={
          <button type="submit" className="focus:outline-none">
            <MdSearch
              size={24}
              className="text-default-400 pointer-events-none flex-shrink-0"
            />
          </button>
        }
      />
    </form>
  );
}
