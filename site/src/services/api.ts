import axios, { AxiosError } from 'axios';

import {
  AUTHORIZATION_HEADER_NAME,
  constructAuthorizationHeaderValue,
  getAuthorizationHeaderValue,
  setAuthToken,
} from '@/utils/auth';
import { COMMON } from '@/utils/common';
import { setOTPVerified, deleteOTPVerified } from '@/utils/otp';

const API_END_POINT = {
  LOGIN: 'user/login',
  LOGOUT: 'user/logout',
  SIGN_UP: 'user/sign-up',
  PROFILE: 'user/profile',
  USER_UPDATE_PROFILE: 'user/update-profile',
  VERIFY_ACCOUNT_EMAIL_REQUEST: '/user/verify-account/request',
  VERIFY_ACCOUNT_CONFIRM: '/user/verify-account/confirm',
  RESET_PASSWORD: 'user/reset/request',
  RESET_PASSWORD_VERIFY: 'user/reset/verify',
  RESET_PASSWORD_CONFIRM: 'user/reset/confirm',
  SET_PASSWORD_VERIFY: 'user/set-password/verify',
  SET_PASSWORD_CONFIRM: 'user/set-password/confirm',
  VERIFY_OTP: 'otp/verify',
  SEND_OTP: 'otp/send',
  PROPERTY_DETAILS: 'properties/details',
  ADD_DISCLOSURE: (propertyId: number) =>
    `properties/${propertyId}/add-disclosure`,
  ADD_COMPARABLE: (propertyId: number) =>
    `properties/${propertyId}/add-comparable`,
  PROPERTY_LISTING: 'properties/',
  CLIENTS: 'user/client',
  CLIENT_MEMBERS: 'user/members',
  CLIENT_DETAILS: 'user/client-details',
  ADD_PROPERTY: 'properties/',
  ADD_OFFER: 'properties/offer',
  CHANGE_PASSWORD: 'user/change-password',
  DELETE_COMPARABLE: (propertyId: number, comparableId: number) =>
    `properties/${propertyId}/comparable/${comparableId}`,
  DELETE_OFFER: (propertyId: number, offerId: number) =>
    `properties/${propertyId}/offer/${offerId}`,
  UPDATE_RATING: (propertyId: number) => `properties/${propertyId}/rate`,
  UPDATE_TOURED: (propertyId: number) =>
    `properties/${propertyId}/update-tour-status`,
};

type API_METHOD = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type ErrorResponseType = {
  name: string;
  message: string;
  status: number;
  data: any;
};

interface BaseClientData {
  name: string;
  email: string;
  phone: string;
  is_active?: boolean;
}

interface ClientMemberData extends BaseClientData {
  id?: number;
}

interface ClientDetailResponseData extends BaseClientData {
  id: number;
  members: ClientMemberData[];
}

interface ClientCreatePayload {
  parent: BaseClientData;
  members?: BaseClientData[];
}

interface ClientUpdatePayload {
  name?: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
  members?: ClientMemberData[];
}

export interface ClientListItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  property_count: number;
  last_activity: string;
}

export interface ClientListResponse {
  list: ClientListItem[];
  page: number;
  has_next: boolean;
  total: number;
}

export interface UserProfileData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  license_id: string | null;
  user_type: string;
  address: string | null;
  timestamp: string;
  profile_pic: string | null;
  agent?: {
    name: string;
    license_id: string;
  };
}

