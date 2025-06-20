import { Property } from './property';

export interface MLSSearchRequest {
  address?: string;
  latitude?: number;
  longitude?: number;
  // Add other request parameters as needed
}
export interface MLSDetailRequest {
  listing_id: number;
}

export interface MLSListing {
  listingId: string;
  modificationTimestamp: string;
  courtesyOf: string;
  customStatus: string;
  hasPhotos: boolean;
  internetAddressDisplayYN: boolean;
  isListed: boolean;
  listingAgentEmailAddress: string;
  listingContractDate: string;
  listPriceLow: number;
  mlsNumber: string;
  mlsBoardCode: string;
  pricePerSqFt: number;
  publicRemarks: string;
  standardStatus: string;
  url: string;
  address: MLSAddress;
  media: MLSMedia;
  property: MLSProperty;
}

export interface MLSAddress {
  zipCode: string;
  city: string;
  countyOrParish: string;
  stateOrProvince: string;
  unparsedAddress: string;
}

export interface MLSProperty {
  associationFee: number;
  bathroomsText: string;
  bathroomsTotal: number;
  bedroomsTotal: number;
  garageSpaces: number;
  hasBasement: boolean;
  hasPool: boolean;
  isCityView: boolean;
  isMountainView: boolean;
  isParkView: boolean;
  isWaterFront: boolean;
  isWaterView: boolean;
  latitude: number;
  longitude: number;
  livingArea: number;
  location: string;
  lotSizeSquareFeet: number;
  propertySubType: string[];
  propertyType: string;
  stories: number;
  subdivisionName: string;
  yearBuilt: string;
}

export interface MLSSchool {
  elementarySchool: string;
  highSchool: string;
  middleOrJuniorSchool: string;
}

export interface MLSMedia {
  primaryListingImageUrl: string;
  photosCount: string;
  photosList?: Photo[];
}
export interface Photo {
  lowRes: string;
  midRes: string;
  highRes: string;
}

export interface MLSListingAgent {
  email: string;
  firstName: string;
  fullName: string;
}

export interface MLSListingOffice {
  address: string;
  city: string;
  email: string;
}

export interface MLSPublic {
  absenteeType: string;
  imageUrl: string;
  listType: string;
}

export interface MLSDetailResponse {
  data: {
    listingId: string;
    modificationTimestamp: string;
    listing: MLSListing;
    schools: MLSSchool;
    listingAgent: MLSListingAgent;
    listingOffice: MLSListingOffice;
    public: MLSPublic;
  }[];
}
export interface MLSDetailPropertyResponse {
  data: {
    listingId: number;
    reapiId: string;
    courtesyOf: string;
    customStatus: string | null;
    daysOnMarket: string;
    hasPhotos: boolean;
    isListed: boolean;
    listPrice: number;
    listingAgent: MLSListingAgent;
    listingAgentEmailAddress: string;
    listingContractDate: string;
    listingOffice: MLSListingOffice;
    mlsBoardCode: string;
    mlsNumber: string;
    modificationTimestamp: string;
    priceChangeTimestamp: string;
    pricePerSqFt: number;
    property: MLSProperty;
    publicRemarks: string;
    schools: MLSSchool;
    sellingAgent: MLSListingAgent;
    sellingOffice: MLSListingOffice;
    sellingOfficeName: string;
    soldDate: string | null;
    standardStatus: string;
    url: string | null;
    address: MLSAddress;
    media: MLSMedia;
    homedetails: any;
  };
}
export interface RealEstateApiError {
  message: string;
  code?: string;
  status?: number;
}
