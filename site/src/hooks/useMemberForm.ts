import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';

import { useUser } from '@/hooks/useUser';
import { ErrorResponseType } from '@/interfaces/client';
import { MemberFormRowData } from '@/interfaces/member';
import {
  getClientMembers,
  editMembersData,
  deleteClientMember,
} from '@/services/api';
import { splitName, joinName } from '@/utils/nameUtils';

export function useMemberForm() {
  const { user } = useUser();
  const [memberRows, setMemberRows] = useState<MemberFormRowData[]>([]);
  const [initialMemberRows, setInitialMemberRows] = useState<
    MemberFormRowData[]
  >([]);
  const [errors, setErrors] = useState<{
    [index: number]: { [field: string]: string };
  }>({});
  const [isLoading, setIsLoading] = useState(false); // Main form saving
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [pageTitle] = useState('Invite family relationships or friends');
  const [deletingMemberId, setDeletingMemberId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null); // State for data load errors
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    title: string;
    subTitle?: string;
    onConfirm: () => void;
  } | null>(null);

  const emptyRow = useMemo(
    () => ({
      id: null,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    }),
    [],
  );

  const loadInitialData = useCallback(async () => {
    setIsFetchingData(true);
    setLoadError(null); // Reset load error
    setErrors({});

    try {
      const fetchedData = await getClientMembers();
      const memberRows: MemberFormRowData[] = (fetchedData.members || []).map(
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

      const loadedRows = memberRows?.length
        ? [...memberRows, emptyRow]
        : [emptyRow];
      setMemberRows(loadedRows);
      setInitialMemberRows(JSON.parse(JSON.stringify(loadedRows)));
    } catch (error: any) {
      const errorMsg = `Could not load client data: ${error?.message || 'Unknown error'}`;
      console.error('API fetch failed:', error);
      setLoadError(errorMsg);
      toast.error(errorMsg);
      setMemberRows([]); // Clear rows on error
      setInitialMemberRows([]);
    } finally {
      setIsFetchingData(false);
    }
  }, [emptyRow]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const addMemberRow = () => {
    // Always adds a new *member* row
    setMemberRows((prev) => [...prev, { ...emptyRow }]);
    setErrors((prev) => {
      const newErrors = { ...prev };
      // Clear errors for the index where the new row will be added
      delete newErrors[memberRows.length];
      return newErrors;
    });
  };

  const handleDeleteMember = async (index: number, memberId: number | null) => {
    if (!memberId) {
      // Handling newly added rows before save
      const newClients = memberRows.filter((_, i) => i !== index);
      setMemberRows(newClients);
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
      title: 'Remove Relationship',
      subTitle: 'Are you sure you want to remove this relationship?',
      onConfirm: async () => {
        setDeletingMemberId(memberId);
        try {
          await deleteClientMember(memberId);
          toast.success('Relationship removed successfully!');
          const newClients = memberRows.filter(
            (client) => client.id !== memberId,
          );
          setMemberRows(newClients);
          const newInitialClients = initialMemberRows.filter(
            (client) => client.id !== memberId,
          );
          setInitialMemberRows(newInitialClients);
          // Error shifting logic
          setErrors((prevErrors) => {
            const updatedErrors: {
              [index: number]: { [field: string]: string };
            } = {};
            let currentNewIndex = 0;
            newClients.forEach((_, newIndex) => {
              const originalIndex = memberRows.findIndex(
                // (c) => c.id === newClients[newIndex].id || (c.isNew && !c.id),
                (c) => c.id === newClients[newIndex].id,
              );
              if (prevErrors[originalIndex]) {
                updatedErrors[currentNewIndex] = prevErrors[originalIndex];
              }
              currentNewIndex++;
            });
            return updatedErrors;
          });
        } catch (err: any) {
          handleApiError(err, `API Error deleting relationship ${memberId}`);
        } finally {
          setDeletingMemberId(null);
        }
      },
    });
    setShowConfirmModal(true);
  };

  const validateRow = (
    client: MemberFormRowData,
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
    if (isLoading || deletingMemberId) return; // Guard against missing ID or concurrent actions

    // Filter out empty newly added rows that user didn't interact with
    const rowsToProcess = memberRows.filter(
      (row) => row.firstName || row.lastName || row.email || row.phone,
    );

    let isValid = true;
    const newErrors: { [index: number]: { [field: string]: string } } = {};
    rowsToProcess.forEach((row) => {
      const originalIndex = memberRows.findIndex((r) => r === row);
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
      toast.error('Relationship data is empty.');
      return;
    } // Should not happen if parent exists

    setIsLoading(true);
    try {
      const memberRowsData = rowsToProcess;
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
          const initialMember = initialMemberRows.find(
            (r) => r.id === currentRow.id,
          );
          if (initialMember) {
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
        members?: any[];
      } = {};

      // Always send the current state of members (updates + creates).
      // Backend's PUT handles adding/updating based on this list.
      finalPayload.members = membersPayload;

      const response = await editMembersData(finalPayload);
      if (response.success) {
        toast.success(
          response.message || 'Relationship(s) updated successfully!',
        );
        // Update UI and initial state from response
        const updatedMembers = response.data.members;
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
        const newInitialRows = [...newInitialMembers, emptyRow];
        setMemberRows(newInitialRows);
        setInitialMemberRows(JSON.parse(JSON.stringify(newInitialRows)));
        setErrors({});
      } else {
        handleApiErrorResponse(response, 'Failed to update relationship(s)');
      }
    } catch (err: any) {
      handleApiError(err, 'API Error during save');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (index: number, name: string, value: string) => {
    setMemberRows((prev) =>
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
    if (JSON.stringify(memberRows) !== JSON.stringify(initialMemberRows)) {
      setConfirmModalConfig({
        title: 'Unsaved Changes',
        subTitle: 'You have unsaved changes. Are you sure you want to cancel?',
        onConfirm: () => {
          toast.info('Action cancelled.');
          setMemberRows(JSON.parse(JSON.stringify(initialMemberRows)));
          setErrors({});
        },
      });
      setShowConfirmModal(true);
      return;
    }
    toast.info('Action cancelled.');
    setMemberRows(JSON.parse(JSON.stringify(initialMemberRows)));
    setErrors({});
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
    memberRows,
    errors,
    isLoading,
    isFetchingData,
    loadError,
    pageTitle,
    deletingMemberId,
    addMemberRow,
    handleDeleteMember,
    handleSubmit,
    handleChange,
    handleCancel,
    showConfirmModal,
    setShowConfirmModal,
    confirmModalConfig,
  };
}
