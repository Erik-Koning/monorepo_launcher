"use client";

import React, { useRef, useEffect } from "react";
import { RoleInherited } from "../auth/authorization";

// Example Zustand store interfaces (you would define these in separate files)
interface UserStore {
  userData?: Record<string,any>;
  isLoading: boolean;
  isAuthenticated: boolean;
  roleInherited?: RoleInherited | null;
  setUserData: (userData: Record<string,any> | undefined) => void;
  updateRoleInherited: (role: RoleInherited | null) => void;
  setLoading: (loading: boolean) => void;
  refreshUser: () => Promise<void>;
  removeUser: () => void;
}

interface UIStore {
  sideMenuOpen: boolean;
  notifications: any[];
  theme: "light" | "dark";
  setSideMenuOpen: (open: boolean) => void;
  addNotification: (notification: any) => void;
  setTheme: (theme: "light" | "dark") => void;
}

// Props interface for the initializer component
interface StateInitializerProps {
  children?: React.ReactNode;
  initialUser?: Record<string,any>;
  initialUIState?: {
    sideMenuOpen?: boolean;
    theme?: "light" | "dark";
    notifications?: any[];
  };
  // You can extend this with other initial data
  serverData?: Record<string, any>;
}

/**
 * StateInitializer Component
 *
 * This component uses useRef to ensure that Zustand stores are initialized
 * only once with server-side or initial data. This prevents hydration mismatches
 * and ensures consistent state initialization.
 */
export const StateInitializer: React.FC<StateInitializerProps> = ({ children = null, initialUser, initialUIState = {}, serverData = {} }) => {
  // Use useRef to track if initialization has occurred
  const isInitialized = useRef(false);
  const initializationData = useRef({
    user: initialUser,
    ui: initialUIState,
    server: serverData,
  });

  useEffect(() => {
    // Only initialize once
    if (isInitialized.current) return;

    const initializeStores = async () => {
      try {
        // Initialize User Store
        if (initialUser && typeof window !== "undefined") {
          // Example: Initialize your Zustand user store
          // const { setUserData, setLoading } = useUserStore.getState();
          // setUserData(initialUser);
          // setLoading(false);

          console.log("Initializing user store with:", initialUser);
        }

        // Initialize UI Store
        if (initialUIState && typeof window !== "undefined") {
          // Example: Initialize your Zustand UI store
          // const { setSideMenuOpen, setTheme } = useUIStore.getState();
          // if (initialUIState.sideMenuOpen !== undefined) {
          //   setSideMenuOpen(initialUIState.sideMenuOpen);
          // }
          // if (initialUIState.theme) {
          //   setTheme(initialUIState.theme);
          // }

          console.log("Initializing UI store with:", initialUIState);
        }

        // Initialize other stores with server data
        if (Object.keys(serverData).length > 0 && typeof window !== "undefined") {
          // Example: Initialize other Zustand stores
          // Object.entries(serverData).forEach(([key, value]) => {
          //   // Initialize specific stores based on key
          //   console.log(`Initializing ${key} store with:`, value);
          // });

          console.log("Initializing server data:", serverData);
        }

        // Get user's timezone and add to user data if available
        if (initialUser && typeof window !== "undefined") {
          const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          // Update user store with timezone
          console.log("Setting user timezone:", timeZone);
        }

        isInitialized.current = true;
        console.log("Global state initialization complete");
      } catch (error) {
        console.error("Error initializing global state:", error);
      }
    };

    initializeStores();
  }, []); // Empty dependency array ensures this runs only once

  // Optional: Provide a way to re-initialize if needed
  const reinitialize = () => {
    isInitialized.current = false;
    // Trigger re-initialization logic here if needed
  };

  // Optional: Expose initialization status via context or callback
  useEffect(() => {
    if (isInitialized.current && typeof window !== "undefined") {
      // Dispatch a custom event when initialization is complete
      window.dispatchEvent(
        new CustomEvent("stateInitializationComplete", {
          detail: {
            user: initializationData.current.user,
            ui: initializationData.current.ui,
            server: initializationData.current.server,
          },
        })
      );
    }
  }, [isInitialized.current]);

  return <>{children}</>;
};

/**
 * Hook to check if state initialization is complete
 */
export const useStateInitializationStatus = () => {
  const [isComplete, setIsComplete] = React.useState(false);

  useEffect(() => {
    const handleInitComplete = () => setIsComplete(true);

    window.addEventListener("stateInitializationComplete", handleInitComplete);

    return () => {
      window.removeEventListener("stateInitializationComplete", handleInitComplete);
    };
  }, []);

  return isComplete;
};

/**
 * Example usage with server-side props
 */
export interface StateInitializerWrapperProps {
  children?: React.ReactNode;
  pageProps?: {
    initialUser?: Record<string,any>;
    initialUIState?: any;
    serverData?: Record<string, any>;
  };
}

export const StateInitializerWrapper: React.FC<StateInitializerWrapperProps> = ({ children, pageProps = {} }) => {
  return (
    <StateInitializer initialUser={pageProps.initialUser} initialUIState={pageProps.initialUIState} serverData={pageProps.serverData}>
      {children}
    </StateInitializer>
  );
};
