'use client';

import { ErrorMessage, Form, Formik, type FormikConfig } from 'formik';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

import { useUser } from '@/hooks/useUser';
import { login, type ErrorResponseType } from '@/services/api';
import Button from '@/shared/Button';
import Input from '@/shared/Input';

const SignInSchema = Yup.object().shape({
  email: Yup.string()
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Invalid email')
    .required('Please Enter Email'),
  password: Yup.string().required('Please Enter Password'),
});

type InitialValues = {
  email: string;
  password: string;
};

type SubmitFunction<Values = InitialValues> = FormikConfig<Values>['onSubmit'];

const initialValues: InitialValues = { email: '', password: '' };

const SignIn: React.FC = () => {
  const router = useRouter();
  const { refreshUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const handleLoginForm: SubmitFunction = async (
    { email, password },
    { setFieldError },
  ) => {
    setIsLoading(true);
    try {
      const user_type = await login(email, password);
      await refreshUser();
      // Check if we are in a browser environment
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_type', user_type);
      }
      if (user_type === 'user') {
        router.replace('/properties');
      } else if (user_type === 'realtor') {
        router.replace('/clients');
      } else {
        router.replace('/clients');
      }
      setIsLoading(false);
      toast.success('Logged in successfully');
    } catch (error) {
      setIsLoading(false);
      const updatedError = error as ErrorResponseType;
      if (
        // Not a great way to do it but that's how the error type is coming.
        typeof updatedError['data'] == 'object' &&
        updatedError['data'] !== null &&
        'message' in updatedError['data'] &&
        typeof updatedError['data'].message == 'string'
      ) {
        toast.error('password', updatedError.data.message);
        return;
      }
      toast.error(
        (error as Error).message || 'Something went wrong! Please try again.',
      );
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.1)]">
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
          onClick={() => router.push('/')}
        />
      </div>
      <div className="flex justify-center items-center mt-7 mb-4">
        <h2 className="text-[#2D2C31] font-bold">Log In</h2>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={SignInSchema}
        onSubmit={handleLoginForm}
      >
        {({ handleChange, handleBlur, values, errors, touched }) => (
          <Form className="space-y-5">
            <Input
              name="email"
              type="email"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.email}
              label="Email"
              className="w-full bg-[#F9F9F9] rounded-[48]"
            />
            <ErrorMessage
              name="email"
              component="div"
              className="text-red-500 text-sm"
            />
            <Input
              name="password"
              type="password"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.password}
              label="Password"
              isError={errors.password && touched.password}
              className="w-full bg-gray-100"
            />
            <ErrorMessage
              name="password"
              component="div"
              className="text-red-500 text-sm"
            />
            <Button
              isLoading={isLoading}
              type="submit"
              className="w-full bg-[#2D2C31] text-white rounded-[48] h-[48px] text-xs"
            >
              LOG IN
            </Button>
          </Form>
        )}
      </Formik>

      <div className="flex flex-row w-100 pt-[20px]"></div>
      <div className="flex flex-col gap-2 justify-center items-center">
        <div className="flex items-center">
          <p className="text-[#A8A6B0] text-[13px] font-normal text-center">
            Forgot password?
          </p>
          <Link
            href="/auth/reset-password"
            className="text-[#2D2C31] underline text-sm font-semibold ml-1"
          >
            Click here
          </Link>
        </div>
        <div className="flex items-center">
          <p className="text-[#A8A6B0] text-[13px] font-normal text-center">
            Don&apos;t Have An Account?
          </p>
          <Link
            href="/auth/signup"
            className="text-[#2D2C31] underline text-sm font-semibold ml-1"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
