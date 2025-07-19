'use client';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Switch,
  useDisclosure,
} from '@heroui/react';
import { useCallback, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { Client } from '@/interfaces/client';
import { editClientData } from '@/services/api';
import SearchInput from '@/shared/SearchInput';

import AddClientModal from './AddClientModal';
import ClientsList from './ClientsList';
import ClientsTable from './ClientsTable';

type ClientsContainerProps = {
  clients: Client[];
  reloadClients: (params: { active?: true; search?: string }) => Promise<void>;
  refreshClientsData: () => Promise<void>;
  showOnlyActiveClients: boolean;
  setShowOnlyActiveClients: (value: boolean) => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  hasNextPage: boolean;
  searchQuery: string;
  onSearch: (query: string) => void | Promise<void>;
  loading?: boolean;
};

export default function ClientsContainer({
  clients,
  reloadClients,
  refreshClientsData,
  showOnlyActiveClients,
  setShowOnlyActiveClients,
  currentPage,
  totalPages,
  setCurrentPage,
  hasNextPage,
  searchQuery,
  onSearch,
  loading,
}: ClientsContainerProps) {
  const [filteredClients, setFilteredClients] = useState<Client[]>(clients);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [editClient, setEditClient] = useState<Client | null>(null);

  useEffect(() => {
    setFilteredClients(clients);
  }, [clients]);

  const handleSearch = useCallback(
    async (query: string) => {
      await onSearch(query);
    },
    [onSearch],
  );

  const handleRowClick = (row: Client) => {
    onOpen();
    setEditClient(row);
  };

  const onAddClick = () => {
    onOpen();
    setEditClient(null);
  };

  const handleSwitchChange = async (isSelected: boolean) => {
    setShowOnlyActiveClients(isSelected);
    await reloadClients({
      active: isSelected ? true : undefined,
      search: searchQuery,
    });
  };

  const handleArchiveToggle = async (client: Client, isArchived: boolean) => {
    setFilteredClients((prev) =>
      prev.map((c) => (c.id === client.id ? { ...c, isArchived } : c)),
    );
    try {
      await editClientData(client.id, { is_active: !isArchived });
      toast.success(
        isArchived
          ? 'Client archived successfully.'
          : 'Client unarchived successfully.',
      );
    } catch (err) {
      setFilteredClients((prev) =>
        prev.map((c) =>
          c.id === client.id ? { ...c, isArchived: !isArchived } : c,
        ),
      );
      toast.error('Failed to update archive status.');
    }
  };

  return (
    <Card className="md:px-8 md:py-4 shadow-none md:shadow-medium">
      <CardHeader className="flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
        <div className="mb-5 md:mb-0 flex justify-between md:items-center gap-4 w-full md:w-auto">
          <h2 className="text-xl text-primary font-semibold my-auto">
            Clients
          </h2>
          <div className="block md:hidden">
            <Button
              size="lg"
              color="primary"
              radius="full"
              className="uppercase text-sm font-semibold shrink-0 order-1 md:order-3"
              onPress={() => onAddClick()}
            >
              Add Client
            </Button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
          <Switch
            size="sm"
            classNames={{
              base: 'shrink-0 order-3 md:order-1',
            }}
            isSelected={showOnlyActiveClients}
            onValueChange={handleSwitchChange}
          >
            Only active clients
          </Switch>
          <div className="order-2 md:order-2 w-full md:w-auto">
            <SearchInput
              onSearch={handleSearch}
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <div className="order-3 md:order-3 hidden md:block">
            <Button
              size="lg"
              color="primary"
              radius="full"
              className="uppercase text-sm font-semibold shrink-0 order-1 md:order-3"
              onPress={() => onAddClick()}
            >
              Add Client
            </Button>
          </div>
        </div>
        <AddClientModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          onClose={onClose}
          onDataChange={async () => {
            await refreshClientsData();
          }}
        />
      </CardHeader>
      <CardBody>
        {/* Desktop View */}
        <div className="hidden md:block">
          <ClientsTable
            clients={filteredClients}
            onRowClick={(row) => handleRowClick(row)}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={(page: number) => setCurrentPage(page)}
            hasNextPage={hasNextPage}
            onArchiveToggle={handleArchiveToggle}
          />
        </div>
        {/* Mobile View */}
        <div className="block md:hidden m-2">
          <ClientsList
            clients={filteredClients}
            onArchiveToggle={handleArchiveToggle}
          />
        </div>
      </CardBody>
    </Card>
  );
}
