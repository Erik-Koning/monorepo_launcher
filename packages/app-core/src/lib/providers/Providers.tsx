"use client";
// Providers are in use client becuase -> https://nextjs.org/docs/getting-started/react-essentials#context

import { SessionProvider } from "@/app-core/src/lib/auth/next-auth-exports";
import { ThemeProvider, useTheme } from "next-themes";
import type { FC, ReactNode } from "react";
import { ReactQueryProvider } from "@/app-core/src/lib/providers/react-query-provider";
import { RouteChangeConfirmationProvider } from "@/utils/RouteChangeConfirmationProvider";
import { GlobalErrorBoundary } from "@/components/errors/ErrorBoundary";
import { CurrentUserProvider } from "@/app-core/src/lib/providers/currentUserProvider";
import { useLastInteraction } from "@/contexts/LastInteractionContext";
import AuthProvider from "@/app-core/src/lib/providers/nextAuthProvider";
import { Toaster } from "@/packages/common/src/components/ui/sonner";
//import { ThemeProvider as PrimerThemeProvider, BaseStyles as PrimerBaseStyles } from "@primer/react";
//			<PrimerThemeProvider>
//				<PrimerBaseStyles>

interface ProvidersProps {
  children: ReactNode;
  currentUser?: Record<string,any>;
  session?: any;
}
//Providers typically use react context to provide data to their children.
//https://react.dev/learn/passing-data-deeply-with-context
const Providers: FC<ProvidersProps> = ({ children, currentUser, session }) => {
  const { setTheme, theme } = useTheme();
  const { getLastInteraction } = useLastInteraction();

  return (
    <AuthProvider session={session}>
      <CurrentUserProvider initialUser={currentUser}>
        <ReactQueryProvider>
          <ThemeProvider attribute="class" defaultTheme="light" forcedTheme={theme}>
              <GlobalErrorBoundary getLastInteraction={getLastInteraction} initialUser={currentUser}>
                <Toaster position="bottom-right" richColors />
                {/*<RouteChangeConfirmationProvider>*/}
                {children}
                {/*</RouteChangeConfirmationProvider>*/}
              </GlobalErrorBoundary>
          </ThemeProvider>
        </ReactQueryProvider>
      </CurrentUserProvider>
    </AuthProvider>
  );
};

export default Providers;
