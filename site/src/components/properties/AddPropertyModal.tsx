'use client';

import {
  Button,
  Checkbox,
  DatePicker,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ScrollShadow,
  Tab,
  Tabs,
  Textarea,
  TimeInput,
} from '@heroui/react';
import { parseDate, today } from '@internationalized/date';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useCallback, useEffect, useState } from 'react';
import { FaRegClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

import { useRealEstate } from '@/hooks/useRealEstate';
import { Property, UpdatePropertyPayload } from '@/interfaces/property';
import {
  MLSDetailResponse,
  MLSDetailPropertyResponse,
} from '@/interfaces/realEstateApi';
import { addProperty, updateProperty } from '@/services/api';
import TimePicker from '@/shared/TimePicker/TimePicker';

type AddPropertyModalProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
  onAdd: () => void;
  mode?: 'add' | 'edit';
  propertyId?: number | null;
  initialEditValues?: {
    isDeadlineChecked?: boolean;
    deadlineDate?: string | null;
    deadlineTime?: string | null;
    note?: string;
  };
};

type Location = {
  accuracy?: number;
  lat: number;
  lng: number;
  timestamp?: number;
};

export default function AddPropertyModal({
  isOpen,
  onOpenChange,
  onClose,
  onAdd,
  mode = 'add',
  propertyId,
  initialEditValues = {
    isDeadlineChecked: false,
    deadlineDate: null,
    deadlineTime: null,
    note: '',
  },
}: AddPropertyModalProps) {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>({});
  const [userType, setUserType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const PropertySchema = Yup.object().shape({
    address: Yup.string().required('Please enter address'),
  });

  const EditSchema = Yup.object().shape({
    note: Yup.string(),
    deadlineDate: Yup.string().when('isDeadlineChecked', {
      is: (isDeadlineChecked: boolean) => !isDeadlineChecked,
      then: (schema) => schema.required('Deadline date is required'),
    }),
    deadlineTime: Yup.string().when('isDeadlineChecked', {
      is: (isDeadlineChecked: boolean) => !isDeadlineChecked,
      then: (schema) => schema.required('Deadline time is required'),
    }),
  });

  const { getMLSDetail, getMLSSearch, loading, addLoading, error } =
    useRealEstate();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserType = localStorage.getItem('user_type');
      setUserType(storedUserType);
    }
    handleAddPropertyLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isOpen && mode === 'add') {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode]);

  const getLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (err) => {
          let errorMessage;
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage =
                'Location access was denied. Please enable permissions.';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case err.TIMEOUT:
              errorMessage = 'The request to get location timed out.';
              break;
            default:
              errorMessage = 'An unknown error occurred.';
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    });
  };

  const handleAddPropertyLocation = async () => {
    setIsLoading(true);
    try {
      const location = await getLocation();

      const getlocation = {
        latitude: location.lat,
        longitude: location.lng,
      };
      localStorage.setItem('userLocation', JSON.stringify(getlocation));
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const submitHandler = useCallback(
    async (values: any) => {
      const deadlineDate = values.deadlineDate;
      const deadlineTime = values.deadlineTime;

      let combinedDatetime: string | null = null;

      if (!values.isDeadlineChecked && deadlineDate && deadlineTime) {
        combinedDatetime = `${deadlineDate}T${deadlineTime}`;
      }

      let deadlineISO: Date | undefined = undefined;
      if (combinedDatetime && !isNaN(new Date(combinedDatetime).getTime())) {
        deadlineISO = new Date(combinedDatetime);
      }

      if (selectedProperty && selectedProperty.id) {
        const response = (await getMLSDetail({
          listing_id: Number(selectedProperty?.id),
        })) as MLSDetailPropertyResponse;

        if (response.data) {
          const payload = {
            name: response.data.listingAgent?.fullName || '',
            price: response.data.listPrice || 0,
            listing_id: selectedProperty.id,
            no_of_beds: response.data.property?.bedroomsTotal || 0,
            no_of_baths: response.data.property?.bathroomsTotal || 0,
            square_feet_size: response.data.property?.livingArea || 0,
            image: response.data.media?.primaryListingImageUrl || null,
            photosList: response.data.media?.photosList || null,
            longitude: response.data.property?.longitude || null,
            latitude: response.data.property?.latitude || null,
            additional_information: response.data.publicRemarks || null,
            address: response.data.address?.unparsedAddress || null,
            city: response.data.address?.city || null,
            county_or_parish: response.data.address?.countyOrParish || null,
            state_or_province: response.data.address?.stateOrProvince || null,
            zip_code: response.data.address?.zipCode || null,
            deadline_datetime: combinedDatetime || deadlineISO,
            is_deadline_checked: values.isDeadlineChecked,
            note: values.note,
            user_id: localStorage.getItem('clientId'),
          };
          await addProperty(payload)
            .then(() => {
              onClose();
              onAdd();
              setSelectedProperty({});
              toast.success('Property added successfully');
            })
            .catch((err) => {
              onClose();
              setSelectedProperty({});
              toast.error(
                err.data.message ? err.data.message : 'Failed to add property',
              );
            });
        } else {
          onClose();
          setSelectedProperty({});
          toast.error('Failed to add property');
        }
      } else {
        toast.error('Select the address from dropdown');
      }
    },
    [onClose, onAdd, selectedProperty, getMLSDetail],
  );

  const handleEditSubmit = useCallback(
    async (values: {
      deadlineDate?: string | null;
      deadlineTime?: string | null;
      isDeadlineChecked: boolean;
      note?: string;
    }) => {
      if (!propertyId) {
        toast.error('Property ID is missing');
        return;
      }

      let deadline_datetime: string | null = null;

      if (
        !values.isDeadlineChecked &&
        values.deadlineDate &&
        values.deadlineTime
      ) {
        deadline_datetime = `${values.deadlineDate}T${values.deadlineTime}`;
      }

      const payload: UpdatePropertyPayload = {
        id: propertyId,
        ...(!values.isDeadlineChecked && { deadline_datetime }),
        is_deadline_checked: values.isDeadlineChecked,
        note: values.note?.trim() === '' ? null : values.note || undefined,
      };

      try {
        await updateProperty(payload);
        onClose();
        onAdd();
        setSelectedProperty({});
        toast.success('Property updated successfully');
      } catch (err: any) {
        onClose();
        setSelectedProperty({});
        toast.error(
          err.data?.message ? err.data.message : 'Failed to update property',
        );
      }
    },
    [onClose, onAdd, propertyId],
  );

  const handleSearch = useCallback(
    async (searchQuery?: string) => {
      try {
        const storedLocation = localStorage.getItem('userLocation');
        let locationData = {
          latitude: 0,
          longitude: 0,
        };

        if (storedLocation) {
          try {
            const parsedLocation = JSON.parse(storedLocation) as {
              latitude: number;
              longitude: number;
            };
            locationData = parsedLocation;
          } catch (e) {
            console.warn('Failed to parse stored location', e);
          }
        }
        const searchParams = searchQuery
          ? { address: searchQuery }
          : {
              latitude: locationData.latitude,
              longitude: locationData.longitude,
            };

        const response = (await getMLSSearch(
          searchParams,
        )) as MLSDetailResponse;

        if (response?.data && response.data.length > 0) {
          const newProperties: Property[] = response.data.map((prop) => {
            return {
              id:
                prop.listingId ||
                `api-${prop.listing.address.unparsedAddress.replace(/\s+/g, '-').toLowerCase()}`,
              address:
                prop.listing.address.unparsedAddress || 'No address available',
              city: prop.listing.address.city || 'No city available',
              county_or_parish:
                prop.listing.address.countyOrParish ||
                'No countyOrParish available',
              state_or_province:
                prop.listing.address.stateOrProvince ||
                'No stateOrProvince available',
              zip_code: prop.listing.address.zipCode || 'No zipCode available',
              name: prop.listingAgent?.fullName || 'Unknown',
              image:
                prop.listing.media?.primaryListingImageUrl ||
                'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
              no_of_baths: prop.listing.property?.bathroomsTotal || 0,
              no_of_beds: prop.listing.property?.bedroomsTotal || 0,
              price: prop.listing?.listPriceLow || 0,
              square_feet_size: prop.listing.property?.livingArea || 0,
              description: prop.listing?.publicRemarks || '',
              status: prop.listing?.standardStatus || '',
              yearBuilt: prop.listing.property?.yearBuilt || '',
              propertyType: prop.listing.property?.propertyType || '',
              location: {
                latitude: prop.listing.property?.latitude || 0,
                longitude: prop.listing.property?.longitude || 0,
              },
              is_property_viewed_by_client: false,
              has_disclosures: false,
              offers: [],
              has_unread_messages: false,
            };
          });

          setSearchResults(newProperties);

          return;
        }
      } catch (err) {
        console.error('Error searching properties:', err);
      }
    },
    [getMLSSearch],
  );

  return (
    <Modal
      size="xl"
      isDismissable={false}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      style={userType !== 'realtor' ? { minHeight: '400px' } : {}}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="justify-center text-2xl text-primary">
              {mode === 'add' ? 'Add Property' : 'Edit Property'}
            </ModalHeader>
            <ModalBody>
              {mode === 'add' ? (
                <div className="p-3">
                  <Formik
                    initialValues={{
                      address: '',
                      isDeadlineChecked: false,
                      deadlineDate: null,
                      deadlineTime: null,
                      note: '',
                    }}
                    validationSchema={PropertySchema}
                    onSubmit={submitHandler}
                  >
                    {({ values, setFieldValue }) => (
                      <Form>
                        <Field name="address">
                          {({ field }: any) => (
                            <div className="relative">
                              <Input
                                label="Property address"
                                labelPlacement="outside"
                                placeholder="Address"
                                size="lg"
                                radius="full"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleSearch(e.target.value);
                                }}
                              />
                              {!loading && searchResults.length > 0 && (
                                <div className="absolute z-50 w-full max-h-48 overflow-y-auto border rounded-lg bg-white shadow mt-2">
                                  {searchResults.map((property, index) => {
                                    const fullAddress = `${property.address}${property.city ? `, ${property.city}` : ''}${property.state_or_province ? `, ${property.state_or_province}` : ''}`;

                                    return (
                                      <div
                                        key={index}
                                        className="p-2 cursor-pointer hover:bg-gray-100"
                                        onClick={() => {
                                          setFieldValue('address', fullAddress);
                                          setSelectedProperty(property);
                                          setSearchResults([]);
                                        }}
                                      >
                                        {fullAddress}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {loading && (
                                <div className="absolute z-50 w-full mt-2 flex justify-center items-center h-28 bg-white shadow rounded-lg">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                                </div>
                              )}
                            </div>
                          )}
                        </Field>
                        <ErrorMessage
                          name="address"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                        {userType === 'realtor' && (
                          <>
                            <Field name="isDeadlineChecked">
                              {({ field }: any) => (
                                <Checkbox className="my-1" {...field}>
                                  No offer deadline
                                </Checkbox>
                              )}
                            </Field>
                            {!values.isDeadlineChecked && (
                              <div className="flex flex-col md:flex-row gap-4 w-full">
                                <DatePicker
                                  name="deadlineDate"
                                  label="Deadline date"
                                  labelPlacement="outside"
                                  size="lg"
                                  radius="full"
                                  isDateUnavailable={(date) =>
                                    date.compare(today('UTC')) < 0
                                  }
                                  onChange={(value) =>
                                    setFieldValue(
                                      'deadlineDate',
                                      value && value.toString(),
                                    )
                                  }
                                />
                                <TimePicker
                                  value={values.deadlineTime}
                                  onChange={(value) =>
                                    setFieldValue('deadlineTime', value)
                                  }
                                />
                              </div>
                            )}
                            <Divider className="my-2" />
                            <Field name="note">
                              {({ field }: any) => (
                                <Textarea
                                  label="Notes for the client"
                                  labelPlacement="outside"
                                  placeholder="Notes"
                                  rows={4}
                                  disableAutosize
                                  size="lg"
                                  radius="full"
                                  {...field}
                                />
                              )}
                            </Field>
                          </>
                        )}
                        {userType !== 'realtor' && (
                          <div
                            style={
                              userType !== 'realtor'
                                ? { padding: '1rem 0' }
                                : {}
                            }
                          ></div>
                        )}
                        <Button
                          type="submit"
                          color="primary"
                          size="lg"
                          radius="full"
                          className="w-full mt-4"
                        >
                          {addLoading ? (
                            <div className="flex">
                              <div className="px-4">Adding Property</div>
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-light" />
                            </div>
                          ) : (
                            <span>Add Property</span>
                          )}
                        </Button>
                      </Form>
                    )}
                  </Formik>
                </div>
              ) : (
                <div className="p-3">
                  <Formik
                    initialValues={{
                      isDeadlineChecked:
                        initialEditValues.isDeadlineChecked || false,
                      deadlineDate: initialEditValues.deadlineDate || null,
                      deadlineTime: initialEditValues.deadlineTime || null,
                      note: initialEditValues.note || '',
                    }}
                    validationSchema={EditSchema}
                    onSubmit={handleEditSubmit}
                  >
                    {({ values, setFieldValue }) => (
                      <Form>
                        {userType === 'realtor' && (
                          <>
                            <Field name="isDeadlineChecked">
                              {({ field }: any) => (
                                <Checkbox
                                  className="my-1"
                                  {...field}
                                  isSelected={field.value}
                                >
                                  No offer deadline
                                </Checkbox>
                              )}
                            </Field>
                            {!values.isDeadlineChecked && (
                              <div className="flex flex-col md:flex-row gap-4 w-full">
                                <DatePicker
                                  name="deadlineDate"
                                  label="Deadline date"
                                  labelPlacement="outside"
                                  size="lg"
                                  radius="full"
                                  defaultValue={
                                    initialEditValues.deadlineDate
                                      ? parseDate(
                                          initialEditValues.deadlineDate,
                                        )
                                      : today('UTC').add({ days: 1 })
                                  }
                                  isDateUnavailable={(date) =>
                                    date.compare(today('UTC')) < 0
                                  }
                                  onChange={(value) =>
                                    setFieldValue(
                                      'deadlineDate',
                                      value && value.toString(),
                                    )
                                  }
                                />
                                <TimePicker
                                  value={values.deadlineTime}
                                  onChange={(value) =>
                                    setFieldValue('deadlineTime', value)
                                  }
                                />
                              </div>
                            )}
                            <Divider className="my-2" />
                            <Field name="note">
                              {({ field }: any) => (
                                <Textarea
                                  label="Notes for the client"
                                  labelPlacement="outside"
                                  placeholder="Notes"
                                  rows={4}
                                  disableAutosize
                                  size="lg"
                                  radius="full"
                                  {...field}
                                />
                              )}
                            </Field>
                          </>
                        )}
                        <Button
                          type="submit"
                          color="primary"
                          size="lg"
                          radius="full"
                          className="w-full mt-4"
                        >
                          <span>Save Changes</span>
                        </Button>
                      </Form>
                    )}
                  </Formik>
                </div>
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
