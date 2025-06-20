import {
  Modal as ModalComponent,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  ModalFooter,
  ModalProps,
} from '@heroui/react';

type Props = Required<Pick<ModalProps, 'size' | 'onClose' | 'isOpen'>> & {
  modalTitle?: string;
  children?: React.ReactNode;
};

export default function Modal({
  isOpen,
  size,
  children,
  modalTitle,
  onClose,
}: Props) {
  return (
    <ModalComponent isOpen={isOpen} size={size} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {modalTitle ?? 'Modal'}
            </ModalHeader>
            <ModalBody>{children}</ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </ModalComponent>
  );
}
