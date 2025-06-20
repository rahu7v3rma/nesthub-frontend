import { useRouter, useParams } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';

import { ClientFormRowData, ErrorResponseType } from '@/interfaces/client';
import { getClientDetails, editClientData, deleteClient } from '@/services/api';
import { splitName, joinName } from '@/utils/nameUtils';

export function useClientForm() {
  const router = useRouter();
  const params = useParams();
  const clientIdParam = params?.clientId;
  const parentClientId =
    typeof clientIdParam === 'string' ? parseInt(clientIdParam, 10) : undefined;

  const [clientRows, setClientRows] = useState<ClientFormRowData[]>([]);
  const [initialClientRows, setInitialClientRows] = useState<
    ClientFormRowData[]
  >([]);
  const [errors, setErrors] = useState<{
    [index: number]: { [field: string]: string };
  }>({});
  const [isLoading, setIsLoading] = useState(false); // Main form saving
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [pageTitle] = useState('Client details');
  const [deletingMemberId, setDeletingMemberId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null); // State for data load errors
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    title: string;
    subTitle?: string;
    onConfirm: () => void;
  } | null>(null);

  const loadInitialData = useCallback(async () => {
    setIsFetchingData(true);
    setLoadError(null); // Reset load error
    setErrors({});

    if (!parentClientId) {
      // This case should ideally not happen if routing is correct for [clientId]
      const errorMsg = 'Client ID not found in URL. Cannot load client data.';
      console.error(errorMsg);
      setLoadError(errorMsg);
      setClientRows([]); // Clear rows on error
      setInitialClientRows([]);
      setIsFetchingData(false);
      return;
    }

    try {
      const fetchedData = await getClientDetails(String(parentClientId));
      const parentName = splitName(fetchedData.name);
      const parentRow: ClientFormRowData = {
        id: fetchedData.id,
        isArchived: fetchedData.is_active,
        firstName: parentName.firstName,
        lastName: parentName.lastName,
        email: fetchedData.email,
        phone: fetchedData.phone,
      };
      const memberRows: ClientFormRowData[] = (fetchedData.members || []).map(
        (member) => {
          const memberName = splitName(member.name);
          return {
            id: member.id ?? null,
            firstName: memberName.firstName,
            lastName: memberName.lastName,
            email: member.email,
            phone: member.phone,
          };
        },
      );
      const loadedRows = [parentRow, ...memberRows];
      setClientRows(loadedRows);
      setInitialClientRows(JSON.parse(JSON.stringify(loadedRows)));
    } catch (error: any) {
      const errorMsg = `Could not load client data: ${error?.message || 'Unknown error'}`;
      console.error('API fetch failed:', error);
      setLoadError(errorMsg);
      toast.error(errorMsg);
      setClientRows([]); // Clear rows on error
      setInitialClientRows([]);
    } finally {
      setIsFetchingData(false);
    }
  }, [parentClientId]); // Depend only on parentClientId

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const addClientRow = () => {
    // Always adds a new *member* row
    setClientRows((prev) => [
      ...prev,
      {
        id: null,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        isNew: true,
      },
    ]);
    setErrors((prev) => {
      const newErrors = { ...prev };
      // Clear errors for the index where the new row will be added
      delete newErrors[clientRows.length];
      return newErrors;
    });
  };

  const handleDeleteMember = async (index: number, memberId: number | null) => {
    if (index === 0) {
      toast.warn('Cannot delete the primary client using this button.');
      return;
    }
    if (!memberId) {
      // Handling newly added rows before save
      const newClients = clientRows.filter((_, i) => i !== index);
      setClientRows(newClients);
      setErrors((prevErrors) => {
        const updatedErrors: { [index: number]: { [field: string]: string } } =
          {};
        Object.keys(prevErrors).forEach((errIndexStr) => {
          const errIndex = parseInt(errIndexStr, 10);
          if (errIndex < index) updatedErrors[errIndex] = prevErrors[errIndex];
          else if (errIndex > index && prevErrors[errIndex])
            updatedErrors[errIndex - 1] = prevErrors[errIndex];
        });
        return updatedErrors;
      });
      toast.info('New row removed.');
      return;
    }
    if (deletingMemberId === memberId || isLoading) return;

    setConfirmModalConfig({
      title: 'Remove Member',
      subTitle: 'Are you sure you want to remove this member?',
      onConfirm: async () => {
        setDeletingMemberId(memberId);
        try {
          if (!parentClientId) throw new Error('Parent Client ID is missing.');
          await deleteClient(String(memberId));
          toast.success('Member removed successfully!');
          const newClients = clientRows.filter(
            (client) => client.id !== memberId,
          );
          setClientRows(newClients);
          const newInitialClients = initialClientRows.filter(
            (client) => client.id !== memberId,
          );
          setInitialClientRows(newInitialClients);
          // Error shifting logic
          setErrors((prevErrors) => {
            const updatedErrors: {
              [index: number]: { [field: string]: string };
            } = {};
            let currentNewIndex = 0;
            newClients.forEach((_, newIndex) => {
              const originalIndex = clientRows.findIndex(
                (c) => c.id === newClients[newIndex].id || (c.isNew && !c.id),
              );
              if (prevErrors[originalIndex]) {
                updatedErrors[currentNewIndex] = prevErrors[originalIndex];
              }
              currentNewIndex++;
            });
            return updatedErrors;
          });
        } catch (err: any) {
          handleApiError(err, `API Error deleting member ${memberId}`);
        } finally {
          setDeletingMemberId(null);
        }
      },
    });
    setShowConfirmModal(true);
  };

  const handleDeleteClient = async () => {
    if (!parentClientId || isLoading || deletingMemberId) return;

    setConfirmModalConfig({
      title: 'Delete Client',
      subTitle:
        'Are you sure you want to delete this client and all associated members?',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await deleteClient(String(parentClientId));
          toast.success('Client deleted successfully!');
          router.push('/clients');
        } catch (err: any) {
          handleApiError(err, 'API Error deleting client');
          setIsLoading(false);
        }
      },
    });
    setShowConfirmModal(true);
  };

  const validateRow = (
    client: ClientFormRowData,
  ): { [field: string]: string } | null => {
    const fieldErrors: { [field: string]: string } = {};
    if (!client.firstName.trim())
      fieldErrors.firstName = 'First Name is required';
    if (!client.lastName.trim()) fieldErrors.lastName = 'Last Name is required';
    if (!client.email.trim()) fieldErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(client.email))
      fieldErrors.email = 'Invalid email format';
    if (client.phone.trim() && !/^\+?[0-9\s-()]{7,}$/.test(client.phone))
      fieldErrors.phone = 'Invalid phone format';
    return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || deletingMemberId || !parentClientId) return; // Guard against missing ID or concurrent actions

    // Filter out empty newly added rows that user didn't interact with
    const rowsToProcess = clientRows.filter(
      (row, index) =>
        row.firstName || row.lastName || row.email || row.phone || index === 0, // Always process parent row
    );

    let isValid = true;
    const newErrors: { [index: number]: { [field: string]: string } } = {};
    rowsToProcess.forEach((row) => {
      const originalIndex = clientRows.findIndex((r) => r === row);
      const rowErrors = validateRow(row);
      if (rowErrors) {
        isValid = false;
        newErrors[originalIndex] = rowErrors;
      }
    });
    setErrors(newErrors);

    if (!isValid) {
      toast.error('Please fix the errors in the form.');
      return;
    }
    if (rowsToProcess.length === 0) {
      toast.error('Client data is empty.');
      return;
    } // Should not happen if parent exists

    setIsLoading(true);
    try {
      // Always use the Edit Mode logic
      const parentRowData = rowsToProcess[0];
      const memberRowsData = rowsToProcess.slice(1);
      const initialParent =
        initialClientRows.length > 0 ? initialClientRows[0] : null; // Handle case where initial load failed

      const parentUpdatePayload: {
        name?: string;
        email?: string;
        phone?: string;
      } = {};
      const currentParentName = joinName(
        parentRowData.firstName,
        parentRowData.lastName,
      );

      // Compare against initial state *if* it loaded correctly
      if (initialParent) {
        if (
          currentParentName !==
          joinName(initialParent.firstName, initialParent.lastName)
        )
          parentUpdatePayload.name = currentParentName;
        if (parentRowData.email !== initialParent.email)
          parentUpdatePayload.email = parentRowData.email;
        if (parentRowData.phone !== initialParent.phone)
          parentUpdatePayload.phone = parentRowData.phone;
      } else {
        // If initial load failed, send all current parent data
        parentUpdatePayload.name = currentParentName;
        parentUpdatePayload.email = parentRowData.email;
        parentUpdatePayload.phone = parentRowData.phone;
      }

      const membersPayload: {
        id?: number;
        name?: string;
        email?: string;
        phone?: string;
      }[] = [];
      memberRowsData.forEach((currentRow) => {
        const currentMemberName = joinName(
          currentRow.firstName,
          currentRow.lastName,
        );
        if (currentRow.id) {
          // Existing member (potentially updated)
          const initialMember = initialClientRows.find(
            (r) => r.id === currentRow.id,
          );
          if (initialMember) {
            // Compare if initial data exists
            const memberChanges: {
              id: number;
              name?: string;
              email?: string;
              phone?: string;
            } = { id: currentRow.id };
            let hasChanges = false;
            if (
              currentMemberName !==
              joinName(initialMember.firstName, initialMember.lastName)
            ) {
              memberChanges.name = currentMemberName;
              hasChanges = true;
            }
            if (currentRow.email !== initialMember.email) {
              memberChanges.email = currentRow.email;
              hasChanges = true;
            }
            if (currentRow.phone !== initialMember.phone) {
              memberChanges.phone = currentRow.phone;
              hasChanges = true;
            }
            if (hasChanges) membersPayload.push(memberChanges);
          } else {
            // Member exists now but wasn't initial? Treat as update with all data
            membersPayload.push({
              id: currentRow.id,
              name: currentMemberName,
              email: currentRow.email,
              phone: currentRow.phone,
            });
          }
        } else {
          // New member (no ID)
          membersPayload.push({
            name: currentMemberName,
            email: currentRow.email,
            phone: currentRow.phone,
          });
        }
      });

      const finalPayload: {
        name?: string;
        email?: string;
        phone?: string;
        members?: any[];
      } = {};
      if (Object.keys(parentUpdatePayload).length > 0)
        Object.assign(finalPayload, parentUpdatePayload);

      // Always send the current state of members (updates + creates).
      // Backend's PUT handles adding/updating based on this list.
      finalPayload.members = membersPayload;

      const response = await editClientData(
        String(parentClientId),
        finalPayload,
      );
      if (response.success) {
        toast.success(response.message || 'Client updated successfully!');
        // Update UI and initial state from response
        const updatedParent = response.data.parent;
        const updatedMembers = response.data.members;
        const parentNameSplit = splitName(updatedParent.name);
        const newInitialParent = {
          id: updatedParent.id,
          firstName: parentNameSplit.firstName,
          lastName: parentNameSplit.lastName,
          email: updatedParent.email,
          phone: updatedParent.phone,
        };
        const newInitialMembers = updatedMembers.map((m: any) => {
          const memberNameSplit = splitName(m.name);
          return {
            id: m.id,
            firstName: memberNameSplit.firstName,
            lastName: memberNameSplit.lastName,
            email: m.email,
            phone: m.phone,
          };
        });
        const newInitialRows = [newInitialParent, ...newInitialMembers];
        setClientRows(newInitialRows);
        setInitialClientRows(JSON.parse(JSON.stringify(newInitialRows)));
        setErrors({});
      } else {
        handleApiErrorResponse(response, 'Failed to update client');
      }
    } catch (err: any) {
      handleApiError(err, 'API Error during save');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (index: number, name: string, value: string) => {
    setClientRows((prev) =>
      prev.map((client, i) =>
        i === index ? { ...client, [name]: value } : client,
      ),
    );
    setErrors((prev) => {
      const rowErrors = { ...(prev[index] || {}) };
      delete rowErrors[name];
      const newErrors = { ...prev };
      if (Object.keys(rowErrors).length === 0) delete newErrors[index];
      else newErrors[index] = rowErrors;
      return newErrors;
    });
  };

  const handleCancel = () => {
    if (isLoading || deletingMemberId) return;
    if (JSON.stringify(clientRows) !== JSON.stringify(initialClientRows)) {
      setConfirmModalConfig({
        title: 'Unsaved Changes',
        subTitle: 'You have unsaved changes. Are you sure you want to cancel?',
        onConfirm: () => {
          toast.info('Action cancelled.');
          setClientRows(JSON.parse(JSON.stringify(initialClientRows)));
          setErrors({});
        },
      });
      setShowConfirmModal(true);
      return;
    }
    toast.info('Action cancelled.');
    setClientRows(JSON.parse(JSON.stringify(initialClientRows)));
    setErrors({});
  };

  const handleArchive = async (previousState: boolean | null) => {
    if (isLoading || deletingMemberId || !parentClientId) return;
    setIsLoading(true);
    setErrors({});
    try {
      const response = await editClientData(String(parentClientId), {
        is_active: !previousState,
      });
      if (response.success) {
        toast.success(
          `Client ${previousState ? 'archived' : 'unarchived'} successfully!`,
        );
        setClientRows((prev) =>
          prev.map((client) => ({
            ...client,
            isArchived: !previousState,
          })),
        );
      } else {
        handleApiErrorResponse(response, 'Failed to archive/unarchive client');
      }
    } catch (err: any) {
      handleApiError(err, 'API Error during archive/unarchive');
    } finally {
      setIsLoading(false);
    }
  };

  // Consolidated API error handling
  const handleApiError = (err: any, context: string) => {
    console.error(context + ':', err);
    const errorDetails = (err as ErrorResponseType)?.data;
    let message =
      (err as ErrorResponseType)?.message || 'An unexpected error occurred.';
    if (typeof errorDetails === 'string') {
      message = errorDetails;
    } else if (typeof errorDetails === 'object' && errorDetails !== null) {
      /* More specific formatting could go here */
    }
    toast.error(message);
  };

  // Helper to handle API responses that might not be successful
  const handleApiErrorResponse = (response: any, defaultMessage: string) => {
    const errorData = response?.data;
    let message = response?.message || defaultMessage;
    if (typeof errorData === 'object' && errorData !== null) {
      if (errorData.parent_errors || errorData.member_errors) {
        message += ` Details: ${JSON.stringify(errorData)}`;
      }
    }
    toast.error(message);
  };

  return {
    parentClientId,
    clientRows,
    errors,
    isLoading,
    isFetchingData,
    loadError,
    pageTitle,
    deletingMemberId,
    addClientRow,
    handleDeleteMember,
    handleDeleteClient,
    handleSubmit,
    handleChange,
    handleCancel,
    handleArchive,
    showConfirmModal,
    setShowConfirmModal,
    confirmModalConfig,
  };
}
