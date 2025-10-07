"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { HiOutlineHome, HiOutlineUser, HiOutlineMenu, HiOutlineCalendar } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import { Settings2Icon } from "lucide-react";
import {
  DashboardCustomizeRounded,
  AutoGraphRounded,
  ConnectWithoutContactRounded,
  LineStyleRounded,
  TaskRounded,
  ConnectWithoutContactOutlined,
  DashboardCustomizeOutlined,
  LineStyleOutlined,
  TaskOutlined,
  AutoGraphOutlined,
  HelpOutlineOutlined,
  SettingsOutlined,
  RecentActorsOutlined,
  LogoutOutlined,
  InboxOutlined,
  OutboxOutlined,
  MoveToInboxOutlined,
} from "@mui/icons-material";
import ArrowBackIosNewOutlinedIcon from "@mui/icons-material/ArrowBackIosNewOutlined";
import { Avatar, AvatarFallback, AvatarImage } from "@common/components/ui/avatar";
import { cn } from "@common/lib/utils";
import { Popover } from "@mui/material";
import { PopoverContent, PopoverTrigger } from "@common/components/ui/popover";
import { SupportButton } from "@common/components/ui/SupportButton";
import { Button } from "@common/components/ui/Button";
import { TooltipWrapper } from "@common/components/ui/TooltipWrapper";
import { execPath } from "process";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { LineSpacer } from "../../../../common/src/components/ui/LineSpacer";
import { RefreshWindow, navigateToPath } from "@common/utils/DOM";
import { useUserUnengaged } from "@common/hooks/useUserUnengage";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import CorporateFareOutlinedIcon from "@mui/icons-material/CorporateFareOutlined";
import { isTestDevOrSuperAppAdmin, isTestEnv, isTestOrDevEnv } from "@common/utils/environments";
import { getCSSVariable } from "@common/utils/styles";
import { colourToHex } from "@common/utils/colour";
import { Link } from "@common/components/ui/Link";
import { pathEndsWith } from "@common/utils/url";
import InboxIcon from "@mui/icons-material/Inbox";
import { getNameInitials } from "@common/utils/stringManipulation";
import CollapsibleMenuIcon from "../dynamicSVGIcons/CollapsibleMenuIcon";

interface SideMenuProps {
  isNavBarFixed?: boolean;
  className?: string;
  hideDrawerExpandButton?: boolean;
  onSideMenuOpenChange?: (expanded: boolean) => any; //We pass it encase other apps try to use this component with a seperate redux state
  onExpandButtonClick?: (expand?: boolean) => any;
  hide?: boolean;
}

