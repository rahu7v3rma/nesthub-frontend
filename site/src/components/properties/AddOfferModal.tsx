'use client';

import {
  Button,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Textarea,
} from '@heroui/react';
import { today, parseDate, getLocalTimeZone } from '@internationalized/date';
import { ErrorMessage, Form, Formik } from 'formik';
import { type ChangeEvent, useCallback, useState } from 'react';
import { IconType } from 'react-icons';
import {
  BsFillCreditCardFill,
  BsClockFill,
  BsCurrencyDollar,
} from 'react-icons/bs';
import { IoIosListBox, IoIosCheckmark } from 'react-icons/io';
import { MdSignalCellularAlt, MdSearch } from 'react-icons/md';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

import { addOffer } from '@/services/api';

type Props = {
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
};

interface AdditionalInfoItem {
  id: string;
  label: string;
  Icon: IconType;
}

const LoanIcon = () => {
  return (
    <div className="relative flex w-10 h-10">
      <BsFillCreditCardFill className="text-black text-2xl m-auto" />
      <BsClockFill className="absolute top-5 right-1 text-sm bg-[#F6F6F6] rounded-full p-0.5" />
    </div>
  );
};

const AppraisalIcon = () => {
  return (
    <div className="relative flex w-10 h-10">
      <MdSignalCellularAlt className="transform -scale-x-100 text-black text-2xl m-auto" />
      <MdSearch className="absolute top-[8px] right-[9px] text-sm bg-[#F6F6F6] rounded-full p-[0]" />
    </div>
  );
};

const InspectionIcon = () => {
  return (
    <div className="relative flex w-10 h-10">
      <IoIosListBox className="text-black text-2xl m-auto" />
      <IoIosCheckmark className="absolute top-5 right-1 text-sm bg-[#F6F6F6] rounded-full" />
    </div>
  );
};

const additionalInfoOptions: AdditionalInfoItem[] = [
  { id: 'loan', label: 'Loan', Icon: LoanIcon },
  { id: 'appraisal', label: 'Appraisal', Icon: AppraisalIcon },
  { id: 'inspection', label: 'Inspection', Icon: InspectionIcon },
];

const labelToIconMap = new Map(
  additionalInfoOptions.map((option) => [option.label, option.Icon]),
);

