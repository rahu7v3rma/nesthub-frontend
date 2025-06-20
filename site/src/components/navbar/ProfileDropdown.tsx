'use client';

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from '@heroui/react';
import { useRouter } from 'next/navigation';
import { Key, useEffect, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { FiUsers } from 'react-icons/fi';
import { IoIosMenu } from 'react-icons/io';
import { MdCreditCard, MdEdit, MdPersonAdd } from 'react-icons/md';
import { RiCustomerService2Fill, RiLogoutCircleLine } from 'react-icons/ri';
import { toast } from 'react-toastify';

import { ROUTES } from '@/constants';
import { useUser } from '@/hooks/useUser';
import { logout, UserProfileData } from '@/services/api';
import { getAuthToken, resetAuthToken } from '@/utils/auth';
import { getFullImageUrl } from '@/utils/getFullImageUrl';

const ACTION_KEYS = {
  CLIENTS: 'clients',
  EDIT: 'edit',
  BILLING: 'billing',
  INVITE: 'invite',
  LOGOUT: 'logout',
} as const;

type ScreenSize = {
  isMobile: boolean;
};

export default function ProfileDropdown({ isMobile }: ScreenSize) {
  const [localUser, setLocalUser] = useState<UserProfileData | null>(null);
  const { user, fetching, clearUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    const getUserFromStorage = localStorage.getItem('user');

    if (getUserFromStorage) {
      try {
        const parsedUser: UserProfileData = JSON.parse(getUserFromStorage);
        setLocalUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse user data from localStorage', error);
        setLocalUser(null);
      }
    } else {
      setLocalUser(null);
    }
  }, []);

  const displayUser = user || localUser;

  async function handleLogout(router: ReturnType<typeof useRouter>) {
    try {
      const token = await getAuthToken();
      if (token) {
        const response = await logout(token);
        toast.success(response.message || 'User logged out successfully.');
        if (response.success) {
          resetAuthToken();
          localStorage.clear();
          document.cookie.split(';').forEach((cookie) => {
            const [name] = cookie.split('=');
            document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
          });
          clearUser();
          router.replace(ROUTES.signin);
        }
      }
    } catch (error: any) {
      console.error('Logout failed:', error);
      if (error.status >= 400 && error.status < 400) {
        toast.error(error.data.detail || error.message);
      } else {
        toast.error('Something went wrong');
      }
      localStorage.clear();
      document.cookie.split(';').forEach((cookie) => {
        const [name] = cookie.split('=');
        document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
      });
      clearUser();
      router.replace(ROUTES.signin);
    }
  }

  const actionHandler = (key: Key) => {
    switch (key) {
      case ACTION_KEYS.CLIENTS:
        router.push('/clients');
        break;
      case ACTION_KEYS.EDIT:
        router.push('/profile/edit');
        break;
      case ACTION_KEYS.BILLING:
        router.push('/billing');
        break;
      case ACTION_KEYS.INVITE:
        router.push('/invite-member');
        break;
      case ACTION_KEYS.LOGOUT:
        handleLogout(router);
        break;
      default:
        console.warn('Unknown action key:', key);
    }
  };

  if (fetching) {
    return null;
  }

  if (!displayUser) {
    return null;
  }

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          {isMobile ? (
            <IoIosMenu size={25} />
          ) : (
            <div className="cursor-pointer flex items-center gap-2">
              <Avatar
                isBordered
                as="button"
                className="transition-transform ring-0"
                src={
                  displayUser.profile_pic
                    ? getFullImageUrl(displayUser.profile_pic)
                    : '/avatar.png'
                }
                showFallback
              />
              <div className="flex flex-col max-w-[200px]">
                <span className="font-semibold">{displayUser.name || ''}</span>
                <span className="text-sm text-gray-500 mt-[-3px] truncate">
                  {displayUser.email}
                </span>
              </div>
              <FaChevronDown className="text-xs mt-0.5" />
            </div>
          )}
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Profile Actions"
          variant="faded"
          onAction={actionHandler}
        >
          <DropdownItem
            key="agent_info"
            isDisabled={true}
            className="text-[#5E5E61] opacity-100"
          >
            {isMobile ? (
              <div className="flex items-center gap-3 mb-4">
                <Avatar
                  isBordered
                  as="div"
                  className="transition-transform ring-0"
                  src={
                    displayUser.profile_pic
                      ? getFullImageUrl(displayUser.profile_pic)
                      : '/avatar.png'
                  }
                  showFallback
                />
                <div className="max-w-[200px]">
                  <div className="font-semibold text-base">
                    {displayUser.name || ''}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {displayUser.email}
                  </div>
                </div>
              </div>
            ) : null}
            <div className="flex flex-col gap-2">
              <span>
                Agent Name:{' '}
                <b>{displayUser?.agent?.name || displayUser.name || ''}</b>
              </span>
              <span>
                License ID:{' '}
                <b>
                  {displayUser?.agent?.license_id ||
                    displayUser.license_id ||
                    ''}
                </b>
              </span>
            </div>
            <div className="border-t border-gray-300 mt-4"></div>
          </DropdownItem>
          {isMobile ? (
            <DropdownItem
              key="clients"
              startContent={<FiUsers className="text-primary" />}
            >
              Clients
            </DropdownItem>
          ) : null}
          <DropdownItem
            key="edit"
            startContent={<MdEdit className="text-primary" />}
          >
            Edit profile
          </DropdownItem>
          <DropdownItem
            key="billing"
            startContent={<MdCreditCard className="text-primary" />}
          >
            Billing
          </DropdownItem>
          {user?.user_type === 'user' ? (
            <DropdownItem
              key="invite"
              startContent={<MdPersonAdd className="text-primary" />}
            >
              Invite
            </DropdownItem>
          ) : null}
          <DropdownItem
            key="support"
            startContent={<RiCustomerService2Fill className="text-primary" />}
          >
            Support
          </DropdownItem>
          <DropdownItem
            key="logout"
            startContent={<RiLogoutCircleLine className="text-primary" />}
          >
            Logout
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </>
  );
}
