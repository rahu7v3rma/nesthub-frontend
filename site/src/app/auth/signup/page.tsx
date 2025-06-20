'use client';

import { Formik, Form, ErrorMessage } from 'formik';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

import Alert from '@/components/alert';
import { signUp } from '@/services/api';
import Button from '@/shared/Button';
import Input from '@/shared/Input';
import Text from '@/shared/Text';
import { Constants } from '@/utils/constants';

const SignupSchema = Yup.object().shape({
  name: Yup.string().trim().required('Name is required'),
  company: Yup.string().trim().required('Company is required'),
  id: Yup.string().trim().required('License ID is required'),
  phone: Yup.string().matches(
    /^[0-9]+$/,
    'Phone number must contain digits only',
  ),
  // .required('Phone no. is required'),
  region: Yup.string().required('Region is required'),
  email: Yup.string()
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Invalid email format. Must be a valid email address',
    )
    .required('Please Enter Email'),
  password: Yup.string()
    .min(8, 'Password is too short - it should be 8 characters minimum.')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/\d/, 'Password must contain at least one number')
    .matches(
      /[!@#$%^&*]/,
      'Password must contain at least one special character',
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), ''], 'Passwords must match')
    .required('Confirm Password is required'),
});

const counties = [
  { label: 'Contra Costa', value: 'Contra Costa' },
  { label: 'Alameda', value: 'Alameda' },
  { label: 'San Mateo', value: 'San Mateo' },
  { label: 'Santa Clara', value: 'Santa Clara' },
  { label: 'Solano', value: 'Solano' },
  { label: 'Sonoma', value: 'Sonoma' },
  { label: 'Napa', value: 'Napa' },
  { label: 'Marin', value: 'Marin' },
  { label: 'San Joaquin', value: 'San Joaquin' },
  { label: 'Sacramento', value: 'Sacramento' },
  { label: 'San Francisco', value: 'San Francisco' },
  { label: 'Others', value: 'Others' },
];

interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  company: string;
  id: string;
  phone: string;
  region: string;
}
const Signup: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const handleSignupForm = useCallback(
    (
      values: {
        region: string;
        email: string;
        name: string;
        company: string;
        id: string;
        password: string;
        phone: string;
      },
      { resetForm, setFieldError }: any,
    ) => {
      if (values.region === 'Others') {
        setShowAlert(true);
        return;
      }

      setIsLoading(true);
      signUp(
        values.name,
        values.company,
        values.id,
        values.password,
        values.email,
        values.phone,
        values.region,
      )
        .then((response) => {
          localStorage.setItem(
            'unverifiedAuthToken',
            response?.unverified_auth_token,
          );
          resetForm();
          toast.success(response?.message || 'Account Created successfully');
          setIsLoading(false);
          router.replace(`/auth/verify-account`);
        })
        .catch((err) => {
          let errorText = 'Oops, something went wrong. Please try again later.';
          let formErrors = { email: '', phone: '', id: '', password: '' };

          if (
            err?.status === 400 &&
            err?.code === Constants.errorCodes.passwordDoesNotConform
          ) {
            errorText =
              'Password must be at least 8 characters long, contain numbers, letters and symbols, not be a common password and not be similar to your email.';
          } else if (
            err?.status === 401 &&
            err?.code === Constants.errorCodes.emailAlreadyExists
          ) {
            errorText = 'Email already exists';
          } else if (
            err?.status === 400 &&
            err?.code === Constants.errorCodes.requestInvalid
          ) {
            if (err?.data?.email) {
              formErrors.email = 'Email already exists.';
            }
            if (err?.data?.phone) {
              formErrors.phone = 'Phone number too long.';
            }
            if (err?.data?.license_id) {
              formErrors.id = err.data.license_id[0];
            }
            if (err?.data?.password) {
              formErrors.password = err.data.password[0];
            }
          }
          if (Object.keys(formErrors).length > 0) {
            setFieldError('email', formErrors.email);
            setFieldError('phone', formErrors.phone);
            setFieldError('id', formErrors.id);
            setFieldError('password', formErrors.password);
          } else {
            toast.error(errorText);
          }

          setIsLoading(false);
        });
    },
    [router],
  );
  // const handleSignupForm = useCallback(
  //   (values: SignupFormValues, { resetForm }: { resetForm: () => void }) => {
  //     resetForm();
  //   },
  //   [],
  // );

  return (
    <div className="m-auto w-full bg-white p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.1)]">
      <div className="flex justify-between items-center my-4">
        <Image
          src={'/svgs/back-btn.svg'}
          className="cursor-pointer"
          width={20}
          height={20}
          alt="back"
          onClick={() => router.back()}
        />
        <Image
          height={150}
          width={150}
          src="/images/nest-logo.svg"
          alt="logo"
        />
        <Image
          src={'/svgs/close-btn.svg'}
          className="cursor-pointer"
          width={20}
          height={20}
          alt="close"
        />
      </div>
      <div className="flex justify-center items-center mt-7 mb-4">
        <h2 className="text-[#2D2C31] font-bold">Create account</h2>
      </div>
      <Formik
        initialValues={{
          name: '',
          company: '',
          id: '',
          phone: '',
          email: '',
          password: '',
          confirmPassword: '',
          region: '',
        }}
        validationSchema={SignupSchema}
        onSubmit={handleSignupForm}
      >
        {({
          handleChange,
          handleBlur,
          values,
          errors,
          touched,
          isValid,
          dirty,
        }) => (
          <Form className="flex flex-col w-full">
            <div className="flex flex-col w-full">
              <Input
                name="name"
                type="text"
                label="Name"
                className={`${errors.name && touched.name && 'border-pale_red'}  w-full h-[48px]`}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.name}
                isError={errors.name && touched.name}
                isRequired={true}
              />
              <div className="w-full flex justify-start">
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            </div>
            <div className="flex mb-[5px] gap-[5px] w-full mt-2 max-sm:flex-wrap">
              <div className="flex flex-col w-[55%] sm:w-[65%]">
                <Input
                  name="company"
                  type="text"
                  label="Company"
                  className={`${errors.company && touched.company && 'border !border-pale_red'} w-full h-[48px]`}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.company}
                  isError={errors.company && touched.company}
                  isRequired={true}
                />
                <div className="w-full flex justify-start">
                  <ErrorMessage
                    name="company"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>
              <div className="flex flex-col w-[42%] sm:w-[35%]">
                <Input
                  name="id"
                  type="text"
                  label="License ID"
                  className={`${errors.id && touched.id && 'border !border-pale_red'} w-full h-[48px]`}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.id}
                  isError={errors.id && touched.id}
                  isRequired={true}
                />
                {errors.id && touched.id && (
                  <div className="w-full flex justify-start">
                    <ErrorMessage
                      name="id"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="my-[5px] gap-[5px] w-full">
              <Input
                name="phone"
                type="text"
                label="Phone (Optional)"
                className={`${errors.phone && touched.phone && 'border !border-pale_red'} w-full h-[48px]`}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.phone}
                isError={errors.phone && touched.phone}
                onKeyDown={(e) => {
                  const allowedKeys = [
                    'Backspace',
                    'Delete',
                    'Tab',
                    'Escape',
                    'Enter',
                    'ArrowLeft',
                    'ArrowRight',
                  ];
                  const isNumber = /^[0-9]$/.test(e.key);

                  if (!isNumber && !allowedKeys.includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              <div className="w-full flex justify-start">
                <ErrorMessage
                  name="phone"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div className="mt-2 mb-[5px] w-full">
                <label className="block text-sm font-medium text-[#969495] mb-1">
                  Region <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="region"
                    className={`w-full h-[48px] bg-[#f7f7f7] rounded-[32px] outline-none px-4 pr-10 appearance-none ${errors.region && touched.region ? 'border border-red-500' : 'border border-[#ddd]'}`}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.region}
                  >
                    <option value="">Select a region</option>
                    {counties.map((county) => (
                      <option key={county.value} value={county.value}>
                        {county.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 rotate-180 top-[24px] transform -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="8" viewBox="0 0 200 100">
                      <polygon
                        points="100,10 180,90 20,90"
                        style={{ fill: '#969495', stroke: '#969495' }}
                      />
                    </svg>
                  </div>
                </div>
                {errors.region && touched.region && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.region}
                  </div>
                )}
              </div>
            </div>
            <div className="flex my-[5px] gap-[5px] w-full max-sm:flex-wrap">
              <Input
                name="email"
                type="email"
                label="Email"
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${errors.email && touched.email && 'border !border-pale_red'} w-full mb-[5px] h-[48px]`}
                value={values.email}
                isError={errors.email && touched.email}
                isRequired={true}
              />
            </div>
            {errors.email && touched.email && (
              <div className="w-full flex justify-start">
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            )}
            <div className="flex my-[5px] gap-[5px] w-full max-sm:flex-wrap">
              <div className="flex flex-col w-full">
                <Input
                  name="password"
                  type="password"
                  label="Create password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isError={errors.password && touched.password}
                  isRequired={true}
                  className={`${errors.password && touched.password && 'border !border-pale_red'} w-full mb-[5px] h-[48px]`}
                  value={values.password}
                />
                <div className="w-full flex justify-start">
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col w-full">
              <Input
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                onChange={handleChange}
                onBlur={handleBlur}
                isError={errors.confirmPassword && touched.confirmPassword}
                isRequired={true}
                className={`${errors.confirmPassword && touched.confirmPassword && 'border !border-pale_red'} w-full mb-[5px] h-[48px]`}
                value={values.confirmPassword}
              />
              <div className="w-full flex justify-start">
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            </div>
            <Button
              isLoading={isLoading}
              type="submit"
              // className={`w-[100%] rounded-[48px] !h-[48px] mt-3 uppercase text-[13px] font-bold ${isValid && dirty ? 'bg-chinese_orange' : 'bg-dark_black'}`}
              className={`w-[100%] rounded-[48px] !h-[48px] mt-3 uppercase text-[13px] font-bold bg-dark_black`}
            >
              {'Create Account'}
            </Button>
            <div className="flex justify-center my-4">
              <p className="text-[#A8A6B0] text-[13px] font-normal text-center">
                Already registered?
              </p>
              <Link
                href="/auth/signin"
                className="text-[#2D2C31] underline text-sm font-semibold ml-1"
              >
                Sign in
              </Link>
            </div>
          </Form>
        )}
      </Formik>
      <Alert
        isOpen={showAlert}
        setIsOpen={setShowAlert}
        size="lg"
        alertTitle="Platform not available"
      >
        <p className="text-center font-[13px]">
          We sincerely apologize, but NestHub platform is currently not
          available in your region
        </p>
      </Alert>
    </div>
  );
};

export default Signup;
