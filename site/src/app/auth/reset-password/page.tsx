'use client';

import { Formik, Form, ErrorMessage } from 'formik';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { FunctionComponent, useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

import { resetPassword } from '@/services/api';
import Button from '@/shared/Button';
import Input from '@/shared/Input';
import Text from '@/shared/Text';
import { Constants } from '@/utils/constants';

type Props = Record<string, never>;

const SignInSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Please Enter Email'),
});

const ResetPassword: FunctionComponent<Props> = ({}: Props) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = useCallback((values: { email: string }) => {
    setIsLoading(true);
    resetPassword(values.email)
      .then(() => {
        toast.success(
          'If the provided email address is registered we will send you instructions for resetting your password in the next few minutes. If you cannot find our email please make sure to check your spam folder',
          {
            autoClose: 10000,
          },
        );
        setIsLoading(false);
      })
      .catch((error: any) => {
        setIsLoading(false);
        if (error?.data?.code === Constants.errorCodes.passwordDoesNotConform) {
          toast.error(
            'The password must be at least 8 characters, include both numbers and letters, and cannot be something trivial.',
          );
        } else {
          toast.error('Oops, something went wrong. Please try again later.');
        }
      });
  }, []);

  return (
    <>
      <div className="flex flex-row justify-center relative">
        <Image
          src={'/svgs/back-arrow.svg'}
          onClick={() => router?.replace('/auth/signin')}
          width={35}
          height={35}
          alt="Back Arrow"
          className="absolute left-0 cursor-pointer w-[25px] md:w-[35px] h-[25px] md:h-[35px] top-[-3px]"
        />
        <Text className="!text-sm md:!text-xl !font-bold !text-black uppercase">
          Forgot Password
        </Text>
      </div>
      <Formik
        initialValues={{ email: '' }}
        validationSchema={SignInSchema}
        onSubmit={handleResetPassword}
      >
        {({ handleChange, handleBlur, values, errors, touched }) => (
          <Form className="flex flex-col w-full max-md:w-[100%] items-center mt-4">
            <Input
              name="email"
              type="email"
              className={`mb-[6px] ${errors.email && touched.email && 'border-0	'} w-[100%] bg-[#F7F7F7] border-[0px]`}
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.email}
              label="Email"
            />
            <div className="w-full flex justify-start ml-2 mb-2">
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <Button
              type="submit"
              className="w-[100%] mt-4 bg-[#ED6943] rounded-xl h-12	"
              isLoading={isLoading}
            >
              SUBMIT
            </Button>
            <div className="flex justify-center pt-6">
              <Text color="text-[#969495]" className="text-sm font-normal">
                Back to
              </Text>
              <Link href="/auth/signin">
                <Text
                  className="text-sm ml-1 underline underline-offset-2 font-[Assistant]"
                  weight="bold"
                  color="text-[#4353A4]"
                >
                  log in
                </Text>
              </Link>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default ResetPassword;
