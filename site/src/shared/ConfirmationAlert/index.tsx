import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@heroui/react';
import Image from 'next/image';
import React, { FunctionComponent } from 'react';

type Props = {
  title: string;
  subTitle?: string;
  confirmBtnTitle: string;
  onDismissBtnHandler: () => void;
  onConfirmBtnHandler: () => void;
};

const ConfirmationAlert: FunctionComponent<Props> = ({
  title,
  subTitle,
  confirmBtnTitle = 'Confirm',
  onDismissBtnHandler,
  onConfirmBtnHandler,
}: Props) => {
  return (
    <Modal
      size="md"
      isDismissable={true}
      isOpen={true}
      hideCloseButton
      onOpenChange={onDismissBtnHandler}
    >
      <ModalContent className="border-2">
        {() => (
          <>
            <ModalHeader className="flex items-center justify-between w-full pt-6 pb-1">
              <Image
                src={'/svgs/back-btn.svg'}
                width={20}
                height={20}
                alt="Back"
                className="cursor-pointer"
                onClick={onDismissBtnHandler}
              />
              <span className="flex-1 text-center text-lg font-semibold text-[#2D2C31]">
                {title}
              </span>
              <Image
                src={'/svgs/close-btn.svg'}
                width={20}
                height={20}
                alt="Close"
                className="cursor-pointer"
                onClick={onDismissBtnHandler}
              />
            </ModalHeader>
            <ModalBody className="px-6">
              {subTitle && (
                <p className="text-center text-[#5E5E61]">{subTitle}</p>
              )}
              <Button
                size="lg"
                color="primary"
                radius="full"
                className="w-full my-4 text-xs uppercase font-semibold !bg-gray-800 !text-white hover:!bg-gray-700"
                onPress={onConfirmBtnHandler}
              >
                {confirmBtnTitle}
              </Button>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationAlert;
