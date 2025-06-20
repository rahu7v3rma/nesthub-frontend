'use client';

import { useState } from 'react';

import Button from '@/shared/Button';
import Modal from '@/shared/Modal';
import Sort from '@/shared/Sort';

export default function Page() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div>
      <Button onClick={() => setShowModal(true)}>open modal</Button>
      <Modal
        modalTitle="Sort modal"
        isOpen={showModal}
        size="lg"
        onClose={() => {
          setShowModal(false);
        }}
      >
        <Sort />
      </Modal>
    </div>
  );
}
