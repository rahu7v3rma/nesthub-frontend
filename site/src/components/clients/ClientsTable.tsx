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
} from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { BiSolidMessageSquareDetail } from 'react-icons/bi';

import { Client } from '@/interfaces/client';

type ClientsTableProps = {
  clients: Client[];
  onRowClick?: (value: Client) => void;
};

export default function ClientsTable({
  clients,
  onRowClick,
}: ClientsTableProps) {
  const router = useRouter();

  const [sortDescriptor, setSortDescriptor] = useState<{
    column: string;
    direction: 'ascending' | 'descending';
  }>({
    column: 'lastActivity',
    direction: 'descending',
  });
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const pages = Math.ceil(clients.length / rowsPerPage);

  const sortedItems = useMemo(() => {
    return [...clients].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof Client];
      const second = b[sortDescriptor.column as keyof Client];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [sortDescriptor, clients]);

  // Update display clients on page or sort changes
  const clientsData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedItems.slice(start, end);
  }, [page, sortedItems]);

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
    <Table
      aria-label="clients table"
      classNames={{
        base: 'p-0 mt-4 overflow-hidden',
        wrapper: 'p-0 shadow-none overflow-visible',
        th: 'text-sm text-primary-100 font-normal bg-none!',
        td: 'text-sm text-primary py-4',
        tr: 'border-b-1 border-[#F6F6F6]',
      }}
      bottomContent={
        <div className="flex w-full justify-end">
          <Pagination
            isCompact
            showControls
            page={page}
            total={pages}
            onChange={(page) => setPage(page)}
          />
        </div>
      }
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
      </TableHeader>
      <TableBody>
        {clientsData.map((client) => (
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
