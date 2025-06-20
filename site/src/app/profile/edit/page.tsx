'use client';

import {
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  useDisclosure,
  Avatar,
} from '@heroui/react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useRef,
  Dispatch,
  SetStateAction,
} from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import {
  FiUploadCloud,
  FiX,
  FiArrowLeft,
  FiTrash2,
  FiEdit2,
} from 'react-icons/fi';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ROUTES } from '@/constants';
import { useUser } from '@/hooks/useUser';
import {
  updateUserProfile,
  UserProfileData,
  UpdateUserProfileApiResponse,
  changePassword,
  ChangePasswordPayload,
  logout as apiLogout,
} from '@/services/api';
import { getAuthToken, resetAuthToken } from '@/utils/auth';
import { canvasPreview, centerAspectCrop } from '@/utils/canvasPreview';
import { getFullImageUrl } from '@/utils/getFullImageUrl';

type FormFieldConfig = readonly [
  label: string,
  value: string,
  setter: Dispatch<SetStateAction<string>>,
  id: string,
  type: string,
  disabled?: boolean,
  placeholder?: string,
  required?: boolean,
];

export default function EditProfilePage() {
  const { user, fetching, refreshUser } = useUser();
  const router = useRouter();

  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [imgSrc, setImgSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [licenseId, setLicenseId] = useState('');

  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    null,
  );
  const [initialProfilePicUrl, setInitialProfilePicUrl] = useState<
    string | null
  >(null);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    isOpen: isChangePasswordModalOpen,
    onOpen: openChangePasswordModalOriginal,
    onClose: closeChangePasswordModalHandler,
    onOpenChange: onChangePasswordModalOpenChange,
  } = useDisclosure();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordFormErrors, setChangePasswordFormErrors] = useState<{
    current_password?: string[];
    new_password?: string[];
    confirm_password?: string[];
  }>({});
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const toggleCurrentPasswordVisibility = () =>
    setIsCurrentPasswordVisible(!isCurrentPasswordVisible);
  const toggleNewPasswordVisibility = () =>
    setIsNewPasswordVisible(!isNewPasswordVisible);
  const toggleConfirmPasswordVisibility = () =>
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

  const {
    isOpen: isUploadModalOpen,
    onOpen: openUploadModalOriginal,
    onClose: closeModalOriginal,
    onOpenChange: onUploadModalOpenChange,
  } = useDisclosure();

  const [modalSelectedFile, setModalSelectedFile] = useState<File | null>(null);
  const [modalPreviewUrl, setModalPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (
      completedCrop?.width &&
      completedCrop?.height &&
      imgRef.current &&
      previewCanvasRef.current
    ) {
      canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop);
    }
  }, [completedCrop]);

  useEffect(() => {
    if (user) {
      setUserData(user);
      setName(user.name || '');
      setEmail(user.email || '');
      setCompany(user.company || '');
      setPhone(user.phone || '');
      setLicenseId(user.license_id || '');

      const fullImageUrl = getFullImageUrl(user.profile_pic);
      setInitialProfilePicUrl(fullImageUrl);
      setProfilePicPreview(fullImageUrl);
    }
  }, [user]);

  const openUploadModal = () => {
    if (profilePicFile && profilePicPreview) {
      setModalSelectedFile(profilePicFile);
      setModalPreviewUrl(profilePicPreview);
    } else {
      setModalSelectedFile(null);
      setModalPreviewUrl(
        initialProfilePicUrl && initialProfilePicUrl !== '/avatar.png'
          ? initialProfilePicUrl
          : null,
      );
    }
    openUploadModalOriginal();
  };

  const closeModal = () => {
    closeModalOriginal();
  };

  const handleModalFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setModalSelectedFile(file);
      setModalPreviewUrl(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
      });
      reader.readAsDataURL(file);
    }
  };

  const removeModalFile = () => {
    setModalSelectedFile(null);
    setModalPreviewUrl(null);
    setImgSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSavePicFromModal = async () => {
    if (!modalSelectedFile) {
      toast.error('Please select a file');
      return;
    }

    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      toast.error('Please select a crop area');
      return;
    }

    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        previewCanvasRef.current?.toBlob(
          resolve,
          'image/jpeg',
          0.9, // quality
        );
      });

      if (!blob) {
        throw new Error('Failed to create cropped image');
      }

      const croppedFile = new File([blob], modalSelectedFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      setProfilePicFile(croppedFile);
      setProfilePicPreview(URL.createObjectURL(blob));

      setImgSrc('');
      setCrop(undefined);
      setCompletedCrop(undefined);

      closeModal();
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Failed to crop image');
    }
  };

  const validateName = (value: string): boolean => {
    const nameRegex = /^[A-Za-z\s\-']+$/;
    return nameRegex.test(value);
  };

  const handleNameChange = (value: SetStateAction<string>) => {
    const newValue = typeof value === 'function' ? value(name) : value;

    // Only allow letters, spaces, hyphens, and apostrophes
    if (newValue === '' || /^[A-Za-z\s\-']*$/.test(newValue)) {
      setName(newValue);
      if (!newValue) {
        setNameError('Name is required');
      } else if (!validateName(newValue)) {
        setNameError(
          'Name can only contain letters, spaces, hyphens, and apostrophes',
        );
      } else {
        setNameError(null);
      }
    }
  };

  const handleEmailChange = (value: SetStateAction<string>) => {
    const newValue = typeof value === 'function' ? value(email) : value;
    setEmail(newValue);

    setEmailError(null);

    if (!newValue) {
      setEmailError('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newValue)) {
      setEmailError('Please enter a valid email address');
    }
  };

  const handlePhoneChange = (value: SetStateAction<string>) => {
    const newValue = typeof value === 'function' ? value(phone) : value;

    // Allow only digits, spaces, parentheses, hyphens, dots, and plus sign
    const sanitizedValue = newValue.replace(/[^0-9\s().\-+]/g, '');
    setPhone(sanitizedValue);

    if (sanitizedValue === '') {
      setPhoneError(null);
    } else {
      const phoneRegex = /^(?:\+1\s?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}$/;

      if (!phoneRegex.test(sanitizedValue)) {
        setPhoneError(
          'Please enter a valid phone number (e.g., (123) 456-7890 or +1 (123) 456-7890)',
        );
      } else {
        setPhoneError(null);
      }
    }
  };

  const handleSubmit = async (e?: FormEvent<HTMLFormElement> | any) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    if (!name) {
      setNameError('Name is required');
      return;
    }
    if (!validateName(name)) {
      setNameError(
        'Name can only contain letters, spaces, hyphens, and apostrophes',
      );
      return;
    }

    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (phone && phoneError) {
      return;
    }

    setIsSaving(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (company) formData.append('company', company);
    else formData.append('company', '');
    if (phone) formData.append('phone', phone);
    else formData.append('phone', '');
    if (licenseId) formData.append('license_id', licenseId);
    else formData.append('license_id', '');

    if (profilePicFile) {
      formData.append('profile_pic', profilePicFile);
    } else if (
      !profilePicFile &&
      !profilePicPreview &&
      initialProfilePicUrl &&
      initialProfilePicUrl !== '/avatar.png'
    ) {
      formData.append('profile_pic', '');
    }

    try {
      const response: UpdateUserProfileApiResponse =
        await updateUserProfile(formData);
      if (response.success) {
        toast.success(response.message || 'Profile updated successfully!');
        setUserData(response.data);

        if (response.data.email !== email) {
          setEmail(response.data.email);
        }

        const timestamp = new Date().getTime();
        const newImageUrl = response.data.profile_pic
          ? `${getFullImageUrl(response.data.profile_pic)}?t=${timestamp}`
          : '/avatar.png';

        setInitialProfilePicUrl(newImageUrl);
        setProfilePicPreview(newImageUrl);
        setProfilePicFile(null);

        setModalSelectedFile(null);
        setModalPreviewUrl(null);
        await refreshUser();

        const avatarElement = document.querySelector(
          'img[alt="Profile picture"]',
        );
        if (avatarElement) {
          (avatarElement as HTMLImageElement).src = newImageUrl;
        }
      } else {
        let errorMessage = response.message || 'Failed to update profile.';
        const errorData = response.data as any;
        if (errorData && typeof errorData === 'object') {
          const fieldErrors = Object.entries(errorData)
            .map(
              ([field, errors]) =>
                `${field}: ${(errors as string[]).join(', ')}`,
            )
            .join('; ');
          errorMessage = fieldErrors || errorMessage;
        }
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err: any) {
      console.error('Update profile error:', err);
      let errorMessage = 'An unexpected error occurred.';
      if (err.message) errorMessage = err.message;
      if (err.data && typeof err.data === 'object') {
        const fieldErrors = Object.entries(err.data)
          .map(
            ([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`,
          )
          .join('; ');
        errorMessage = `Error: ${fieldErrors || err.message}`;
      } else if (err.data && typeof err.data === 'string') {
        errorMessage = err.data;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (userData) {
      setName(userData.name || '');
      setEmail(userData.email || '');
      setCompany(userData.company || '');
      setPhone(userData.phone || '');
      setLicenseId(userData.license_id || '');

      const fullImageUrl = getFullImageUrl(userData.profile_pic);
      setProfilePicPreview(fullImageUrl);
      setInitialProfilePicUrl(fullImageUrl);
      setProfilePicFile(null);
      setModalSelectedFile(null);
      setModalPreviewUrl(null);
    }
    setError(null);
  };

  const openChangePasswordModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setChangePasswordFormErrors({});
    openChangePasswordModalOriginal();
  };

  const closeChangePasswordModal = () => {
    closeChangePasswordModalHandler();
  };

  const handleLogoutAfterPasswordChange = async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        const response = await apiLogout(token);
        toast.success(
          response.message ||
            'User logged out successfully after password change.',
        );
        if (response.success) {
          resetAuthToken();
          localStorage.clear();
          document.cookie.split(';').forEach((cookie) => {
            const [name] = cookie.split('=');
            document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
          });
          if (refreshUser) await refreshUser();
          router.replace(ROUTES.signin);
        }
      } else {
        toast.warn('No active session found. Redirecting to login.');
        localStorage.clear();
        router.replace(ROUTES.signin);
      }
    } catch (err: any) {
      console.error('Logout failed after password change:', err);
      // let logoutErrorMessage = 'Logout failed. Please try again.';
      // if (err.message) logoutErrorMessage = err.message;
      // if (err.data?.detail) logoutErrorMessage = err.data.detail;
      // toast.error(logoutErrorMessage);
      resetAuthToken();
      localStorage.clear();
      document.cookie.split(';').forEach((cookie) => {
        const [name] = cookie.split('=');
        document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
      });
      if (refreshUser) await refreshUser();
      router.replace(ROUTES.signin);
    }
  };

  const handleChangePasswordSubmit = async () => {
    setChangePasswordFormErrors({});
    let formIsValid = true;
    const errors: typeof changePasswordFormErrors = {};

    if (!currentPassword) {
      errors.current_password = ['Current password is required.'];
      formIsValid = false;
    }
    if (!newPassword) {
      errors.new_password = ['New password is required.'];
      formIsValid = false;
    }
    if (!confirmPassword) {
      errors.confirm_password = ['Confirm password is required.'];
      formIsValid = false;
    }
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errors.confirm_password = ['New passwords do not match.'];
      formIsValid = false;
    }

    if (!formIsValid) {
      setChangePasswordFormErrors(errors);
      return;
    }

    setIsChangingPassword(true);

    try {
      const payload: ChangePasswordPayload = {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      };
      const response = await changePassword(payload);

      if (response.success) {
        toast.success(
          response.message ||
            'Password changed successfully! Logging you out...',
        );
        closeChangePasswordModal();
        await handleLogoutAfterPasswordChange();
      } else {
        let toastMessage = response.message || 'Failed to change password.';
        if (response.data && Object.keys(response.data).length > 0) {
          setChangePasswordFormErrors(
            response.data as typeof changePasswordFormErrors,
          );
          toastMessage =
            'Password update failed. Please check the errors shown on the form.';
        }
        toast.error(toastMessage);
      }
    } catch (err: any) {
      console.error('Change password error:', err);
      let toastMessage =
        'An unexpected error occurred while changing password.';

      if (
        err.data &&
        typeof err.data === 'object' &&
        Object.keys(err.data).length > 0
      ) {
        setChangePasswordFormErrors(
          err.data as typeof changePasswordFormErrors,
        );
        toastMessage =
          'An error occurred. Please check the validation messages.';
      } else if (err.message) {
        toastMessage = err.message;
      } else if (err.data && typeof err.data === 'string') {
        toastMessage = err.data;
      }
      toast.error(toastMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4">
        <ToastContainer
          containerId="profile-loading-toast"
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <p className="text-xl animate-pulse">Loading profile...</p>
      </div>
    );
  }

  const currentAvatarSrc = profilePicPreview || getFullImageUrl(null);

  const formFields: FormFieldConfig[] = [
    [
      'Name',
      name,
      handleNameChange,
      'name',
      'text',
      false,
      'Daniel Cohen',
      true,
    ],
    [
      'Email',
      email,
      handleEmailChange,
      'email',
      'email',
      false,
      'kathrine.huang@gmail.com',
      true,
    ],
    [
      'Company',
      company,
      setCompany,
      'company',
      'text',
      false,
      'NesthubHub',
      false,
    ],
    [
      'Phone (Optional)',
      phone,
      handlePhoneChange,
      'phone',
      'tel',
      false,
      '+1 (234) 567 8910',
      false,
    ],
    [
      'License #',
      licenseId,
      setLicenseId,
      'license_id',
      'text',
      false,
      '123637281',
      false,
    ],
  ];

  const inputStyles = {
    label: 'text-[#A8A6B0] font-normal text-sm mb-1 ml-1',
    inputWrapper: [
      'bg-[#F9F9F9]',
      'rounded-[24px]',
      'border-none',
      'shadow-sm',
      'h-[52px]',
      'group-data-[focus=true]:bg-[#F9F9F9]',
    ],
    input: 'px-4 text-gray-800 placeholder:text-gray-400 text-sm',
  };

  return (
    <div className="px-4 py-8 sm:px-6 md:px-8 lg:px-12 lg:py-12 min-h-screen">
      <ToastContainer
        containerId="card-loading-toast"
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Card className="max-w-4xl mx-auto shadow-xl border rounded-[24px] overflow-hidden">
        <CardBody className="p-6 sm:p-8 md:p-10">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">
              Edit profile
            </h1>
            <div className="flex space-x-3">
              <Button
                radius="full"
                onPress={handleCancel}
                isDisabled={isSaving}
                className="bg-[#F0F0F0] hover:bg-[#E5E5E5] text-gray-800 font-semibold text-xs px-5 py-2.5 sm:px-6"
              >
                CANCEL
              </Button>
              <Button
                radius="full"
                isLoading={isSaving}
                onPress={() => handleSubmit()}
                className="bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs px-5 py-2.5 sm:px-6"
              >
                {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
              <div className="w-full lg:w-auto flex-shrink-0 flex lg:flex-col items-center lg:items-start">
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src={currentAvatarSrc}
                    alt="Profile picture"
                    className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-full object-cover shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/avatar.png';
                    }}
                  />
                  <Button
                    isIconOnly
                    size="md"
                    radius="full"
                    onPress={openUploadModal}
                    className="absolute bottom-0 right-0 bg-gray-800 hover:bg-gray-700 text-white shadow-lg transform translate-x-1/4 translate-y-1/4"
                    aria-label="Change profile picture"
                  >
                    <FiEdit2 size={18} />
                  </Button>
                </div>
              </div>

              <div className="flex-grow w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  {formFields.map((field) => {
                    const [
                      label,
                      value,
                      setter,
                      id,
                      type,
                      disabled,
                      placeholder,
                      required,
                    ] = field;

                    const errorMap: Record<string, string | null> = {
                      name: nameError,
                      email: emailError,
                      phone: phoneError,
                    };

                    const showError = errorMap[id];

                    const inputProps =
                      id === 'email'
                        ? {
                            type: 'text',
                            pattern: undefined,
                            onInvalid: (e: React.FormEvent<HTMLInputElement>) =>
                              e.preventDefault(),
                          }
                        : {};

                    return (
                      <div key={id} className="flex flex-col">
                        <Input
                          type={type}
                          label={
                            <span>
                              {label}
                              {required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </span>
                          }
                          labelPlacement="outside"
                          placeholder={placeholder || label}
                          value={value}
                          onValueChange={setter}
                          isDisabled={disabled}
                          id={id}
                          name={id}
                          variant="flat"
                          classNames={inputStyles}
                          {...inputProps}
                        />
                        {showError && (
                          <p className="text-red-500 text-sm mt-1">
                            {showError}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  <div>
                    <label
                      htmlFor="password_display"
                      className={inputStyles.label}
                    >
                      Password
                    </label>
                    <div
                      id="password_display"
                      className="bg-[#F9F9F9] rounded-[24px] h-[52px] px-4 flex items-center justify-between mt-1"
                    >
                      <span className="text-gray-800 text-sm">••••••••••</span>
                      <Button
                        variant="light"
                        size="sm"
                        className="text-gray-700 font-semibold p-0 hover:text-gray-900 text-xs"
                        onPress={openChangePasswordModal}
                      >
                        CHANGE
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>

      <Modal
        isOpen={isUploadModalOpen}
        onOpenChange={onUploadModalOpenChange}
        placement="center"
        size="sm"
        backdrop="opaque"
        className="rounded-xl"
        onClose={closeModal}
      >
        <ModalContent>
          {(onCloseModalHandler) => (
            <>
              <ModalHeader className="flex items-center justify-between pt-4 pb-2 px-4 sm:px-6 border-b border-gray-200">
                <Button
                  isIconOnly
                  variant="light"
                  onPress={onCloseModalHandler}
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 rounded-full"
                >
                  <FiArrowLeft size={22} />
                </Button>
                <h2 className="text-base sm:text-lg font-semibold text-center text-gray-800">
                  Upload profile picture
                </h2>
                <div></div>
              </ModalHeader>
              <ModalBody className="p-4 sm:p-6">
                {!modalPreviewUrl ? (
                  <label
                    htmlFor="profilePicUploadInputModal"
                    className="mt-2 flex flex-col items-center justify-center px-6 py-10 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400 bg-gray-50"
                  >
                    <FiUploadCloud className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                    <div className="mt-2 flex text-xs sm:text-sm text-gray-500">
                      <span className="font-medium text-gray-700 hover:text-gray-900">
                        Choose file
                      </span>
                      <input
                        ref={fileInputRef}
                        id="profilePicUploadInputModal"
                        name="profilePicUploadInputModal"
                        type="file"
                        className="sr-only"
                        onChange={handleModalFileChange}
                        accept="image/png, image/jpeg, image/gif"
                      />
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </label>
                ) : imgSrc ? (
                  <div className="mt-4 space-y-4">
                    <div className="flex flex-col items-center">
                      <div className="relative w-full max-h-[300px] overflow-hidden">
                        <ReactCrop
                          crop={crop}
                          onChange={(c) => setCrop(c)}
                          onComplete={(c) => setCompletedCrop(c)}
                          aspect={1}
                          className="w-full"
                          minWidth={100}
                          minHeight={100}
                        >
                          <img
                            ref={imgRef}
                            alt="Crop me"
                            src={imgSrc}
                            onLoad={(e) => {
                              const {
                                naturalWidth: width,
                                naturalHeight: height,
                              } = e.currentTarget;
                              setCrop(centerAspectCrop(width, height, 1));
                            }}
                            className="max-w-full max-h-[300px] object-contain"
                          />
                        </ReactCrop>
                      </div>

                      <canvas ref={previewCanvasRef} className="hidden" />

                      <div className="w-full mt-4 flex items-center justify-between p-2.5 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-2.5 overflow-hidden">
                          <div className="w-8 h-8 rounded-full overflow-hidden border">
                            <img
                              src={imgSrc}
                              alt="Original preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  '/avatar.png';
                              }}
                            />
                          </div>
                          <span className="text-xs sm:text-sm text-gray-700 truncate">
                            {modalSelectedFile?.name || 'profile_picture.png'}
                          </span>
                        </div>
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          onPress={() => {
                            setImgSrc('');
                            setModalSelectedFile(null);
                            setModalPreviewUrl(null);
                            if (fileInputRef.current)
                              fileInputRef.current.value = '';
                          }}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <FiTrash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div className="flex justify-center">
                      <NextImage
                        src={modalPreviewUrl}
                        alt="Upload preview"
                        width={128}
                        height={128}
                        className="rounded-full object-cover w-32 h-32 border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/avatar.png';
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2.5 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-2.5 overflow-hidden">
                        <NextImage
                          src={modalPreviewUrl}
                          alt="Thumbnail"
                          width={32}
                          height={32}
                          className="rounded-full object-cover w-8 h-8"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/avatar.png';
                          }}
                        />
                        <span className="text-xs sm:text-sm text-gray-700 truncate">
                          {modalSelectedFile
                            ? modalSelectedFile.name
                            : 'profile_picture.png'}
                        </span>
                      </div>
                      <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={removeModalFile}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <FiTrash2 size={18} />
                      </Button>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="p-4 sm:px-6 sm:pb-6 border-t border-gray-200">
                <Button
                  fullWidth
                  radius="full"
                  onPress={handleSavePicFromModal}
                  isDisabled={!modalSelectedFile && !modalPreviewUrl}
                  className={`text-xs font-medium py-2.5
                    ${
                      modalSelectedFile || modalPreviewUrl
                        ? 'bg-gray-800 text-white hover:bg-gray-900'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  SAVE & CONTINUE
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isChangePasswordModalOpen}
        onOpenChange={onChangePasswordModalOpenChange}
        placement="center"
        size="md"
        backdrop="opaque"
        className="rounded-xl"
        onClose={closeChangePasswordModal}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 items-center pt-4 pb-2 px-4 sm:px-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Change Password
                </h2>
              </ModalHeader>
              <ModalBody className="p-4 sm:p-6 space-y-4">
                <div className="space-y-4 pt-1">
                  <Input
                    type={isCurrentPasswordVisible ? 'text' : 'password'}
                    label={
                      <span>
                        Current Password <span className="text-red-500">*</span>
                      </span>
                    }
                    endContent={
                      <button
                        aria-label="toggle password visibility"
                        className="focus:outline-none"
                        type="button"
                        onClick={toggleCurrentPasswordVisibility}
                      >
                        {isCurrentPasswordVisible ? (
                          <AiOutlineEye className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                          <AiOutlineEyeInvisible className="text-2xl text-default-400 pointer-events-none" />
                        )}
                      </button>
                    }
                    labelPlacement="outside"
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      if (changePasswordFormErrors.current_password) {
                        setChangePasswordFormErrors((prev) => ({
                          ...prev,
                          current_password: undefined,
                        }));
                      }
                    }}
                    onBlur={() => {
                      if (!currentPassword) {
                        setChangePasswordFormErrors((prev) => ({
                          ...prev,
                          current_password: ['Current password is required'],
                        }));
                      }
                    }}
                    radius="full"
                    size="lg"
                    errorMessage={changePasswordFormErrors.current_password?.join(
                      ' ',
                    )}
                    classNames={{
                      inputWrapper: changePasswordFormErrors.current_password
                        ? 'border-1 border-danger'
                        : '',
                    }}
                  />
                  {changePasswordFormErrors.current_password && (
                    <p className="text-red-500 text-sm mt-1">
                      {changePasswordFormErrors.current_password.join(' ')}
                    </p>
                  )}
                </div>

                <div className="space-y-4 pt-1">
                  <Input
                    type={isNewPasswordVisible ? 'text' : 'password'}
                    label={
                      <span>
                        New Password <span className="text-red-500">*</span>
                      </span>
                    }
                    endContent={
                      <button
                        aria-label="toggle password visibility"
                        className="focus:outline-none"
                        type="button"
                        onClick={toggleNewPasswordVisibility}
                      >
                        {isNewPasswordVisible ? (
                          <AiOutlineEye className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                          <AiOutlineEyeInvisible className="text-2xl text-default-400 pointer-events-none" />
                        )}
                      </button>
                    }
                    labelPlacement="outside"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (changePasswordFormErrors.new_password) {
                        setChangePasswordFormErrors((prev) => ({
                          ...prev,
                          new_password: undefined,
                        }));
                      }
                    }}
                    onBlur={() => {
                      if (!newPassword) {
                        setChangePasswordFormErrors((prev) => ({
                          ...prev,
                          new_password: ['New password is required'],
                        }));
                      } else if (newPassword.length < 8) {
                        setChangePasswordFormErrors((prev) => ({
                          ...prev,
                          new_password: [
                            'Password must be at least 8 characters',
                          ],
                        }));
                      }
                    }}
                    radius="full"
                    size="lg"
                    errorMessage={changePasswordFormErrors.new_password?.join(
                      ' ',
                    )}
                    classNames={{
                      inputWrapper: changePasswordFormErrors.new_password
                        ? 'border-1 border-danger'
                        : '',
                    }}
                  />
                  {changePasswordFormErrors.new_password && (
                    <p className="text-red-500 text-sm mt-1">
                      {changePasswordFormErrors.new_password.join(' ')}
                    </p>
                  )}
                </div>

                <div className="space-y-4 pt-1">
                  <Input
                    type={isConfirmPasswordVisible ? 'text' : 'password'}
                    label={
                      <span>
                        Confirm New Password{' '}
                        <span className="text-red-500">*</span>
                      </span>
                    }
                    endContent={
                      <button
                        aria-label="toggle password visibility"
                        className="focus:outline-none"
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {isConfirmPasswordVisible ? (
                          <AiOutlineEye className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                          <AiOutlineEyeInvisible className="text-2xl text-default-400 pointer-events-none" />
                        )}
                      </button>
                    }
                    labelPlacement="outside"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (changePasswordFormErrors.confirm_password) {
                        setChangePasswordFormErrors((prev) => ({
                          ...prev,
                          confirm_password: undefined,
                        }));
                      }
                    }}
                    onBlur={() => {
                      if (!confirmPassword) {
                        setChangePasswordFormErrors((prev) => ({
                          ...prev,
                          confirm_password: ['Please confirm your password'],
                        }));
                      } else if (confirmPassword !== newPassword) {
                        setChangePasswordFormErrors((prev) => ({
                          ...prev,
                          confirm_password: ['Passwords do not match'],
                        }));
                      }
                    }}
                    radius="full"
                    size="lg"
                    errorMessage={changePasswordFormErrors.confirm_password?.join(
                      ' ',
                    )}
                    classNames={{
                      inputWrapper: changePasswordFormErrors.confirm_password
                        ? 'border-1 border-danger'
                        : '',
                    }}
                  />
                  {changePasswordFormErrors.confirm_password && (
                    <p className="text-red-500 text-sm mt-1">
                      {changePasswordFormErrors.confirm_password.join(' ')}
                    </p>
                  )}
                </div>
              </ModalBody>
              <ModalFooter className="p-4 sm:px-6 sm:pb-6 border-t border-gray-200 flex flex-col sm:flex-row gap-2">
                <Button
                  fullWidth
                  radius="full"
                  variant="bordered"
                  onPress={closeChangePasswordModal}
                  className="text-xs font-medium py-2.5"
                >
                  CANCEL
                </Button>
                <Button
                  fullWidth
                  radius="full"
                  isLoading={isChangingPassword}
                  onPress={handleChangePasswordSubmit}
                  className="text-xs font-medium py-2.5 bg-gray-800 text-white hover:bg-gray-900"
                >
                  {isChangingPassword ? 'UPDATING...' : 'UPDATE PASSWORD'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
