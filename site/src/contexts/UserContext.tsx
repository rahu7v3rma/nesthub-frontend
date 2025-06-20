'use client';

import { createContext, useEffect, useState } from 'react';

import { getProfile, UserProfileData } from '@/services/api';
import { getAuthToken } from '@/utils/auth';

interface UserContextType {
  user: UserProfileData | null;
  fetching: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  clearUser: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setFetching(true);
      const token = await getAuthToken();
      if (token) {
        const userData = await getProfile();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setError('Failed to load user data');
      setUser(null);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        fetching,
        error,
        refreshUser: fetchUser,
        clearUser: () => setUser(null),
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
