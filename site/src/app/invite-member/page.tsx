'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useMemberForm } from '@/hooks/useMemberForm';
import ConfirmationAlert from '@/shared/ConfirmationAlert';

import { ClientPageSkeleton } from './components/ClientPageSkeleton';
import { MemberFormRow } from './components/MemberFormRow';
import { PageHeader } from './components/PageHeader';

export default function InviteMemberPage() {
  const router = useRouter();

  const {
    memberRows,
    errors,
    isLoading,
    isFetchingData,
    loadError,
    pageTitle,
    addMemberRow,
    deletingMemberId,
    handleDeleteMember,
    handleSubmit,
    handleChange,
    handleCancel,
    showConfirmModal,
    setShowConfirmModal,
    confirmModalConfig,
  } = useMemberForm();

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
          title={pageTitle}
          isLoading={isLoading}
          onCancel={handleCancel}
        />

        <form id="client-form" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-6 mb-4">
            {memberRows.map((member, index) => (
              <MemberFormRow
                key={member.id ?? `new-${index}`}
                member={member}
                index={index}
                isLastRow={index === memberRows.length - 1}
                errors={errors[index]}
                isDeleting={
                  deletingMemberId !== null && deletingMemberId === member.id
                }
                isFormLoading={isLoading}
                addMemberRow={addMemberRow}
                onChange={handleChange}
                onDeleteMember={handleDeleteMember}
              />
            ))}
          </div>
        </form>
      </div>

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