export interface UpdateUserProfileApiResponse {
  success: boolean;
  message: string;
  status: number;
  data: UserProfileData;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordApiResponse {
  success: boolean;
  message: string;
  code?: string;
  status: number;
  data?:
    | {
        confirm_password?: string[];
        new_password?: string[];
        current_password?: string[];
      }
    | Record<string, never>;
}

export const signUp = (
  name: string,
  company: string,
  id: string,
  password: string,
  email: string,
  phone: string,
  region: string,
) => {
  const payload = {
    name: name,
    email: email,
    phone: phone,
    company: company,
    license_id: id,
    password: password,
    region,
  };
  return baseRequest(API_END_POINT.SIGN_UP, 'POST', payload, {}, {}, true);
};

export const login = (email: string, password: string) => {
  return baseRequest(API_END_POINT.LOGIN, 'POST', { email, password }).then(
    async (loginResponse) => {
      if (loginResponse.exempt) {
        await setOTPVerified(true);
      }

      const authToken = loginResponse.token;
      const user = loginResponse || {};
      localStorage.setItem('user', JSON.stringify(user));
      if (loginResponse.user_type === 'user') {
        localStorage.setItem('clientName', loginResponse.name);
        localStorage.setItem('realtorId', loginResponse.agent.id);
      } else if (loginResponse.user_type === 'realtor') {
        localStorage.removeItem('clientName');
        localStorage.removeItem('realtorId');
      }

      return setAuthToken(authToken).then(() => loginResponse.user_type);
    },
  );
};

export const getProfile = () => {
  return authorizedRequest(API_END_POINT.PROFILE, 'GET');
};

export const updateUserProfile = (
  formData: FormData,
): Promise<UpdateUserProfileApiResponse> => {
  return authorizedRequest(
    API_END_POINT.USER_UPDATE_PROFILE,
    'PUT',
    formData,
    { 'Content-Type': 'multipart/form-data' },
    undefined,
    true,
  );
};

export const getPropertyDetails = (id: string, realtor_property_id: string) => {
  const path = `${API_END_POINT.PROPERTY_DETAILS}/${id}?realtor_property_id=${realtor_property_id}`;
  return authorizedRequest(path, 'GET');
};

export function getPropertyListing({
  search = '',
  page = 1,
  limit = 12,
  signal,
  user_id,
  sort = '',
}: {
  search?: string;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
  user_id: string | number;
  sort?: string;
}) {
  return authorizedRequest(
    API_END_POINT.PROPERTY_LISTING,
    'GET',
    undefined,
    undefined,
    {
      search,
      page: page.toString(),
      limit: limit.toString(),
      user_id: user_id.toString(),
      sort,
    },
    undefined,
    signal,
  );
}

export const createDisclosure = (propertyId: number, formData: FormData) => {
  return authorizedRequest(
    API_END_POINT.ADD_DISCLOSURE(propertyId),
    'POST',
    formData,
    { 'Content-Type': 'multipart/form-data' },
    {},
    true,
  );
};

export interface CreateComparablePayload {
  address?: {
    name: string;
    price: number;
    listing_id: string;
    no_of_beds: number;
    no_of_baths: number;
    square_feet_size: number;
    image: string | null;
    photosList: any[] | null;
    longitude: number | null;
    latitude: number | null;
    additional_information: string | null;
    address: string | null;
    city: string | null;
    county_or_parish: string | null;
    state_or_province: string | null;
    zip_code: string | null;
    deadline_datetime: string | null;
    is_deadline_checked: boolean;
    note: string;
  };
  realtor_property_id: string;
  client_id: string;
  additional_info?: string[];
  is_link_only?: boolean;
  url?: string;
}

export const createComparable = (
  propertyId: number,
  payload: CreateComparablePayload,
) => {
  return authorizedRequest(
    API_END_POINT.ADD_COMPARABLE(propertyId),
    'POST',
    payload,
    {},
    {},
    true,
  );
};

/**
 * An asynchronous function that logs out a user by making a POST request to the
 * logout endpoint with the provided token.
 *
 * @param {string} token - A string representing the user's authentication token.
 * @returns {Promise<any>} The response from the authorizedRequest function, which is typically
 * the server's response to the logout request.
 */

export const logout = (token: string) => {
  const payload = { token };

  return authorizedRequest(
    API_END_POINT.LOGOUT,
    'POST',
    payload,
    undefined,
    undefined,
    true,
  ).then((res) => {
    return res;
  });
};

export const verifyAccountRequest = async (unverifiedAuthToken: string) => {
  // for unverified accounts we have a special token to ue when communicating
  // with available endpoints
  const headers = {
    [AUTHORIZATION_HEADER_NAME]:
      constructAuthorizationHeaderValue(unverifiedAuthToken),
  };
  return baseRequest(
    API_END_POINT.VERIFY_ACCOUNT_EMAIL_REQUEST,
    'POST',
    {},
    headers,
    { platform: 'web' },
  );
};

export const verifyAccount = (token: string) =>
  baseRequest(API_END_POINT.VERIFY_ACCOUNT_CONFIRM, 'POST', { token });

export const resetPassword = (email: string) => {
  return baseRequest(
    API_END_POINT.RESET_PASSWORD,
    'POST',
    {
      email,
    },
    undefined,
    { platform: 'web' },
  );
};

export const resetPasswordVerify = (token: string) => {
  return baseRequest(API_END_POINT.RESET_PASSWORD_VERIFY, 'POST', {
    token,
  });
};

export const resetPasswordConfirm = (password: string, token: string) => {
  return baseRequest(API_END_POINT.RESET_PASSWORD_CONFIRM, 'POST', {
    password,
    token,
  });
};

export const verifyOtp = (otp: string) => {
  return authorizedRequest(API_END_POINT.VERIFY_OTP, 'POST', {
    otp,
  }).then(async () => {
    await setOTPVerified(true);
  });
};

export const sendOtp = () => {
  return authorizedRequest(API_END_POINT.SEND_OTP, 'POST', {}).then(() => {
    deleteOTPVerified();
  });
};

export const getClientsList = ({
  page = 1,
  limit = 10,
  search = '',
  sort = '',
  active = undefined,
  signal,
}: {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string; // 'ASC' or 'DESC' for price sorting
  active?: boolean;
  signal?: AbortSignal;
} = {}): Promise<ClientListResponse> => {
  const params: { [key: string]: string } = {
    page: page.toString(),
    limit: limit.toString(),
  };
  if (search) {
    params.search = search;
  }
  if (sort) {
    params.sort = sort;
  }
  if (active !== undefined) {
    params.active = active.toString();
  }
  return authorizedRequest(
    API_END_POINT.CLIENTS,
    'GET',
    undefined,
    undefined,
    params,
    undefined,
    signal,
  );
};

export const getClientDetails = (
  clientId: string,
): Promise<ClientDetailResponseData> => {
  return authorizedRequest(
    `${API_END_POINT.CLIENT_DETAILS}/${clientId}`,
    'GET',
  );
};

export const getClientMembers = (): Promise<ClientDetailResponseData> => {
  return authorizedRequest(API_END_POINT.CLIENT_MEMBERS, 'GET');
};

export const deleteClientMember = (
  memberId: number,
): Promise<ClientDetailResponseData> => {
  return authorizedRequest(
    `${API_END_POINT.CLIENT_MEMBERS}/${memberId}`,
    'DELETE',
  );
};

export const editMembersData = (payload: ClientUpdatePayload): Promise<any> => {
  return authorizedRequest(
    API_END_POINT.CLIENT_MEMBERS,
    'PUT',
    payload,
    undefined,
    undefined,
    true,
  );
};

export const createClient = (payload: ClientCreatePayload): Promise<any> => {
  return authorizedRequest(
    API_END_POINT.CLIENTS,
    'POST',
    payload,
    {},
    {},
    true,
  );
};

export function sendChatMessage({
  realtor_property_id,
  message,
}: {
  message: string;
  realtor_property_id: string | number;
}) {
  return authorizedRequest(
    `${API_END_POINT.PROPERTY_LISTING}chat`,
    'POST',
    {
      message,
      realtor_property_id,
    },
    undefined,
    undefined,
    undefined,
  );
}

export function getChatMessages({
  property_id,
  realtor_property_id,
}: {
  property_id: string | number;
  realtor_property_id: string | number;
}) {
  return authorizedRequest(
    `${API_END_POINT.PROPERTY_LISTING}${property_id}/chat`,
    'GET',
    undefined,
    undefined,
    {
      realtor_property_id: realtor_property_id.toString(),
    },
    undefined,
  );
}

export function getPollNewMessages({
  property_id,
  realtor_property_id,
  last_message_id,
}: {
  property_id: string | number;
  realtor_property_id: string | number;
  last_message_id: string | number;
}) {
  return authorizedRequest(
    `${API_END_POINT.PROPERTY_LISTING}${property_id}/chat/new-messages`,
    'GET',
    undefined,
    undefined,
    {
      realtor_property_id: realtor_property_id.toString(),
      last_message_id: last_message_id.toString(),
    },
    undefined,
  );
}

export const editClientData = (
  clientId: string,
  payload: ClientUpdatePayload,
): Promise<any> => {
  return authorizedRequest(
    `${API_END_POINT.CLIENTS}/${clientId}`,
    'PUT',
    payload,
    undefined,
    undefined,
    true,
  );
};

export const deleteClient = (clientId: string): Promise<any> => {
  return authorizedRequest(`${API_END_POINT.CLIENTS}/${clientId}`, 'DELETE');
};

export const addProperty = (payload: {}) => {
  return authorizedRequest(`${API_END_POINT.ADD_PROPERTY}`, 'POST', payload);
};

export const addOffer = (payload: {}) => {
  return authorizedRequest(`${API_END_POINT.ADD_OFFER}`, 'POST', payload);
};

export const deleteOffer = (
  propertyId: number,
  OfferId: number,
): Promise<any> => {
  return authorizedRequest(
    API_END_POINT.DELETE_OFFER(propertyId, OfferId),
    'DELETE',
    undefined,
    undefined,
    undefined,
    true,
  );
};

export const changePassword = (
  payload: ChangePasswordPayload,
): Promise<ChangePasswordApiResponse> => {
  return authorizedRequest(
    API_END_POINT.CHANGE_PASSWORD,
    'POST',
    payload,
    undefined,
    undefined,
    true,
  );
};

/**
 * Verifies the password set token.
 * @param token The password set token from the URL.
 */
export const setPasswordVerify = (token: string) => {
  // Return the full response structure { success, message, status, data }
  // Pass true for the returnFullResponse parameter
  return baseRequest(
    API_END_POINT.SET_PASSWORD_VERIFY,
    'POST',
    { token },
    undefined,
    undefined,
    true,
  );
};

/**
 * Confirms the new password using the token.
 * @param password The new password entered by the user.
 * @param token The password set token from the URL.
 * @returns Promise resolving with the full API response on success.
 */
export const setPasswordConfirm = (password: string, token: string) => {
  // Return the full response structure { success, message, status, data }
  // Pass true for the returnFullResponse parameter
  return baseRequest(
    API_END_POINT.SET_PASSWORD_CONFIRM,
    'POST',
    { password, token },
    undefined,
    undefined,
    true,
  );
};

/**
 * Deletes a comparable for a given property.
 * @param propertyId The ID of the property.
 * @param comparableId The ID of the comparable to delete.
 */
export const deleteComparable = (
  propertyId: number,
  comparableId: number,
): Promise<any> => {
  return authorizedRequest(
    API_END_POINT.DELETE_COMPARABLE(propertyId, comparableId),
    'DELETE',
    undefined,
    undefined,
    undefined,
    true,
  );
};

export const updatePropertyRating = (
  propertyId: number,
  rating: number,
): Promise<any> => {
  return authorizedRequest(
    API_END_POINT.UPDATE_RATING(propertyId), // Keep propertyId in URL
    'PATCH',
    {
      rating: rating,
    },
    undefined,
    undefined,
    true,
  );
};

export const updatePropertyToured = (
  propertyId: number,
  is_property_toured: boolean,
): Promise<any> => {
  return authorizedRequest(
    API_END_POINT.UPDATE_TOURED(propertyId),
    'PATCH',
    {
      is_property_toured: is_property_toured,
    },
    undefined,
    undefined,
    true,
  );
};

const baseRequest = (
  url: string,
  method: API_METHOD = 'GET',
  data?: object,
  headers?: { [key: string]: string },
  params?: { [key: string]: string },
  returnFullResponse: boolean = false,
  signal?: AbortSignal,
): Promise<any> => {
  return apiClient
    .request({
      method,
      url,
      headers,
      data,
      params,
      signal,
    })
    .then((response) => {
      const responseData = response.data || {};
      return returnFullResponse
        ? responseData
        : responseData.data ?? responseData;
    })
    .catch((err: AxiosError | Error) => {
      const errorData = (err as AxiosError)?.response?.data || {};
      const backendMessage = (errorData as any)?.message || err.message;
      const backendErrors = (errorData as any)?.data;

      return Promise.reject<ErrorResponseType>({
        name: err.name,
        message: backendMessage,
        status: (err as AxiosError)?.response?.status || -1,
        data: backendErrors || errorData,
        code: (errorData as any)?.code || '',
      });
    });
};

const authorizedRequest = async (
  url: string,
  method: API_METHOD = 'GET',
  data?: object,
  headers?: { [key: string]: string },
  params?: { [key: string]: string },
  returnFullResponse?: boolean,
  signal?: AbortSignal,
): Promise<any> => {
  try {
    const authHeaderValue = await getAuthorizationHeaderValue();
    if (!headers) {
      headers = {};
    }

    headers[AUTHORIZATION_HEADER_NAME] = authHeaderValue || '';

    return baseRequest(
      url,
      method,
      data,
      headers,
      params,
      returnFullResponse,
      signal,
    );
  } catch (error) {
    console.error('Error getting authorization header:', error);
    return Promise.reject({
      name: 'AuthError',
      message: 'Failed to get authorization token.',
      status: 401,
      data: null,
    });
  }
};

const apiClient = axios.create({
  baseURL: COMMON.apiBaseUrl,
  headers: {
    'Content-type': 'application/json',
  },
});
