'use client';

import moment from 'moment';
import { useState, useEffect } from 'react';

import ClientsContainer from '@/components/clients/ClientsContainer';
import { Client } from '@/interfaces/client';
import { getClientsList, ClientListResponse } from '@/services/api';

export default function Clients() {
  const [clientsForContainer, setClientsForContainer] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyActiveClients, setShowOnlyActiveClients] =
    useState<boolean>(false);

  // States for pagination
  // const [currentPage, setCurrentPage] = useState<number>(1);
  // const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  // const [totalClients, setTotalClients] = useState<number>(0);

  useEffect(() => {
    async function fetchInitialClients() {
      try {
        setLoading(true);
        setError(null);

        const clientData: ClientListResponse = await getClientsList({});

        const transformedClients: Client[] = clientData.list.map((client) => ({
          id: String(client.id),
          name: client.name,
          email: client.email,
          phone: client.phone,
          propertiesCount: client.property_count,
          lastActivity: client.last_activity
            ? formatDate(client.last_activity)
            : 'N/A',
        }));

        setClientsForContainer(transformedClients);
      } catch (err: any) {
        console.error('Error fetching initial clients:', err.message);
        setError(
          err.message || 'An unknown error occurred while fetching clients.',
        );
      } finally {
        setLoading(false);
      }
    }

    fetchInitialClients();
  }, []);

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

  const reloadClients = async function (activeFilter: true | undefined) {
    try {
      setLoading(true);
      setError(null);

      const clientData: ClientListResponse = await getClientsList({
        active: activeFilter,
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
      }));

      setClientsForContainer(transformedClients);
    } catch (err: any) {
      console.error('Error reloading clients:', err.message);
      setError(
        err.message || 'An unknown error occurred while reloading clients.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4">
        <p className="text-xl animate-pulse">Loading clients...</p>
      </div>
    );
  }

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
      <ClientsContainer
        clients={clientsForContainer}
        reloadClients={reloadClients}
        showOnlyActiveClients={showOnlyActiveClients}
        setShowOnlyActiveClients={setShowOnlyActiveClients}
        // currentPage={currentPage}
        // hasNextPage={hasNextPage}
        // totalClients={totalClients}
      />
    </div>
  );
}