const SideMenu: React.FC<SideMenuProps> = ({
  isNavBarFixed = false,
  className,
  hideDrawerExpandButton = false,
  onSideMenuOpenChange,
  onExpandButtonClick,
  hide = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [widthChanging, setWidthChanging] = useState(false);
  const [windowWidth, setWindowWidth] = useState(100);
  const [isShort, setIsShort] = useState(false);
  const [supportButtonOpen, setSupportButtonOpen] = useState(false);
  const [expandButtonInMenu, setExpandButtonInMenu] = useState(false);
  const [deviceHasTouch, setDeviceHasTouch] = useState(false);
  const [sideMenuHeight, setSideMenuHeight] = useState(500);
  const [menuHovered, setMenuHovered] = useState(false);
  const [showDarkModeIcon, setShowDarkModeIcon] = useState(false);
  const themeToggleRef = useRef<HTMLDivElement>(null);
  const sideMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  //const [haveUserSession, setHaveUserSession] = useState(false);

  //const userObj = useCurrentUser()?.userData;
  const userObj = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    image: "https://via.placeholder.com/150",
    office: { name: "Office 1" },
  };

  const isTouchDevice = () => {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  };

  const handleExpandMenu = (expanded: boolean) => {
    setWidthChanging(true);
    setTimeout(() => {
      setWidthChanging(false);
      if (!expanded) {
        setMenuHovered(false);
      }
    }, 500);
    setExpanded(expanded);
    onSideMenuOpenChange?.(expanded);
    //dispatch(setSideMenuOpen(expanded));
  };

  useEffect(() => {
    setDeviceHasTouch(isTouchDevice());
    setExpandButtonInMenu(isTouchDevice());
  }, []);

  useEffect(() => {
    // Function to update state based on screen width
    function handleResize() {
      const windowWidthLocal = window.innerWidth;
      const windowHeightLocal = window.innerHeight;
      setWindowWidth(windowWidthLocal);
      if (windowWidthLocal < 630) {
        handleExpandMenu(false);
      } else if (windowWidthLocal > 1790) {
        handleExpandMenu(true);
      }

      if (windowHeightLocal < 630) {
        setIsShort(true);
      } else {
        setIsShort(false);
      }

      //Force the sidemenu to use an inmenu expand button if the window is too small
      if (windowWidthLocal < 1100 || deviceHasTouch) {
        setExpandButtonInMenu(true);
      } else {
        setExpandButtonInMenu(false);
      }

      //save half of the height of the side menu
      setSideMenuHeight(sideMenuRef.current?.clientHeight ?? 500);
    }
    handleResize();
    if (hide) {
      handleExpandMenu(false);
      return;
    }

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [hide]);

  const toggleMenu = (expand: boolean) => {
    handleExpandMenu(expand);
    onExpandButtonClick?.(expand);
  };

  const supportButtonRef = useRef<HTMLLIElement>(null);
  useUserUnengaged(
    supportButtonRef,
    () => {
      setSupportButtonOpen(false);
    },
    5000,
    supportButtonOpen
  );

  const keepInView = cn("flex flex-col overflow-y-auto overflow-x-hidden");

  const ulClass = cn("py-2 px-1 space-y-1 justify-center w-full", {});

  const liClass = cn("px-1 flex justify-start w-full min-w-full");

  const menuItemsOutlineClass = cn(
    "flex items-center justify-center h-min w-full h-full cursor-pointer gap-5 rounded-md p-2 hover:bg-red-600 dark:text-slate-400 dark:hover:text-slate-100",
    { "justify-start transition-all": expanded }
  );

  const menuItemsClass = cn({
    "flex items-center whitespace-nowrap justify-start text-md font-semibold": expanded,
  });

  const getActiveMenuItemsClass = (isActive?: boolean) => {
    return cn(menuItemsOutlineClass, {
      "bg-darkPurple": isActive,
    });
  };

  const iconSize = 26;

  useLayoutEffect(() => {
    if (!isNavBarFixed) {
      const lowerMenu = document.getElementById("lower-menu");

      const handleScroll = () => {
        const scrollY = window.scrollY;
        const maxPadding = 94;
        const newPadding = Math.max(maxPadding - scrollY, 8);
        if (lowerMenu) lowerMenu.style.paddingBottom = `${newPadding}px`;
      };

      window.addEventListener("scroll", handleScroll);
      // Remove the event listener when the component unmounts
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, []); // The empty dependency array ensures it runs only once after initial render

  const arrowColour = colourToHex(getCSSVariable("--purple"));

  return (
    <aside
      ref={sideMenuRef}
      className={cn(
        "fixed left-0 top-0 z-30 h-screen border-r bg-red-600 transition-all duration-240",
        {
          "top-navbar-height": false,
          "top-navbar-banner-height h-full-minus-navbar-banner": false,
          "-translate-x-full": hide,
        },
        className
      )}
      style={{
        maxWidth: expanded ? "var(--sideMenu-widthExpanded)" : "var(--sideMenu-width)",
        minWidth: expanded ? "var(--sideMenu-widthExpanded)" : "var(--sideMenu-width)",
      }}
      onPointerOver={() => {
        setMenuHovered(true);
      }}
      onPointerLeave={() => {
        setMenuHovered(false);
      }}
    >
      <div className="group flex h-full flex-col justify-between overflow-y-auto overflow-x-hidden pb-1">
        <div className="justify-start">
          <nav>
            <ul className={ulClass}>
              {/*
							<li className={liClass}>
							<TooltipWrapper
						className="border-none bg-red-600 text-white"
						tooltipText={expanded ? "collapse" : "expand"}
						hoverDelay={0}
						side="right"
            sideOffset={10}
						showArrow={true}
						//arrowColour="#3a2cad"
						 arrowColour={arrowColour}
					></TooltipWrapper>
								<div className={menuItemsOutlineClass}>
									<AutoGraphOutlined sx={{ fontSize: iconSize }} />
									{expanded && (
										<div className="flex items-center gap-4">
											<div className={menuItemsClass}>Analytics</div>
											<div className="mx-1 -mr-[3px] flex h-min whitespace-nowrap rounded-lg bg-skyBlue px-2 py-[1px] text-xs text-white">
												<div>COMING SOON</div>
											</div>
										</div>
									)}
								</div>
              </li>
              */}
            </ul>
          </nav>
        </div>
        <div id="lower-menu" style={{}} className="justify-end">
          <nav>
            <ul className={cn(ulClass, "pb-0.5")}>
              {isShort && (
                <li className="flex h-min cursor-pointer flex-col items-center gap-5 rounded-md px-1 py-2">
                  <LineSpacer className="border-white dark:border-secondary-dark" />
                </li>
              )}
              {expandButtonInMenu && (
                <li
                  className={cn(liClass, "h-[44px] w-full", {
                    "": !expanded,
                  })}
                  onClick={() => toggleMenu(!expanded)}
                >
                  <div className="flex h-full w-full items-center">
                    <TooltipWrapper
                      className="border-none bg-red-600 text-white"
                      classNameChildren={menuItemsOutlineClass}
                      tooltipText={expanded ? "collapse" : "expand"}
                      hoverDelay={0}
                      side="right"
                      sideOffset={10}
                      showArrow={true}
                      //arrowColour="#3a2cad"
                      arrowColour={arrowColour}
                      disabled={expanded}
                    >
                      <div
                        style={{ maxWidth: iconSize, width: iconSize }}
                        className={cn("w-fit cursor-pointer items-center justify-start px-[1px] py-[3px]", {})}
                      >
                        <CollapsibleMenuIcon animationState={Number(expanded)} />
                      </div>
                      {expanded && <div className={menuItemsClass}>Collapse</div>}
                    </TooltipWrapper>
                  </div>
                </li>
              )}

              <Link className={liClass} href="/settings">
                <TooltipWrapper
                  className="flex border-none bg-red-600 text-white"
                  classNameChildren={getActiveMenuItemsClass(pathname.includes("/settings"))}
                  tooltipText="Settings"
                  hoverDelay={0}
                  side="right"
                  sideOffset={10}
                  showArrow={true}
                  //arrowColour="#3a2cad"
                  arrowColour={arrowColour}
                  disabled={expanded}
                >
                  <SettingsOutlined sx={{ fontSize: iconSize }} />
                  {expanded && <div className={menuItemsClass}>Settings</div>}
                </TooltipWrapper>
              </Link>

              <li
                className={liClass}
                onClick={() => {
                  //setSupportButtonOpen(!supportButtonOpen);
                }}
              >
                <TooltipWrapper
                  className="flex border-none bg-red-600 text-white"
                  classNameChildren={menuItemsOutlineClass}
                  tooltipText="Support"
                  hoverDelay={0}
                  side="right"
                  sideOffset={10}
                  showArrow={true}
                  //arrowColour="#3a2cad"
                  arrowColour={arrowColour}
                  disabled={expanded}
                  //Error without asChild, there is an error that button cannot be a child of a button
                  asChild
                >
                  <div className="mx-auto flex h-full cursor-pointer items-center justify-center">
                    <SupportButton
                      iconSize={iconSize}
                      open={supportButtonOpen}
                      expanded={expanded}
                      menuItemsOutlineClass={"flex gap-x-5"}
                      menuItemsClass={menuItemsClass}
                      handleOpenState={setSupportButtonOpen}
                      onHandleIssueClick={(type: string) => {
                        const title = type === "bug" ? "Report a bug" : type === "feature" ? "Suggest a feature" : "Request a form content adjustment";
                      }}
                    />
                  </div>
                </TooltipWrapper>
              </li>
              <li className={liClass} onClick={() => {}}>
                <TooltipWrapper
                  className="border-none bg-red-600 text-white"
                  classNameChildren={menuItemsOutlineClass}
                  tooltipText="Sign out"
                  hoverDelay={0}
                  side="right"
                  sideOffset={10}
                  showArrow={true}
                  //arrowColour="#3a2cad"
                  arrowColour={arrowColour}
                  disabled={expanded}
                >
                  <LogoutOutlined sx={{ fontSize: iconSize, rotate: "180deg" }} />
                  {expanded && <div className={menuItemsClass}>Sign Out</div>}
                </TooltipWrapper>
              </li>
              <li className="flex h-min cursor-pointer flex-col items-center gap-5 rounded-md px-1 py-2">
                <LineSpacer className="border-white dark:border-secondary-dark" />
              </li>
              <li className={cn("w-full rounded-md px-1 py-1 hover:bg-red-600 dark:text-slate-400 dark:hover:text-slate-100")}>
                <TooltipWrapper
                  className="mb-2 border-none bg-red-600 pb-2 text-white"
                  classNameChildren={"w-full flex items-center justify-center gap-x-5"}
                  tooltipText="User Settings"
                  tooltipJSX={
                    <div className="flex w-full items-center justify-center">
                      <div className="grid" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gridTemplateRows: "auto auto", gap: "5px" }}>
                        <div className="flex items-center gap-x-1">
                          <PermIdentityOutlinedIcon sx={{ fontSize: iconSize }} />
                          <h2 className="text-base font-bold">{userObj?.firstName + " " + userObj?.lastName}</h2>
                        </div>
                        <div style={{ gridRow: "2 / 3" }}>
                          <p>{userObj?.email}</p>
                        </div>
                        <div className="flex items-center gap-x-1 pt-1" style={{ gridColumn: "1 / 2" }}>
                          <CorporateFareOutlinedIcon sx={{ fontSize: iconSize }} />
                          <h2 className="text-base">{userObj?.office?.name}</h2>
                        </div>
                      </div>
                    </div>
                  }
                  hoverDelay={0}
                  side="right"
                  sideOffset={10}
                  showArrow={true}
                  //arrowColour="#3a2cad"
                  arrowColour={arrowColour}
                  asChild
                >
                  <div className="flex w-full items-center justify-center gap-x-5">
                    <Avatar className="items-start">
                      <AvatarImage src={userObj?.image ? userObj?.image : undefined} />
                      <AvatarFallback className="bg-skyBlue">{getNameInitials(userObj?.firstName, userObj?.lastName)}</AvatarFallback>
                    </Avatar>
                    {expanded && (
                      <div className="max-w-[150px] items-start self-start overflow-clip align-baseline">
                        <h4 className="flex justify-start font-bold">{userObj?.firstName + " " + userObj?.lastName}</h4>
                        <p>{userObj?.email}</p>
                      </div>
                    )}
                  </div>
                </TooltipWrapper>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      {!expandButtonInMenu && (
        <div
          //Drawer Expand button div
          //flex and items-center for the button to be centered
          className={cn("flex h-full cursor-pointer items-center transition-all duration-500", {
            "duration-240": widthChanging,
          })}
          style={{
            position: "absolute",
            top: 0,
            left: expanded ? "var(--sideMenu-widthExpanded)" : "var(--sideMenu-width)",
            zIndex: 900,
            width: 16,
          }}
          onClick={() => toggleMenu(!expanded)}
        >
          <TooltipWrapper
            style={{ transform: "translateY(-35px)" }}
            className={cn("border-none bg-red-600 text-white", {
              //"duration-0": widthChanging,
            })}
            //classNameChildren={menuItemsOutlineClass}
            tooltipText={expanded ? "Collapse" : "Expand"}
            hoverDelay={250}
            side="right"
            sideOffset={10}
            showArrow={true}
            //arrowColour="#3a2cad"
            arrowColour={arrowColour}
            disabled={expandButtonInMenu && hideDrawerExpandButton}
            asChild
          >
            <div
              hidden={expandButtonInMenu && hideDrawerExpandButton}
              style={{ opacity: !hideDrawerExpandButton && !expandButtonInMenu && (menuHovered || widthChanging) ? 1 : 0 }}
              className="flex h-[80px] justify-start rounded-r-2xl border-[1.5px] border-l-0 border-background-blue bg-background/80 text-background-blue transition-all duration-500 dark:border-slate-400 dark:text-slate-400"
            >
              <div className="mx-auto flex h-full cursor-pointer items-center justify-center" hidden={expandButtonInMenu && hideDrawerExpandButton}>
                <div
                  className="flex h-fit w-fit transition-all duration-500"
                  style={{
                    transform: expanded ? "rotate(0deg)" : "rotate(180deg)",
                  }}
                >
                  <ArrowBackIosNewOutlinedIcon className="-m-[2px]" sx={{ fontSize: 20 }} />
                </div>
              </div>
            </div>
          </TooltipWrapper>
        </div>
      )}
    </aside>
  );
};

export default SideMenu;
