import { Divider, Link, Switch } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { BiSolidMessageSquareDetail } from 'react-icons/bi';

import { Client } from '@/interfaces/client';

type ClientsListProps = {
  clients: Client[];
  onArchiveToggle?: (client: Client, isArchived: boolean) => void;
};

export default function ClientsList({
  clients,
  onArchiveToggle,
}: ClientsListProps) {
  const router = useRouter();

  const handleArchiveToggle = (client: Client, isArchived: boolean) => {
    if (onArchiveToggle) {
      onArchiveToggle(client, isArchived);
    }
  };

  return clients.map((client) => (
    <div key={`client-${client.id}`} className="mb-2">
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
          <Switch
            size="sm"
            isSelected={client.isArchived}
            onValueChange={(val) => handleArchiveToggle(client, val)}
            aria-label="Archive client"
          />
        </div>
      </div>
      <Divider className="my-4 opacity-30" />
    </div>
  ));
}
