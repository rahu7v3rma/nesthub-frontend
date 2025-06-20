'use client';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Tab,
  Tabs,
  useDisclosure,
  Chip,
  ScrollShadow,
} from '@heroui/react';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  IoCloudUploadOutline,
  IoCloseCircleOutline,
  IoDownloadOutline,
  IoLinkOutline,
  IoCalendarOutline,
  IoInformationCircleOutline,
  IoDocumentTextOutline,
  IoDocumentAttachOutline,
} from 'react-icons/io5';
import { toast } from 'react-toastify';

import {
  PropertyDisclosure,
  PropertyDisclosureFile,
} from '@/interfaces/property';
import { createDisclosure } from '@/services/api';

// Helper to get file name from path
const getFileNameFromPath = (path: string): string => {
  if (!path) return 'Unnamed File';
  return decodeURIComponent(path.split('/').pop() || 'Unnamed File');
};

type AddDisclosureModalProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
  propertyId: string;
  onAddSuccess: () => void;
};

function AddDisclosureModal({
  isOpen,
  onOpenChange,
  onClose,
  propertyId,
  onAddSuccess,
}: AddDisclosureModalProps) {
  const [selectedTab, setSelectedTab] = useState<'upload' | 'link'>('link');
  const [disclosureName, setDisclosureName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [linkUrlError, setLinkUrlError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles((prevFiles) =>
      prevFiles.filter((file) => file !== fileToRemove),
    );
  };

  const resetForm = useCallback(() => {
    setDisclosureName('');
    setLinkUrl('');
    setUploadedFiles([]);
    setSelectedTab('upload');
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleSave = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    const formData = new FormData();
    formData.append(
      'realtor_property_id',
      localStorage.getItem('realtor_property_id') || '',
    );
    let hasContent = false;

    if (disclosureName.trim()) {
      formData.append('name', disclosureName.trim());
    }
    // Description is not part of the form, backend handles it as nullable

    if (selectedTab === 'upload') {
      if (uploadedFiles.length > 0) {
        uploadedFiles.forEach((file) => {
          formData.append('files', file);
        });
        hasContent = true;
      }
    } else if (selectedTab === 'link') {
      if (!linkUrl.trim()) {
        toast.error('Please provide a link URL.');
        setIsLoading(false);
        return;
      }
      if (!linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
        toast.error(
          'Please enter a valid URL starting with http:// or https://',
        );
        setIsLoading(false);
        return;
      }
      formData.append('url', linkUrl.trim());
      hasContent = true;

      // If disclosureName (overall name) wasn't provided, derive it from URL
      if (!disclosureName.trim()) {
        try {
          const urlObj = new URL(linkUrl.trim());
          let pathName = urlObj.pathname;
          if (pathName.endsWith('/') && pathName.length > 1) {
            pathName = pathName.slice(0, -1);
          }
          const derivedName =
            urlObj.hostname + (pathName === '/' ? '' : pathName);
          formData.append('name', derivedName);
        } catch (e) {
          // If name couldn't be derived and wasn't set, backend will handle it as null
          formData.append('name', 'Linked Disclosure'); // Fallback name if not provided and derivation fails
        }
      }
    }

    if (!hasContent) {
      toast.error('Please upload at least one file or provide a link URL.');
      setIsLoading(false);
      return;
    }

    try {
      await createDisclosure(Number(propertyId), formData);
      toast.success('Disclosure added successfully');
      onAddSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Failed to add disclosure:', error);
      toast.error(
        error?.data?.message ||
          error?.message ||
          'Failed to add disclosure. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    disclosureName,
    linkUrl,
    selectedTab,
    propertyId,
    onAddSuccess,
    handleClose,
    uploadedFiles,
  ]);

  const selectedFilesDisplay = useMemo(
    () =>
      uploadedFiles.map((file, index) => (
        <Chip
          key={index}
          onClose={() => removeFile(file)}
          variant="flat"
          size="sm"
        >
          {file.name} ({(file.size / 1024).toFixed(2)} KB)
        </Chip>
      )),
    [uploadedFiles],
  );

  const validateUrl = (url: any) => {
    if (!url.trim()) return 'Please enter a URL';
    if (!/^https?:\/\/.+\..+/.test(url.trim())) {
      return 'Please enter a valid URL (include http:// or https://)';
    }
    return '';
  };

  return (
    <Modal
      size="xl"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={false}
    >
      <ModalContent>
        {(onCloseFromModal) => (
          <>
            <ModalHeader className="justify-center text-2xl text-primary mt-3">
              Add disclosure
            </ModalHeader>

            <ModalBody className="pb-6 pt-2">
              <Tabs
                key={selectedTab}
                selectedKey={selectedTab}
                onSelectionChange={(key) => {
                  setSelectedTab(key as 'upload' | 'link');
                  // clear other tab's data
                  if (key === 'upload') setLinkUrl('');
                  if (key === 'upload') setDisclosureName('');
                  if (key === 'link') setUploadedFiles([]);
                }}
                color="primary"
                radius="full"
                size="lg"
                classNames={{
                  base: 'justify-center',
                  tabList: 'p-0 gap-0',
                  tab: 'h-12',
                  tabContent:
                    'text-xs font-semibold text-foreground group-data-[selected=true]:text-primary-foreground',
                }}
              >
                <Tab key="upload" title="UPLOAD FILE">
                  <div className="space-y-4 pt-1">
                    <Input
                      label="File name"
                      labelPlacement="outside"
                      placeholder="E.g., Inspection Report"
                      value={disclosureName}
                      onChange={(e) => {
                        const value = e.target.value.trimStart();
                        if (value !== e.target.value) {
                          setDisclosureName(value);
                          return;
                        }
                        setDisclosureName(value);
                      }}
                      radius="full"
                      size="lg"
                    />
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer ${
                        isDragActive ? 'border-primary bg-primary-50' : ''
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="flex justify-center mb-2">
                        <div className="w-9 h-9 rounded-full bg-[#EDEDED] flex items-center justify-center">
                          <IoCloudUploadOutline className="size-18 text-gray-500" />
                        </div>
                      </div>
                      {isDragActive ? (
                        <p className="text-sm text-primary font-semibold">
                          Drop the files here ...
                        </p>
                      ) : (
                        <p className="text-sm">
                          <span className="font-semibold underline text-gray-700">
                            Choose files
                          </span>
                          <span className="text-gray-500">
                            {' '}
                            or drag and drop
                          </span>
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Any number of files can be uploaded.
                      </p>
                    </div>
                    {uploadedFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                          Selected files:
                        </p>
                        <ScrollShadow hideScrollBar className="max-h-32">
                          <div className="flex flex-wrap gap-2">
                            {selectedFilesDisplay}
                          </div>
                        </ScrollShadow>
                      </div>
                    )}
                  </div>
                </Tab>
                <Tab key="link" title="LINK DISCLOSURE">
                  <div className="space-y-4 pt-1">
                    <Input
                      label="Link"
                      labelPlacement="outside"
                      placeholder="https://"
                      value={linkUrl}
                      onChange={(e) => {
                        setLinkUrl(e.target.value);
                        // Clear error immediately when typing
                        setLinkUrlError('');
                      }}
                      onBlur={() => {
                        setLinkUrlError(validateUrl(linkUrl));
                      }}
                      type="text"
                      radius="full"
                      size="lg"
                      errorMessage={linkUrlError}
                      classNames={{
                        inputWrapper: linkUrlError
                          ? 'border-1 border-danger'
                          : '',
                      }}
                    />
                    {linkUrlError != '' && (
                      <p className="text-red-500 text-sm mt-1">
                        {linkUrlError}
                      </p>
                    )}
                  </div>
                </Tab>
              </Tabs>

              <Button
                color="primary"
                isDisabled={isLoading}
                isLoading={isLoading}
                size="lg"
                radius="full"
                className="w-full mt-8"
                onPress={handleSave}
              >
                {isLoading ? 'Saving...' : 'SAVE'}
              </Button>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

type DisclosureDetailModalProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
  disclosure: PropertyDisclosure;
};

function DisclosureDetailModal({
  isOpen,
  onOpenChange,
  onClose,
  disclosure,
}: DisclosureDetailModalProps) {
  if (!disclosure) return null;

  return (
    <Modal
      size="lg"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={onClose}
    >
      <ModalContent>
        {(modalClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-xl">
              {disclosure.url
                ? 'Attachment'
                : disclosure.name || 'Disclosure Details'}
            </ModalHeader>
            <ModalBody>
              {disclosure.description && (
                <div className="flex items-start gap-2 mb-3">
                  <IoInformationCircleOutline
                    className="text-gray-500 mt-1 flex-shrink-0"
                    size={18}
                  />
                  <p className="text-sm text-gray-700">
                    {disclosure.description}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                <IoCalendarOutline size={18} />
                <span>
                  Created:{' '}
                  {moment(disclosure.created_date).format(
                    'MMMM Do YYYY, h:mm a',
                  )}
                </span>
              </div>

              {disclosure.url && (
                <div className="mb-4">
                  <h4 className="text-md font-semibold mb-1 flex items-center gap-2">
                    <IoLinkOutline size={18} /> Linked Resource
                  </h4>
                  <a
                    href={disclosure.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {disclosure.url}
                  </a>
                </div>
              )}

              {disclosure.files && disclosure.files.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold mb-2 flex items-center gap-2">
                    <IoDocumentAttachOutline size={18} /> Attached Files
                  </h4>
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {disclosure.files.map((file, index) => {
                      const fileName = getFileNameFromPath(file.file);
                      let downloadUrl;
                      const isProduction =
                        process.env.NEXT_PUBLIC_NODE_ENV === 'production';
                      if (isProduction) {
                        downloadUrl = `${file.file}`;
                      } else {
                        downloadUrl = `http://localhost:8000${file.file}`;
                      }
                      return (
                        <li
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100"
                        >
                          <span
                            className="text-sm text-gray-800 truncate"
                            title={fileName}
                          >
                            {fileName}
                          </span>
                          <a
                            href={downloadUrl}
                            download={fileName} // Suggests browser to download with this name
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-dark p-1"
                            aria-label={`Download ${fileName}`}
                          >
                            <IoDownloadOutline size={20} />
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {!disclosure.url &&
                (!disclosure.files || disclosure.files.length === 0) && (
                  <p className="text-sm text-gray-500">
                    No URL or files associated with this disclosure.
                  </p>
                )}
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={modalClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

type PropertyDisclosuresProps = {
  disclosures: PropertyDisclosure[];
  onDisclosureAdded?: () => void;
};

export default function PropertyDisclosures({
  disclosures,
  onDisclosureAdded,
}: PropertyDisclosuresProps) {
  const [isMobile, setIsMobile] = useState(false);
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
    onOpenChange: onAddModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isDetailModalOpen,
    onOpen: onDetailModalOpen,
    onClose: onDetailModalClose,
    onOpenChange: onDetailModalOpenChange,
  } = useDisclosure();
  const [currentDisclosure, setCurrentDisclosure] =
    useState<PropertyDisclosure | null>(null);

  const params = useParams();
  const propertyId = params.id as string;
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserType = localStorage.getItem('user_type');
      setUserType(storedUserType);
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 500);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAddSuccess = () => {
    if (onDisclosureAdded) {
      onDisclosureAdded();
    }
  };

  const handleDisclosureItemClick = (disclosure: PropertyDisclosure) => {
    setCurrentDisclosure(disclosure);
    onDetailModalOpen();
  };

  return (
    <>
      <Card className="p-[35px_28px]">
        <CardHeader>
          <div className="flex gap-[10px] items-center">
            <h2 className="text-[#2D2C31] font-[700] text-[18px] font-[Figtree]">
              Disclosures
            </h2>
            {userType === 'realtor' && (
              <Image
                src="/svgs/add.svg"
                alt="Add Disclosure"
                width={24}
                height={24}
                className="cursor-pointer"
                onClick={onAddModalOpen}
              />
            )}
          </div>
        </CardHeader>
        <CardBody>
          {disclosures && disclosures.length > 0 ? (
            <div className="flex gap-4 sm:gap-7 flex-col sm:flex-row overflow-x-auto pb-2">
              {disclosures.map((item, index) => (
                <div
                  key={`${item?.name || 'disclosure'}-${index}`}
                  className="flex items-center gap-4 border-b border-b-[#F6F6F6] pb-4 sm:border-b-0 sm:border-r sm:border-r-[#F6F6F6] sm:pr-7 last:border-r-0 last:pr-0 flex-shrink-0 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors" // Added hover effect, padding, rounded
                  onClick={() => handleDisclosureItemClick(item)}
                >
                  <div className="bg-gray-100 w-[36px] h-[36px] flex items-center justify-center rounded-full flex-shrink-0">
                    {item.files && item.files.length > 0 ? (
                      <IoDocumentAttachOutline
                        className="text-primary"
                        size={18}
                      />
                    ) : item.url ? (
                      <Link href={item.url} target="_blank">
                        <IoLinkOutline className="text-primary" size={18} />
                      </Link>
                    ) : (
                      <IoDocumentTextOutline
                        className="text-primary"
                        size={18}
                      />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[#2D2C31] font-[600] text-[13.5px] font-[Figtree] truncate">
                      {item.name || 'Unnamed Disclosure'}
                    </p>
                    {item.created_date && (
                      <span className="text-[#A8A6B0] text-[13px] font-[Almarai]">
                        {moment(item.created_date).format('MM/DD/YYYY h:mm a')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {!isMobile &&
                disclosures.length > 3 && ( // This logic might need review for actual scroll indication
                  <div className="hidden sm:flex w-[36px] h-[36px] items-center justify-center rounded-full bg-[#F9F9F9] cursor-pointer self-center ml-auto">
                    <Image
                      src="/svgs/right.svg"
                      alt="Right"
                      width={7}
                      height={7}
                    />
                  </div>
                )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No disclosures added yet.</p>
          )}
        </CardBody>
      </Card>

      {propertyId && userType === 'realtor' && (
        <AddDisclosureModal
          isOpen={isAddModalOpen}
          onOpenChange={onAddModalOpenChange}
          onClose={onAddModalClose}
          propertyId={propertyId}
          onAddSuccess={handleAddSuccess}
        />
      )}

      {currentDisclosure && (
        <DisclosureDetailModal
          isOpen={isDetailModalOpen}
          onOpenChange={onDetailModalOpenChange}
          onClose={() => {
            onDetailModalClose();
            setCurrentDisclosure(null);
          }}
          disclosure={currentDisclosure}
        />
      )}
    </>
  );
}
