'use client';
import {
  ModalBody,
  Modal as ModalComponent,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
} from '@heroui/react';

import Button from '@/shared/Button';

interface AlertProps {
  isOpen: boolean;
  alertTitle: string;
  children: React.ReactNode;
  size?: ModalProps['size'];
  setIsOpen: (open: boolean) => void;
}

const Alert = ({
  alertTitle,
  isOpen,
  size = 'md',
  children,
  setIsOpen,
}: AlertProps) => {
  return (
    <ModalComponent
      isOpen={isOpen}
      size={size}
      onClose={() => setIsOpen(false)}
    >
      <ModalContent className="p-9">
        {(onClose) => (
          <>
            <ModalHeader className="text-dark_black font-[700] font-[Figtree] text-xl justify-center p-0 mb-9">
              {alertTitle}
            </ModalHeader>
            <ModalBody className="p-0 mb-9">{children}</ModalBody>
            <ModalFooter className="justify-center">
              <Button className="w-full bg-dark_black" onClick={onClose}>
                GOT IT
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </ModalComponent>
  );
};

export default Alert;
