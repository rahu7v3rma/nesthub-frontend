'use client';

import { Formik, Form, ErrorMessage } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { use, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

import { resetPasswordConfirm, resetPasswordVerify } from '@/services/api';
import Button from '@/shared/Button';
import Input from '@/shared/Input';
import Text from '@/shared/Text';
import { Constants } from '@/utils/constants';

const ResetPassword = ({ params }: { params: Promise<{ token: string }> }) => {
  const router = useRouter();
  const { token } = use(params);

  useEffect(() => {
    console.log({ token }, 'In UseEffect');
    resetPasswordVerify(token).catch(() => {
      toast.error('The link you followed may be broken or token expired!');
      router.replace('/auth/reset-password');
    });
  }, [token, router]);

  const handleResetForm = (values: {
    password: string;
    confirmPassword: string;
  }) => {
    resetPasswordConfirm(values.password, token)
      .then(() => {
        toast.success('Password changed successfully', {
          autoClose: 10000,
        });
        router.replace('/auth/signin');
      })
      .catch((error) => {
        if (
          error?.data?.status === 400 &&
          error?.data?.code === Constants.errorCodes.passwordDoesNotConform
        ) {
          toast.error(
            'Password must be at least 8 characters long, contain numbers, letters and symbols, not be a common password and not be similar to your email.',
          );
        } else {
          toast.error('The link you followed may be broken or token expired!');
          router.replace('/auth/reset-password');
        }
      });
  };

  const ResetPasswordSchema = Yup.object().shape({
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Please Enter Password'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Please Confirm Your Password'),
  });
  return (
    <div className="flex flex-col items-center mt-4">
      <div className="flex flex-row justify-center">
        <Text
          className="text-3xl"
          weight="normal"
          color="text-black"
          variant="h2"
        >
          Reset Password
        </Text>
      </div>
      <Formik
        initialValues={{ password: '', confirmPassword: '' }}
        validationSchema={ResetPasswordSchema}
        onSubmit={handleResetForm}
      >
        {({ handleChange, handleBlur, values, errors, touched }) => (
          <Form className="flex flex-col w-[405px] max-md:w-[100%] items-center mt-4">
            <Input
              name="password"
              type="password"
              label="Password"
              className={`${errors.password && touched.password && 'border-0'} w-full mb-[5px] bg-[#F7F7F7] border-[0px]`}
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.password}
            />
            <div className="w-full flex justify-start ml-2 mb-2">
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <Input
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${errors.confirmPassword && touched.confirmPassword && 'border-0'} w-full mb-[5px] bg-[#F7F7F7] border-[0px]`}
              value={values.confirmPassword}
            />
            <div className="w-full flex justify-start ml-2 mb-2">
              <ErrorMessage
                name="confirmPassword"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <Button
              type="submit"
              className="w-[100%] mt-4 bg-[#ED6943] rounded-xl h-12"
            >
              Submit
            </Button>
          </Form>
        )}
      </Formik>
      <div className="flex justify-center pt-6">
        <Text color="text-[#969495]" className="text-sm font-normal">
          Don’t have an account?
        </Text>
        <Link href="/auth/signup">
          <Text
            className="text-sm ml-1 underline underline-offset-2 font-[Assistant]"
            weight="bold"
            color="text-[#4353A4]"
          >
            Sign Up
          </Text>
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
