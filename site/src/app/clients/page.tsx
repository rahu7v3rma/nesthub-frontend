'use client';

import moment from 'moment';
import { useState, useEffect } from 'react';

import ClientsContainer from '@/components/clients/ClientsContainer';
import SkeletonClientsContainer from '@/components/clients/SkeletonClientsContainer';
import { Client } from '@/interfaces/client';
import { getClientsList, ClientListResponse } from '@/services/api';

export default function Clients() {
  const [clientsForContainer, setClientsForContainer] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyActiveClients, setShowOnlyActiveClients] =
    useState<boolean>(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [totalClients, setTotalClients] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function fetchClients() {
      try {
        setLoading(true);
        setError(null);

        const clientData: ClientListResponse = await getClientsList({
          page: currentPage,
          limit: 10,
          search: searchQuery,
          active: showOnlyActiveClients ? true : undefined,
        });

        const transformedClients: Client[] = clientData.list.map((client) => ({
          id: String(client.id),
          name: client.name,
          email: client.email,
          phone: client.phone,
          propertiesCount: client.property_count,
          lastActivity: client.last_activity
            ? formatDate(client.last_activity)
            : 'N/A',
          isArchived: !client.is_active,
        }));

        setClientsForContainer(transformedClients);
        setHasNextPage(clientData.has_next);
        setTotalClients(clientData.total);
      } catch (err: any) {
        console.error('Error fetching clients:', err.message);
        setError(
          err.message || 'An unknown error occurred while fetching clients.',
        );
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    }

    fetchClients();
  }, [currentPage, searchQuery, showOnlyActiveClients]);

  const formatDate = (dateString: string) => {
    const now = moment();
    const date = moment(dateString);
    const diffInDays = now.diff(date, 'days');

    if (diffInDays === 0) {
      return `Today, ${date.format('h:mm a')}`;
    } else if (diffInDays === 1) {
      return `Yesterday, ${date.format('h:mm a')}`;
    } else {
      return date.format('MMMM, D h:mm a');
    }
  };

  const reloadClients = async function ({
    active,
    search,
  }: {
    active?: true;
    search?: string;
  }): Promise<void> {
    if (typeof active === 'boolean') setShowOnlyActiveClients(active);
    setSearchQuery(search ?? '');
    setCurrentPage(1);
    return Promise.resolve();
  };

  const refreshClientsData = async function (): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      const clientData: ClientListResponse = await getClientsList({
        page: currentPage,
        limit: 10,
        search: searchQuery,
        active: showOnlyActiveClients ? true : undefined,
      });

      const transformedClients: Client[] = clientData.list.map((client) => ({
        id: String(client.id),
        name: client.name,
        email: client.email,
        phone: client.phone,
        propertiesCount: client.property_count,
        lastActivity: client.last_activity
          ? formatDate(client.last_activity)
          : 'N/A',
        isArchived: !client.is_active,
      }));

      setClientsForContainer(transformedClients);
      setHasNextPage(clientData.has_next);
      setTotalClients(clientData.total);
    } catch (err: any) {
      console.error('Error refreshing clients:', err.message);
      setError(
        err.message || 'An unknown error occurred while refreshing clients.',
      );
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalClients / 10);

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4">
        <h1 className="text-2xl mb-4">Error Loading Clients</h1>
        <p className="text-gray-700">
          We couldn&apos;t fetch the client data at this time. Please try again
          later.
        </p>
        {error && (
          <p className="text-sm text-gray-500 mt-2">Details: {error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-12">
      {initialLoading ? (
        <SkeletonClientsContainer />
      ) : (
        <ClientsContainer
          clients={clientsForContainer}
          reloadClients={reloadClients}
          refreshClientsData={refreshClientsData}
          showOnlyActiveClients={showOnlyActiveClients}
          setShowOnlyActiveClients={setShowOnlyActiveClients}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={(page: number) => setCurrentPage(page)}
          hasNextPage={hasNextPage}
          searchQuery={searchQuery}
          onSearch={async (query) => {
            await reloadClients({
              active: showOnlyActiveClients ? true : undefined,
              search: query,
            });
          }}
        />
      )}
    </div>
  );
}
