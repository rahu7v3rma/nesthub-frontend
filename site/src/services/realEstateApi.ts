import {
  MLSDetailRequest,
  MLSSearchRequest,
  MLSDetailResponse,
  MLSDetailPropertyResponse,
} from '../interfaces/realEstateApi';

class RealEstateApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RealEstateApiError';
  }
}

export const realEstateApi = {
  async getMLSDetail(
    request: MLSDetailRequest,
  ): Promise<MLSDetailPropertyResponse> {
    try {
      const requestBody = {
        listing_id: request.listing_id,
      };

      const response = await fetch('/api/mls-detail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 400) {
          throw new RealEstateApiError('This property is not available');
        }
        throw new RealEstateApiError(error.message || 'An error occurred');
      }

      return response.json();
    } catch (error) {
      if (error instanceof RealEstateApiError) {
        throw error;
      }
      throw new RealEstateApiError(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  },

  async getMLSSsearch(request: MLSSearchRequest): Promise<MLSDetailResponse> {
    try {
      const requestBody = request.address
        ? { address: request.address }
        : {
            latitude: request.latitude,
            longitude: request.longitude,
          };

      const response = await fetch('/api/mls-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new RealEstateApiError(error.message || 'API request failed');
      }

      return response.json();
    } catch (error) {
      if (error instanceof RealEstateApiError) {
        throw error;
      }
      throw new RealEstateApiError(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  },
};
