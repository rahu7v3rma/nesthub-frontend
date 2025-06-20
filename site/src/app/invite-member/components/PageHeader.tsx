import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';
import React from 'react';

type PageHeaderProps = {
  title: string;
  isLoading: boolean;
  onCancel: () => void;
};

export function PageHeader({ title, isLoading, onCancel }: PageHeaderProps) {
  const router = useRouter();
  const disableActions = isLoading;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
      <div className="justify-between hidden md:flex items-center mb-4 gap-2">
        <button onClick={() => router.back()}>&larr;</button>
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
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
