import { Input } from '@heroui/react';
import { MdSearch } from 'react-icons/md';

interface SearchInputProps {
  onSearch: (searchQuery: string) => void | Promise<void>;
  className?: string;
  value: string;
  onChange?: (value: string) => void;
}

export default function SearchInput({
  onSearch,
  className,
  value,
  onChange,
}: SearchInputProps) {
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
        value={value}
        onChange={(e) => (onChange ? onChange(e.target.value) : undefined)}
        endContent={
          <span>
            <MdSearch
              size={24}
              className="text-default-400 pointer-events-none flex-shrink-0"
            />
          </span>
        }
      />
    </div>
  );
}
