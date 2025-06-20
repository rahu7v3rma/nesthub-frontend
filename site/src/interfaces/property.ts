export interface Property {
  id: string;
  address: string;
  city: string;
  county_or_parish: string;
  state_or_province: string;
  zip_code: string;
  name: string;
  image: string;
  no_of_baths: number;
  no_of_beds: number;
  price: number;
  square_feet_size: number;
  is_property_viewed_by_client: boolean | null;
  has_disclosures: boolean;
  offers: PropertyOffer[];
  has_unread_messages: boolean;
  // Additional fields from MLS API
  description?: string;
  status?: string;
  yearBuilt?: string;
  propertyType?: string;
  deadline_datetime?: Date;
  created_at?: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  realtor_property_id?: number;
  property_rating?: number;
}

export interface AddProperty {
  name?: string | null;
  price: number;
  no_of_beds: number;
  no_of_baths: number;
  square_feet_size: number;
  image?: string | null;
  longitude?: number | null;
  latitude?: number | null;
  additional_information: string;
  address: string;
  city?: string | null;
  county_or_parish?: string | null;
  state_or_province?: string | null;
  zip_code?: string | null;
  deadline_datetime?: Date;
  is_deadline_checked: boolean;
  note?: string;
}

export interface PropertyListResponse {
  list: Property[];
  page: number;
  has_next: boolean;
  total: number;
}
export interface PropertyDetails {
  id: string;
  address: string;
  city: string;
  county_or_parish: string;
  state_or_province: string;
  zip_code: string;
  price: number;
  image?: string;
  photos_list?: {
    lowRes?: string;
    midRes?: string;
    highRes?: string;
  }[];
  bedsCount: number;
  bathsCount: number;
  squareFeet: number;
  additional_information: string;
  note?: string;
  openHouseTime: string;
  zillowIntegration?: boolean;
  redzinIntegration?: boolean;
  latitude: number;
  longitude: number;
  offers?: PropertyOffer[];
  disclosures?: PropertyDisclosure[];
  comparables?: PropertyComparable[];
  offerGraph: PropertyOfferGraph;
  deadline_datetime?: string;
  property_rating: number;
  is_property_toured: boolean;
}

export interface PropertyOffer {
  id: number;
  date: string;
  amount: number;
  offer: string;
  offer_date: string;
}

export interface PropertyOfferGraph {
  askedPrice: number;
  firstOffer: number;
  secondOffer: number;
  closingOffer: number;
}

export interface PropertyListResponse {
  list: Property[];
}
export interface PropertyDetails {
  id: string;
  address: string;
  price: number;
  images?: string[];
  bedsCount: number;
  bathsCount: number;
  squareFeet: number;
  additionalInformation: string;
  openHouseTime: string;
  zillowIntegration?: boolean;
  redzinIntegration?: boolean;

  offers?: PropertyOffer[];
  disclosure?: PropertyDisclosure[];
  comparables?: PropertyComparable[];
  offerGraph: PropertyOfferGraph;
}

export interface PropertyOffer {
  date: string;
  amount: number;
  offer: string;
}

export interface PropertyOfferGraph {
  askedPrice: number;
  firstOffer: number;
  secondOffer: number;
  closingOffer: number;
}

export interface PropertyDisclosureFile {
  file: string;
}

export interface PropertyDisclosure {
  name: string | null;
  description: string | null;
  url: string | null;
  created_date: string;
  files: PropertyDisclosureFile[];
}

export interface PropertyComparable {
  comparable_id: number;
  image: Array<{
    lowRes: string;
    midRes: string;
    highRes: string;
  }> | null;
  address: string;
  squareFeet: number;
  listingPrice: number;
  closingPrice: number;
  amountPerSqrFeet: number;
  additional_info: string[];
  bedsCount: number;
  bathsCount: number;
  onMarket: string;
  label: string;
  is_link_only?: boolean;
  url?: string;
}
