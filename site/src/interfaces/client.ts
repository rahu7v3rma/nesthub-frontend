export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastActivity: string;
  propertiesCount: number;
  isArchived: boolean;
}

export type ClientFormRowData = {
  id: number | null;
  isArchived?: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isNew?: boolean;
  isEmailVerified?: boolean;
};

export type ErrorResponseType = {
  name: string;
  message: string;
  status: number;
  data: any;
};
