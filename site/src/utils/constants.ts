type ConstantsType = {
  message: { [key: string]: string };
  errorCodes: { [key: string]: string };
  urls: { [key: string]: string };
};

export const Constants: ConstantsType = {
  message: {
    passwordDoesNotConform:
      'Password must be at least 8 characters long, contain numbers, letters and symbols, not be a common password and not be similar to your email.',
    networkError: 'An unknown error has occurred',
    apiError: 'Oops, something went wrong. Please try again later.',
    resetPasswordNotCornfirm:
      'The password must be at least 8 characters, include both numbers and letters, and cannot be something trivial.',
    unknownError: 'Oops, something went wrong. Please try again later.',
    emailAlreadyExists: 'Email already exists',
  },
  errorCodes: {
    passwordDoesNotConform: 'password_does_not_conform',
    invalidCredentials: 'invalid_credentials',
    requestInvalid: 'request_invalid',
    notFound: 'not_found',
    emailAlreadyExists: 'email_already_exists',
    verificationFailed: 'verification_failed',
    emailNotVerified: 'email_not_verified',
  },
  urls: {
    termsOfUse: '',
  },
};

export const PDF_FILE_TYPES = ['application/pdf'];
export const PDF_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
