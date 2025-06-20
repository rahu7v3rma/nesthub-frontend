import { Spinner as CustomSpinner } from '@heroui/react';

export default function Spinner() {
  return (
    <div className="flex flex-wrap items-end gap-8">
      <CustomSpinner
        classNames={{ label: 'text-foreground mt-4' }}
        label="simple"
        variant="simple"
      />
    </div>
  );
}
