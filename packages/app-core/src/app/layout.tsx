//This is similar to an index.html file

"use server";

import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { headers } from "next/headers";

import Providers from "@/app-core/src/lib/providers/Providers";
import { cn } from "@/lib/utils";

import "@/styles/globals.css";
import { Metadata } from "next";
import { isTestEnv } from "@/utils/environments";
import TopLevelUseClient from "@/components/ui/TopLevelUseClient";
import { ReactQueryProvider } from "@/app-core/src/lib/providers/react-query-provider";
import { auth } from "@/src/auth";
import { getCurrentUserServerSide } from "../lib/auth/getCurrentUserServerSide";

/*
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" }); //inter is a variable font that requires no weights
const aleo = localFont({
  src: [
    { path: "../../../../public/fonts/Aleo-Regular.ttf", weight: "400" },
    { path: "../../../../public/fonts/Aleo-Bold.ttf", weight: "700" },
  ],
  variable: "--font-aleo",
});
*/
//const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-publicSans" });

type Params = {}; // Root layout has no dynamic params

export async function generateMetadata({ params }: { params: Params }) {
  //const { slug } = await params;
  return {
    title: process.env.NEXT_PUBLIC_APP_NAME,
    description: "Example",
    icons: {
      icon: "favicon.ico",
      shortcut: "favicon.ico",
      apple: "favicon.ico",
      other: {
        rel: "icon",
        url: "favicon.ico",
      },
    },
    applicationName: process.env.NEXT_PUBLIC_APP_NAME,
  } as Metadata;
}

export default async function Layout({ children, params }: { children: React.ReactNode; params: Params }) {
  // const { slug } = await params; // This is incorrect for the root layout
  const session = await auth();

  // Retrieve the headers object
  const headersList = await headers();
  const fullPath = headersList.get("x-current-path") ?? "";
  const bluePages = ["/signin", "/signup", "/signout", "/forgot-password"];
  const faintBluePages = ["/try", "/reset-password", "set-password", "/verify-email", "/setup", "/auth"];

  const isBlueBGPage = fullPath ? bluePages.some((page) => fullPath.startsWith(page)) : false;
  const isFaintBluePage = fullPath ? faintBluePages.some((page) => fullPath.startsWith(page)) : false;
  const pageBackgroundClassName = isBlueBGPage ? "bg-darkBlue" : isFaintBluePage ? "bg-faintBlue" : "bg-background";

  let currentUser: Record<string,any> | undefined = undefined;

  return (
    <html
      suppressHydrationWarning //one level deep (theme provider)
      lang="en"
      className={cn(" text-slate-900 antialiased", pageBackgroundClassName, `font-sans`)} //the outer most tag
    >
      <body className={cn("min-h-screen bg-background", pageBackgroundClassName)}>
        <TopLevelUseClient currentUser={currentUser}>
          <Providers currentUser={currentUser} session={session}>
            {isTestEnv() && (
              <div className="fixed z-50 m-1 flex flex-grow items-baseline gap-x-1 rounded-md border-b border-red-700 bg-red-500/80 px-1 text-xs text-white">
                <p>{"Test App -"}</p>
                <p className="text-xxs">{process.env.NEXT_PUBLIC_APP_VERSION ?? process.env.NEXT_PUBLIC_BUILD_DATE ?? new Date().toISOString()}</p>
              </div>
            )}
            <main className="">{children}</main>
          </Providers>
        </TopLevelUseClient>
      </body>
    </html>
  );
}