export default function AddOfferModal({
  isOpen,
  onOpenChange,
  onClose,
}: Props) {
  const [selectedAdditionalInfo, setSelectedAdditionalInfo] = useState<
    string[]
  >([]);

  // Get current date in UTC
  const now = new Date();
  const currentDate = parseDate(
    `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`,
  );

  const validationSchema = Yup.object().shape({
    amount: Yup.string().required('Please enter amount'),
    offerDate: Yup.string().required('Please select offer date'),
  });

  const toggleAdditionalInfo = (id: string) => {
    setSelectedAdditionalInfo((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const submitHandler = useCallback(
    async (values: {
      amount: string;
      description: string;
      offerDate: string;
    }) => {
      const payload = {
        amount: values?.amount.replace(/[^0-9]/g, ''),
        description: values?.description,
        offer_date: values.offerDate,
        realtor_property_id: localStorage.getItem('realtor_property_id'),
        contingencies_info:
          selectedAdditionalInfo.length > 0
            ? selectedAdditionalInfo
            : undefined,
      };

      await addOffer(payload)
        .then(() => {
          onClose();
          toast.success('Offer added successfully');
          setSelectedAdditionalInfo([]);
          onOpenChange();
        })
        .catch((err) => {
          const error =
            err?.data?.amount?.[0] || err?.message || 'Failed to add offer';
          setSelectedAdditionalInfo([]);
          onClose();
          toast.error(error);
        });
    },
    [onClose, onOpenChange, selectedAdditionalInfo],
  );

  const onOfferAmountChange = (
    event: ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: string) => void,
  ) => {
    const value = event.target.value;
    let formattedValue = value.replace(/[^0-9$,]/g, '');

    if (formattedValue.includes('$')) {
      formattedValue = formattedValue.replace(/\$/g, '');
      formattedValue = '$' + formattedValue;
    }

    formattedValue = formattedValue.replace(/^,+/g, '');
    formattedValue = formattedValue.replace(/,+/g, ',');
    setFieldValue('amount', formattedValue);
  };

  return (
    <Modal
      size="xl"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={onClose}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="justify-center text-2xl text-primary">
              Add Offer
            </ModalHeader>
            <ModalBody>
              <div className="p-3">
                <Formik
                  initialValues={{
                    amount: '',
                    description: '',
                    offerDate: currentDate.toString(),
                  }}
                  validationSchema={validationSchema}
                  onSubmit={submitHandler}
                >
                  {({ handleChange, values, setFieldValue }) => (
                    <Form>
                      <div className="flex flex-col md:flex-row gap-4 w-full">
                        <DatePicker
                          name="offerDate"
                          label="Offer date"
                          labelPlacement="outside"
                          selectorButtonPlacement="start"
                          size="lg"
                          radius="full"
                          defaultValue={currentDate}
                          minValue={today(getLocalTimeZone())}
                          onChange={(value) => {
                            if (value) {
                              setFieldValue('offerDate', value.toString());
                            }
                          }}
                          classNames={{
                            inputWrapper:
                              'bg-gray-50 border-gray-200 hover:border-gray-300 focus-within:border-primary shadow-none',
                            label: 'text-gray-700 font-medium',
                          }}
                        />
                        <Input
                          name="amount"
                          type="text"
                          onChange={(evt) =>
                            onOfferAmountChange(evt, setFieldValue)
                          }
                          value={values?.amount}
                          label="Amount"
                          labelPlacement="outside"
                          startContent={
                            <BsCurrencyDollar className="text-gray-900" />
                          }
                          size="lg"
                          radius="full"
                          classNames={{
                            inputWrapper:
                              'bg-gray-50 border-gray-200 hover:border-gray-300 focus-within:border-primary shadow-none mt-1',
                            input: 'bg-transparent',
                            label: 'text-gray-700 font-medium mt-[2px]',
                          }}
                        />
                      </div>
                      <div className="w-full flex justify-start ml-2 mb-2">
                        <ErrorMessage
                          name="amount"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                        <ErrorMessage
                          name="offerDate"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div className="mt-8">
                        <Textarea
                          label="Extra information (optional)"
                          labelPlacement="outside"
                          rows={4}
                          disableAutosize
                          size="lg"
                          radius="full"
                          name="description"
                          isRequired={false}
                          onChange={handleChange}
                          value={values?.description}
                          classNames={{
                            inputWrapper:
                              'bg-gray-50 border-gray-200 hover:border-gray-300 focus-within:border-primary shadow-none',
                            input: 'bg-transparent',
                            label: 'text-gray-700 font-medium',
                          }}
                        />
                        <div className="w-full flex justify-start ml-2 mb-2">
                          <ErrorMessage
                            name="description"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>
                      </div>

                      {/* Additional Info Section */}
                      <div className="mt-8 mb-6">
                        <p className="text-medium font-medium text-gray-700 mb-3">
                          Contingencies (optional)
                        </p>
                        <div className="flex gap-2">
                          {additionalInfoOptions.map((item) => (
                            <div
                              key={item.id}
                              className="flex flex-col items-center text-center w-full max-w-[100px]"
                            >
                              <button
                                type="button"
                                onClick={() => toggleAdditionalInfo(item.id)}
                                aria-pressed={selectedAdditionalInfo.includes(
                                  item.id,
                                )}
                                className={`size-10 rounded-full flex items-center justify-center mb-1.5 transition-all duration-150 ease-in-out
                                ${
                                  selectedAdditionalInfo.includes(item.id)
                                    ? 'bg-[#F6F6F6] ring-2 ring-primary'
                                    : 'bg-[#F6F6F6] hover:bg-gray-300'
                                }`}
                              >
                                <item.Icon
                                  className={`${
                                    selectedAdditionalInfo.includes(item.id)
                                      ? 'text-primary'
                                      : 'text-gray-900'
                                  }`}
                                />
                              </button>
                              <span className="text-xs text-gray-600 leading-tight">
                                {item.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        color="primary"
                        size="lg"
                        radius="full"
                        className="w-full mt-4"
                      >
                        Save new offer
                      </Button>
                    </Form>
                  )}
                </Formik>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
