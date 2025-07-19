'use client';

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@heroui/react';
import { ChangeEvent, useEffect, useState, FormEvent } from 'react';
import { toast } from 'react-toastify';

import { createClient, ErrorResponseType } from '@/services/api';
import Input from '@/shared/Input';

type ClientModalRow = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type AddClientModalProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
  onDataChange?: () => Promise<void>; // To refresh parent list after create
};

const joinName = (firstName: string = '', lastName: string = ''): string => {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
};

export default function AddClientModal({
  isOpen,
  onOpenChange,
  onClose,
  onDataChange,
}: AddClientModalProps) {
  const [clientRows, setClientRows] = useState<ClientModalRow[]>([
    { firstName: '', lastName: '', email: '', phone: '' },
  ]);
  const [errors, setErrors] = useState<{
    [index: number]: { [field: string]: string };
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setClientRows([{ firstName: '', lastName: '', email: '', phone: '' }]);
      setErrors({});
    }
  }, [isOpen]);

  const addMemberRow = () => {
    setClientRows([
      ...clientRows,
      { firstName: '', lastName: '', email: '', phone: '' },
    ]);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[clientRows.length];
      return newErrors;
    });
  };

  const removeMemberRow = (index: number) => {
    if (index === 0 || clientRows.length <= 1) return; // Can't remove parent or last row

    const newClients = clientRows.filter((_, i) => i !== index);
    setClientRows(newClients);

    setErrors((prevErrors) => {
      const updatedErrors: { [index: number]: { [field: string]: string } } =
        {};
      Object.keys(prevErrors).forEach((errIndexStr) => {
        const errIndex = parseInt(errIndexStr, 10);
        if (errIndex < index) {
          updatedErrors[errIndex] = prevErrors[errIndex];
        } else if (errIndex > index && prevErrors[errIndex]) {
          updatedErrors[errIndex - 1] = prevErrors[errIndex];
        }
      });
      return updatedErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: { [index: number]: { [field: string]: string } } = {};
    let isValid = true;

    clientRows.forEach((client, index) => {
      const fieldErrors: { [field: string]: string } = {};
      if (!client.firstName.trim()) {
        fieldErrors.firstName = 'Required';
      } else if (!/^[a-zA-Z\s-]+$/.test(client.firstName.trim())) {
        fieldErrors.firstName = 'Only letters, spaces, and hyphens allowed';
      }
      if (!client.lastName.trim()) {
        fieldErrors.lastName = 'Required';
      } else if (!/^[a-zA-Z\s-]+$/.test(client.lastName.trim())) {
        fieldErrors.lastName = 'Only letters, spaces, and hyphens allowed';
      }
      if (!client.email.trim()) {
        fieldErrors.email = 'Required';
      } else if (!/\S+@\S+\.\S+/.test(client.email)) {
        fieldErrors.email = 'Invalid format';
      }
      if (client.phone.trim() && !/^\+?[0-9\s-()]{7,}$/.test(client.phone)) {
        fieldErrors.phone = 'Invalid format';
      }

      if (Object.keys(fieldErrors).length > 0) {
        newErrors[index] = fieldErrors;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm() || isLoading) return;

    setIsLoading(true);

    const parentRow = clientRows[0];
    const parentName = joinName(parentRow.firstName, parentRow.lastName);

    try {
      const parentPayload = {
        name: parentName,
        email: parentRow.email,
        phone: parentRow.phone,
      };
      const membersPayload = clientRows.slice(1).map((memberRow) => ({
        name: joinName(memberRow.firstName, memberRow.lastName),
        email: memberRow.email,
        phone: memberRow.phone,
      }));

      const createPayload = {
        parent: parentPayload,
        ...(membersPayload.length > 0 && { members: membersPayload }),
      };

      const response = await createClient(createPayload);

      if (response.success) {
        toast.success(response.message || 'Client created successfully');
        if (onDataChange) await onDataChange();
        onClose();
      } else {
        const errorData =
          response.data?.parent_errors ||
          response.data?.member_errors ||
          response.data;
        let message = response.message || 'Failed to create client.';
        if (typeof errorData === 'object' && errorData !== null) {
          message += ` Details: ${JSON.stringify(errorData)}`;
        }
        toast.error(message);
      }
      // Reset state happens via useEffect on modal close/reopen
    } catch (err: any) {
      console.error('API Error:', err);
      const errorDetails = (err as ErrorResponseType)?.data;
      let message =
        (err as ErrorResponseType)?.message || 'An unexpected error occurred.';
      if (typeof errorDetails === 'object' && errorDetails !== null) {
        message += ` Details: ${JSON.stringify(errorDetails)}`;
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange =
    (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      // Validate name fields to only allow letters, spaces, and hyphens
      if ((name === 'firstName' || name === 'lastName') && value) {
        const lastChar = value[value.length - 1];
        if (!/^[a-zA-Z\s-]$/.test(lastChar)) {
          return; // Prevent non-alphabetic input
        }
      }

      // Validate phone field to only allow numbers and common phone symbols
      if (name === 'phone' && value) {
        const lastChar = value[value.length - 1];
        if (!/^[0-9\s+()-]$/.test(lastChar)) {
          return; // Prevent non-numeric/symbol input
        }
      }

      setClientRows((prevClients) =>
        prevClients.map((client, i) =>
          i === index ? { ...client, [name]: value } : client,
        ),
      );
      setErrors((prevErrors) => {
        const updatedRowErrors = { ...(prevErrors[index] || {}) };
        delete updatedRowErrors[name];
        const newErrors = { ...prevErrors };
        if (Object.keys(updatedRowErrors).length === 0) {
          delete newErrors[index];
        } else {
          newErrors[index] = updatedRowErrors;
        }
        return newErrors;
      });
    };

  const handleCloseModal = () => {
    if (isLoading) return;
    onClose();
  };

  return (
    <Modal
      size="5xl"
      isDismissable={!isLoading}
      isOpen={isOpen}
      hideCloseButton
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(modalClose) => (
          <>
            <form onSubmit={handleSubmit} noValidate>
              <ModalHeader className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-200 pb-4">
                <h2 className="text-2xl text-gray-800 font-semibold">
                  Add Client
                </h2>
                <div className="flex-wrap hidden md:flex gap-3">
                  <Button
                    size="lg"
                    variant="flat"
                    radius="full"
                    className="text-xs uppercase font-semibold !bg-gray-100 !text-gray-700 hover:!bg-gray-200"
                    onPress={handleCloseModal}
                    type="button"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="lg"
                    type="submit"
                    color="primary"
                    isLoading={isLoading}
                    radius="full"
                    className="text-xs uppercase font-semibold !bg-gray-800 !text-white"
                  >
                    Save Client
                  </Button>
                </div>
              </ModalHeader>

              <ModalBody className="py-6 max-h-[60vh] overflow-y-auto">
                <div className="flex flex-col gap-6">
                  {clientRows.map((client, index) => {
                    const isParentRow = index === 0;
                    const rowErrors = errors[index] || {};

                    return (
                      <div
                        key={index}
                        className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                      >
                        <div className="flex flex-col md:flex-row gap-3 w-full flex-grow">
                          <div className="w-full md:flex-1">
                            <Input
                              label={
                                isParentRow
                                  ? 'Primary First Name'
                                  : `Relationship ${index} First Name`
                              }
                              className="!bg-[#F9F9F9] !rounded-[48px] w-full h-[48px] !border-none px-4"
                              lableClass="text-[#A8A6B0] font-normal text-sm mb-1 ml-4"
                              onChange={handleChange(index)}
                              name="firstName"
                              value={client.firstName}
                              aria-invalid={!!rowErrors.firstName}
                              aria-describedby={
                                rowErrors.firstName
                                  ? `firstName-error-${index}`
                                  : undefined
                              }
                            />
                            {rowErrors.firstName && (
                              <p
                                id={`firstName-error-${index}`}
                                className="text-red-500 text-xs mt-1 ml-4"
                              >
                                {rowErrors.firstName}
                              </p>
                            )}
                          </div>
                          <div className="w-full md:flex-1">
                            <Input
                              label={
                                isParentRow
                                  ? 'Primary Last Name'
                                  : `Relationship ${index} Last Name`
                              }
                              className="!bg-[#F9F9F9] !rounded-[48px] w-full h-[48px] !border-none px-4"
                              lableClass="text-[#A8A6B0] font-normal text-sm mb-1 ml-4"
                              onChange={handleChange(index)}
                              name="lastName"
                              value={client.lastName}
                              aria-invalid={!!rowErrors.lastName}
                              aria-describedby={
                                rowErrors.lastName
                                  ? `lastName-error-${index}`
                                  : undefined
                              }
                            />
                            {rowErrors.lastName && (
                              <p
                                id={`lastName-error-${index}`}
                                className="text-red-500 text-xs mt-1 ml-4"
                              >
                                {rowErrors.lastName}
                              </p>
                            )}
                          </div>
                          <div className="w-full md:flex-1">
                            <Input
                              label={
                                isParentRow
                                  ? 'Primary Email'
                                  : `Relationship ${index} Email`
                              }
                              type="email"
                              className="!bg-[#F9F9F9] !rounded-[48px] w-full h-[48px] !border-none px-4"
                              lableClass="text-[#A8A6B0] font-normal text-sm mb-1 ml-4"
                              onChange={handleChange(index)}
                              name="email"
                              value={client.email}
                              aria-invalid={!!rowErrors.email}
                              aria-describedby={
                                rowErrors.email
                                  ? `email-error-${index}`
                                  : undefined
                              }
                            />
                            {rowErrors.email && (
                              <p
                                id={`email-error-${index}`}
                                className="text-red-500 text-xs mt-1 ml-4"
                              >
                                {rowErrors.email}
                              </p>
                            )}
                          </div>
                          <div className="w-full md:flex-1">
                            <Input
                              label={
                                isParentRow
                                  ? 'Primary Phone (Optional)'
                                  : `Relationship ${index} Phone (Optional)`
                              }
                              type="tel"
                              className="!bg-[#F9F9F9] !rounded-[48px] w-full h-[48px] !border-none px-4"
                              lableClass="text-[#A8A6B0] font-normal text-sm mb-1 ml-4"
                              onChange={handleChange(index)}
                              name="phone"
                              value={client.phone}
                              aria-invalid={!!rowErrors.phone}
                              aria-describedby={
                                rowErrors.phone
                                  ? `phone-error-${index}`
                                  : undefined
                              }
                            />
                            {rowErrors.phone && (
                              <p
                                id={`phone-error-${index}`}
                                className="text-red-500 text-xs mt-1 ml-4"
                              >
                                {rowErrors.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        {!isParentRow && (
                          <div className="w-full md:w-auto h-[48px] flex-shrink-0 flex items-center justify-end md:justify-center pt-1 md:pt-6">
                            <button
                              type="button"
                              onClick={() => removeMemberRow(index)}
                              className="flex items-center justify-center bg-gray-100 font-bold text-2xl leading-tight rounded-full w-[36px] h-[36px] flex-shrink-0 text-gray-500 cursor-pointer hover:bg-red-100 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Remove Relationship"
                              disabled={isLoading}
                            >
                              <span className="mb-1">-</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex justify-center md:justify-start">
                  <button
                    type="button"
                    onClick={addMemberRow}
                    className="flex items-center justify-center bg-[#F6F6F6] font-bold text-2xl leading-[30px] rounded-full w-[48px] h-[48px] flex-shrink-0 text-black cursor-pointer hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Add Member"
                    disabled={isLoading}
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-col md:hidden gap-3">
                  <Button
                    size="lg"
                    variant="flat"
                    radius="full"
                    className="text-xs uppercase font-semibold !bg-gray-100 !text-gray-700 hover:!bg-gray-200"
                    onPress={handleCloseModal}
                    type="button"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="lg"
                    type="submit"
                    color="primary"
                    isLoading={isLoading}
                    radius="full"
                    className="text-xs uppercase font-semibold !bg-gray-800 !text-white"
                  >
                    Save Client
                  </Button>
                </div>
              </ModalBody>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
