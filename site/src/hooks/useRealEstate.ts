import { useState } from 'react';

import {
  MLSDetailRequest,
  MLSSearchRequest,
  MLSDetailResponse,
  MLSDetailPropertyResponse,
} from '../interfaces/realEstateApi';
import { realEstateApi } from '../services/realEstateApi';

interface UseRealEstateReturn {
  loading: boolean;
  addLoading: boolean;
  error: Error | null;
  getMLSDetail: (
    request: MLSDetailRequest,
  ) => Promise<MLSDetailPropertyResponse>;
  getMLSSearch: (request: MLSSearchRequest) => Promise<MLSDetailResponse>;
}

export function useRealEstate(): UseRealEstateReturn {
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getMLSDetail = async (
    request: MLSDetailRequest,
  ): Promise<MLSDetailPropertyResponse> => {
    try {
      setAddLoading(true);
      setError(null);
      const response = await realEstateApi.getMLSDetail(request);
      return response;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setAddLoading(false);
    }
  };

  const getMLSSearch = async (
    request: MLSSearchRequest,
  ): Promise<MLSDetailResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await realEstateApi.getMLSSsearch(request);
      return response;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    addLoading,
    error,
    getMLSDetail,
    getMLSSearch,
  };
}
