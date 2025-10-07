"use client";

import "@/styles/globals.css";
import SideMenu from "@common/components/ui/sideMenu";
import { cn } from "@common/lib/utils";
import { PageContentContainer } from "@common/components/ui/PageContentContainer";
import { LegalFooter } from "@/components/ui/LegalFooter";
import { use, useState, useRef } from "react";
import { StateInitializerWrapper } from "@/src/lib/state/stateInitializer";
import { Heading } from "@common/components/ui/Heading";
import useScrollPosition from "@common/hooks/useScrollPosition";
import { FloatingNavbar } from "@/src/components/floating-navbar";
import Image from "next/image";
import typescriptLogo from "@/public/imgs/Typescript_logo_2020.svg";

export default function Layout(props: { children: React.ReactNode; params: Promise<{}> }) {
  const params = use(props.params);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [hideSideMenu, setHideSideMenu] = useState(true);
  const [enableScrollDetection, setEnableScrollDetection] = useState(true);

  const mainContentRef = useRef<HTMLDivElement>(null);

  const reHideSideMenu = true;

  const { scrollY } = useScrollPosition(mainContentRef, 20, undefined, enableScrollDetection);
  const isScrollTop = scrollY <= 0;

  console.log("isScrollTop", scrollY, isScrollTop);

  function handleSideMenuOpenChange(expanded: boolean) {
    setSideMenuOpen(expanded);
  }

  function handleExpandButtonClick(expand?: boolean) {
    if (expand) {
      setHideSideMenu(false);
    } else if (reHideSideMenu) {
      setHideSideMenu(true);
    }
  }

  return (
    <div className="bg-background">
      <StateInitializerWrapper />

      {/* Full height fixed side menu, 45px wide */}
      <SideMenu
        onSideMenuOpenChange={handleSideMenuOpenChange}
        className="border-none"
        hide={hideSideMenu}
        onExpandButtonClick={handleExpandButtonClick}
      />

      {/* Content area to the right of the side menu */}
      <div className={cn("transition-all duration-240", { "ml-sideMenu-widthExpanded": sideMenuOpen, "ml-sideMenu-width": !hideSideMenu })}>
        {/*Black top navbar, 55px tall, inset from the side menu to the right edge */}
        {/*<header className={cn("fixed left-sideMenu-width top-0 z-20 w-full h-navbar-height px-8 bg-black transition-all duration-300", { "left-[220px]": sideMenuOpen, "h-navbar-height-small": !isScrollTop })}>
          <Heading headingClassName="text-white" headingContainerClassName="text-white" h={1} title="Platform" />
        </header>
        */}
        {/* Main page content - THIS is now the scroll container */}
        <div ref={mainContentRef} className={cn("h-screen overflow-y-auto flex flex-col transition-all duration-300")}>
          <FloatingNavbar logoSrc={typescriptLogo} position={"relative"} className="p-0" variant={"black"} shape={"square"} expanded={isScrollTop} />
          <main className="flex-1">
            <div className="max-w-7xl mx-auto">{props.children}</div>
          </main>

          <LegalFooter className="mx-auto max-w-5xl" />
        </div>
      </div>
    </div>
  );
}
