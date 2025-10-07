// UserContext.tsx
"use client";

import React, { createContext, useContext, useState } from "react";
import { RoleInherited } from "@/app-core/src/lib/auth/authorization";
import axios from "axios";

interface UserContextValue {
  userData?: Record<string,any>;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateRoleInherited: (roleInherited: RoleInherited | null) => void;
  refreshUser?: () => void;
  updateUser: (userData: Partial<Record<string,any>>) => void;
  removeUser: () => void;
  // Optionally: functions to log out, refresh user data, etc.
}

const UserContext = createContext<UserContextValue>({
  userData: undefined,
  isLoading: true,
  isAuthenticated: false,
  updateRoleInherited: () => {},
  updateUser: () => {},
  removeUser: () => {},
});

interface UserProviderProps {
  children: React.ReactNode;
  initialUser?: Record<string,any>;
}

export const CurrentUserProvider: React.FC<UserProviderProps> = ({ children, initialUser }) => {
  const usersLocalTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; //IANA Timezone

  const [userData, setUserData] = useState<Record<string,any> | undefined>({ ...initialUser, timeZone: usersLocalTimeZone } as Record<string,any>);
  const isLoading = false; // If you fetch on mount, you might use a state or effect for this
  const isAuthenticated = !!userData;

  const updateRoleInherited = (roleInherited: RoleInherited | null) => {
    setUserData((prevUserData) => {
      if (prevUserData) {
        return {
          ...prevUserData,
          roleInherited,
          timeZone: usersLocalTimeZone,
        };
      }
      return { ...initialUser, timeZone: usersLocalTimeZone } as Record<string,any>;
    });
  };

  const updateUser = (newUserData: Partial<Record<string,any>>) => {
    setUserData((prevUserData) => {
      if (prevUserData) {
        return { ...prevUserData, ...newUserData, timeZone: usersLocalTimeZone };
      }
      return { ...newUserData, timeZone: usersLocalTimeZone } as Record<string,any>;
    });
  };

  const refreshUser = async () => {
    try {
      const currentUser = await axios.get("/api/getCurrentUser");
      setUserData((prevUserData) => {
        if (prevUserData) {
          return { ...prevUserData, ...currentUser.data.user, timeZone: usersLocalTimeZone };
        }
        return { ...currentUser.data.user, timeZone: usersLocalTimeZone };
      });
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const removeUser = () => {
    setUserData(undefined);
  };

  return (
    <UserContext.Provider value={{ userData, isLoading, isAuthenticated, updateRoleInherited, updateUser, refreshUser, removeUser }}>
      {children}
    </UserContext.Provider>
  );
};

// A helper hook to easily consume the UserContext
export function useCurrentUser() {
  return useContext(UserContext);
}
