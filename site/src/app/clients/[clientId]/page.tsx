'use client';

import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useClientForm } from '@/hooks/useClientForm';
import ConfirmationAlert from '@/shared/ConfirmationAlert';

import { ClientFormRow } from './components/ClientFormRow';
import { ClientPageSkeleton } from './components/ClientPageSkeleton';
import { LikedPropertiesSection } from './components/LikedPropertiesSection';
import { PageHeader } from './components/PageHeader';

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();

  const { clientId } = params;

  const {
    clientRows,
    errors,
    isLoading,
    isReinviting,
    isFetchingData,
    loadError,
    pageTitle,
    deletingMemberId,
    addClientRow,
    handleDeleteMember,
    handleDeleteClient,
    handleReinviteClient,
    handleSubmit,
    handleChange,
    handleCancel,
    handleArchive,
    showConfirmModal,
    setShowConfirmModal,
    confirmModalConfig,
  } = useClientForm();

  if (isFetchingData) {
    return <ClientPageSkeleton />;
  }

  if (loadError) {
    return (
      <div className="p-6 md:p-10 bg-white rounded-xl shadow-md max-w-7xl mx-auto border border-red-300">
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar />
        <h1 className="text-2xl font-semibold text-red-700 mb-4">
          Error Loading Client
        </h1>
        <p className="text-red-600">{loadError}</p>
      </div>
    );
  }

  console.log('TTTTT ', clientRows);

  return (
    <div className="m-2 p-6 md:p-10 bg-white rounded-xl shadow-md max-w-7xl border border-gray-200">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <div className="flex mb-4 md:hidden">
        <button onClick={() => router.back()}>&larr;</button>
        <h1 className="text-2xl md:hidden font-semibold text-gray-800 mx-3">
          {pageTitle}
        </h1>
      </div>
      <div className="flex flex-col-reverse md:flex-col">
        <PageHeader
          isArchived={clientRows[0].isArchived}
          isEmailVerified={clientRows[0].isEmailVerified}
          title={pageTitle}
          isLoading={isLoading}
          isReinviting={isReinviting}
          isDeleting={!!deletingMemberId}
          onCancel={handleCancel}
          onArchive={handleArchive}
          onDeleteParent={handleDeleteClient}
          onReinvite={handleReinviteClient}
        />

        <form id="client-form" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-6 mb-4">
            {clientRows.map((client, index) => (
              <ClientFormRow
                key={client.id ?? `new-${index}`}
                client={client}
                index={index}
                errors={errors[index]}
                isParent={index === 0}
                isDeleting={
                  deletingMemberId !== null && deletingMemberId === client.id
                }
                isFormLoading={isLoading}
                onChange={handleChange}
                onDeleteMember={handleDeleteMember}
              />
            ))}
          </div>

          <div className="flex justify-center md:justify-start mb-12">
            <button
              type="button"
              onClick={addClientRow}
              className="flex items-center justify-center bg-[#F6F6F6] font-bold text-2xl leading-[30px] rounded-full w-[48px] h-[48px] flex-shrink-0 text-black cursor-pointer hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Add Relationship"
              disabled={isLoading || !!deletingMemberId}
            >
              {' '}
              +{' '}
            </button>
          </div>
        </form>
      </div>

      <LikedPropertiesSection clientId={clientId as string} />

      {showConfirmModal && confirmModalConfig && (
        <ConfirmationAlert
          title={confirmModalConfig.title}
          subTitle={confirmModalConfig.subTitle}
          confirmBtnTitle="Confirm"
          onDismissBtnHandler={() => setShowConfirmModal(false)}
          onConfirmBtnHandler={() => {
            confirmModalConfig.onConfirm();
            setShowConfirmModal(false);
          }}
        />
      )}
    </div>
  );
}
