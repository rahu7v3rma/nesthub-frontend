import { Button, Divider, Link } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { BiSolidMessageSquareDetail } from 'react-icons/bi';

import { Client } from '@/interfaces/client';

type ClientsListProps = {
  clients: Client[];
};

export default function ClientsList({ clients }: ClientsListProps) {
  const router = useRouter();

  return clients.map((client) => (
    <div key={`client-${client.id}`}>
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between items-center w-full">
          <Link href={`/clients/${client.id}`} className="font-semibold">
            {client.name}
          </Link>
          <span>{client.propertiesCount} properties</span>
        </div>
        <span>{client.email}</span>
        <span>{client.phone}</span>
        <div className="flex justify-between items-end w-full">
          <span className="text-primary-100">{client.lastActivity}</span>
        </div>
      </div>
      <Divider className="my-4 opacity-30" />
    </div>
  ));
}
