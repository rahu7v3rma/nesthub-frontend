import { Button } from '@heroui/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

type PageHeaderProps = {
  isArchived?: boolean;
  title: string;
  isLoading: boolean;
  isDeleting: boolean;
  onCancel: () => void;
  onArchive: (previousState: boolean | null) => void;
  onDeleteParent: () => void;
};

export function PageHeader({
  isArchived,
  title,
  isLoading,
  isDeleting,
  onCancel,
  onArchive,
  onDeleteParent,
}: PageHeaderProps) {
  const router = useRouter();
  const disableActions = isLoading || isDeleting;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
      <div className="justify-between hidden md:flex items-center mb-4 gap-2">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-[30px] h-[30px] rounded-full hover:bg-gray-200 transition-colors"
        >
          <Image src={'/svgs/back-btn.svg'} width={20} height={20} alt="Back" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      </div>
      <div className="flex flex-col md:flex-row md:flex-wrap gap-3 w-full md:w-[unset]">
        <Button
          size="lg"
          variant="flat"
          radius="full"
          className="text-xs uppercase font-semibold !bg-[#F6F6F6] !text-gray-700"
          onPress={onCancel}
          type="button"
          disabled={disableActions}
        >
          {' '}
          Cancel{' '}
        </Button>
        <Button
          size="lg"
          variant="flat"
          radius="full"
          className="text-xs uppercase font-semibold !bg-[#F6F6F6] !text-gray-700"
          onPress={() => {
            onArchive(isArchived === undefined ? null : isArchived);
          }}
          type="button"
          disabled={disableActions}
        >
          {isArchived ? 'Archive' : 'Unarchive'}{' '}
        </Button>
        <button
          type="button"
          onClick={onDeleteParent}
          className={`py-2 px-4 text-xs uppercase font-semibold rounded-full !bg-red-50 !text-red-600 hover:!bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Delete Client"
          disabled={disableActions}
        >
          Delete Client
        </button>
        <Button
          size="lg"
          type="submit"
          form="client-form"
          color="primary"
          isLoading={isLoading}
          radius="full"
          className="text-xs uppercase font-semibold !bg-gray-800 !text-white"
          disabled={disableActions}
        >
          {' '}
          Save{' '}
        </Button>
      </div>
    </div>
  );
}
