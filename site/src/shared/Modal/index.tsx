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
  hideCloseButton?: boolean;
  hideTopCloseButton?: boolean;
};

export default function Modal({
  isOpen,
  size,
  children,
  modalTitle,
  onClose,
  hideCloseButton = false,
  hideTopCloseButton = false,
}: Props) {
  return (
    <ModalComponent
      hideCloseButton={hideTopCloseButton}
      isOpen={isOpen}
      size={size}
      onClose={onClose}
    >
      <ModalContent className="w-[472px] max-h-[469px] !max-w-none">
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {modalTitle ?? 'Modal'}
            </ModalHeader>

            <ModalBody>{children}</ModalBody>

            {!hideCloseButton && (
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            )}
          </>
        )}
      </ModalContent>
    </ModalComponent>
  );
}
