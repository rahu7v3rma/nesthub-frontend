'use client';

import {
  Button,
  Link,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Switch,
} from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

import { Client } from '@/interfaces/client';

type ClientsTableProps = {
  clients: Client[];
  onRowClick?: (value: Client) => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  hasNextPage: boolean;
  onArchiveToggle?: (client: Client, isArchived: boolean) => void;
};

export default function ClientsTable({
  clients,
  onRowClick,
  currentPage,
  totalPages,
  setCurrentPage,
  hasNextPage,
  onArchiveToggle,
}: ClientsTableProps) {
  const router = useRouter();

  const [sortDescriptor, setSortDescriptor] = useState<{
    column: string;
    direction: 'ascending' | 'descending';
  }>({
    column: 'lastActivity',
    direction: 'descending',
  });

  const sortedItems = useMemo(() => {
    return [...clients].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof Client];
      const second = b[sortDescriptor.column as keyof Client];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [sortDescriptor, clients]);

  const handleArchiveToggle = (client: Client, isArchived: boolean) => {
    if (onArchiveToggle) {
      onArchiveToggle(client, isArchived);
    }
  };

  if (clients.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center text-center p-4">
        <h1 className="text-2xl mb-4">No Clients Found</h1>
        <p className="text-gray-700">
          There are currently no clients to display.
        </p>
      </div>
    );
  }

  return (
    <>
      <Table
        aria-label="clients table"
        classNames={{
          base: `p-0 mt-4 overflow-hidden ${clients.length === 0 ? 'h-[600px]' : ''}`,
          wrapper: 'p-0 shadow-none overflow-visible',
          th: 'text-sm text-primary-100 font-normal bg-none!',
          td: 'text-sm text-primary py-4',
          tr: 'border-b-1 border-[#F6F6F6]',
        }}
        sortDescriptor={sortDescriptor}
        // @ts-ignore
        onSortChange={setSortDescriptor}
      >
        <TableHeader>
          <TableColumn key="name" allowsSorting>
            Name
          </TableColumn>
          <TableColumn key="propertiesCount" allowsSorting>
            No of properties
          </TableColumn>
          <TableColumn key="email" allowsSorting>
            Email
          </TableColumn>
          <TableColumn>Phone</TableColumn>
          <TableColumn key="lastActivity" allowsSorting>
            Last activity
          </TableColumn>
          <TableColumn key="archived">Archived</TableColumn>
        </TableHeader>
        <TableBody>
          {sortedItems.map((client) => (
            <TableRow
              className="cursor-pointer"
              key={client.email}
              // onClick={() => onRowClick && onRowClick(client)}
            >
              <TableCell className="font-semibold">
                <Link href={`/clients/${client.id}`} className="text-sm">
                  {client.name}
                </Link>
              </TableCell>
              <TableCell>{client.propertiesCount}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.phone}</TableCell>
              <TableCell>{client.lastActivity}</TableCell>
              <TableCell>
                <Switch
                  size="sm"
                  classNames={{
                    base: 'shrink-0 order-3 md:order-1',
                  }}
                  isSelected={client.isArchived}
                  onValueChange={(val) => handleArchiveToggle(client, val)}
                  aria-label="Archive client"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages >= 1 && (
        <div className="flex justify-end items-center mt-5 pr-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="px-2 py-1 text-lg text-gray-400 hover:text-black disabled:opacity-40 bg-transparent border-none"
          >
            <IoIosArrowBack />
          </button>
          <span className="mx-2 text-gray-500 text-base font-normal">
            {currentPage} of {totalPages}
          </span>
          <button
            disabled={!hasNextPage}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-2 py-1 text-lg text-gray-400 hover:text-black disabled:opacity-40 bg-transparent border-none"
          >
            <IoIosArrowForward />
          </button>
        </div>
      )}
    </>
  );
}
