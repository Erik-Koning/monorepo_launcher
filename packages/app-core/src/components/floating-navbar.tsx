"use client";

import { useState } from "react";
import Image from "next/image";
import { Activity, X } from "lucide-react";
import { cn } from "@common/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

import { Switch } from "@common/components/ui/switch";
import { Label } from "@common/components/ui/Label";
import { MockAgentGraph } from "./mock-agent-graph";

const navbarVariants = cva("flex w-full h-navbar-height px-6 py-3 shadow-lg border transition-colors duration-200", {
  variants: {
    variant: {
      glass: "bg-background/80 backdrop-blur-xl border-border/50",
      black: "bg-black/90 backdrop-blur-xl border-white/10",
    },
    shape: {
      rounded: "max-w-7xl mx-auto rounded-full",
      square: "rounded-none",
    },
  },
  defaultVariants: {
    variant: "glass",
    shape: "rounded",
  },
});

const textVariants = cva("", {
  variants: {
    variant: {
      glass: "text-foreground",
      black: "text-white",
    },
  },
  defaultVariants: {
    variant: "glass",
  },
});

const mutedTextVariants = cva("", {
  variants: {
    variant: {
      glass: "text-muted-foreground",
      black: "text-white/70",
    },
  },
  defaultVariants: {
    variant: "glass",
  },
});

const accentVariants = cva("", {
  variants: {
    variant: {
      glass: "hover:bg-accent",
      black: "hover:bg-white/10",
    },
  },
  defaultVariants: {
    variant: "glass",
  },
});

const popupVariants = cva(
  "absolute right-0 mt-2 w-[80vw] max-h-[80vh] overflow-y-auto rounded-xl shadow-lg p-4 transition-all duration-300 ease-in-out transform",
  {
    variants: {
      variant: {
        glass: "bg-background/95 border-border/50",
        black: "bg-black/95 border-white/10",
      },
    },
    defaultVariants: {
      variant: "glass",
    },
  }
);

const sectionVariants = cva("rounded-lg p-3", {
  variants: {
    variant: {
      glass: "bg-accent/50",
      black: "bg-white/5",
    },
  },
  defaultVariants: {
    variant: "glass",
  },
});

interface FloatingNavbarProps extends VariantProps<typeof navbarVariants> {
  position?: "fixed" | "relative";
  className?: string;
  expanded?: boolean;
  logoSrc?: string;
}

export function FloatingNavbar({ position = "fixed", variant, shape, className, logoSrc }: FloatingNavbarProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const handleIconClick = () => {
    setIsPopupOpen((prev) => !prev);
  };

  const handleIconHover = () => {
    if (!isPopupOpen) {
      setIsPopupOpen(true);
    }
  };

  return (
    <div className={cn("w-full z-50 px-4 py-3", position === "fixed" ? "fixed top-0 left-0" : "relative", className)}>
      <nav className={navbarVariants({ variant, shape })}>
        <div className="flex w-full items-center justify-start gap-x-4">
          {/* Left side - Logo and Main Title */}
          {logoSrc && (
            <div className="flex items-center gap-2">
              <Image src={logoSrc} className="mx-4" alt="Vesta Investment Advisory Copilot" width={32} height={32} />
              <h1 className={cn("text-2xl font-semibold", textVariants({ variant }))}>Hello World</h1>
            </div>
          )}

          {/* Left side - Sub-heading and Description */}
          <div className="flex flex-col pt-2">
            <h1 className={cn("text-lg font-semibold leading-tight", textVariants({ variant }))}>Vesta Investment Advisory Copilot</h1>
            <p className={cn("text-xs", mutedTextVariants({ variant }))}>Agentic AI-Powered Investment Planning</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-x-2">
          {/* Right side content */}
          {/* Right side - Icon with Popup */}
          <div className="relative">
            <button
              onClick={handleIconClick}
              onMouseEnter={handleIconHover}
              className={cn(
                "p-2.5 rounded-full transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                accentVariants({ variant }),
                isPopupOpen && (variant === "black" ? "bg-white/10" : "bg-accent")
              )}
              aria-label="View backend logs"
            >
              <Activity className={cn("w-5 h-5", textVariants({ variant }))} />
            </button>

            {/* Popup */}
            {isPopupOpen && (
              <div className={cn("relative flex flex-col", popupVariants({ variant }))} onMouseLeave={() => !isLocked && setIsPopupOpen(false)}>
                {/* Non-scrollable Header */}
                <div className="relative flex-shrink-0 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className={cn("text-sm font-semibold", textVariants({ variant }))}>Backend Logs & Agentic Map</h3>
                  </div>
                  <div className="absolute top-5 right-16 flex items-center space-x-2">
                    <Switch
                      id="lock-popup"
                      checked={isLocked}
                      onCheckedChange={setIsLocked}
                      className="data-[state=checked]:bg-green data-[state=unchecked]:bg-darkGray"
                    />
                    <Label
                      htmlFor="lock-popup"
                      className={cn("cursor-pointer rounded-md px-2 py-1 text-xs", isLocked ? "bg-black text-white" : "bg-white text-black")}
                    >
                      {isLocked ? "Locked" : "Lock"}
                    </Label>
                  </div>
                  <button
                    onClick={() => setIsPopupOpen(false)}
                    className={cn("absolute top-4 right-4 p-1 rounded-lg transition-colors", accentVariants({ variant }))}
                    aria-label="Close popup"
                  >
                    <X className={cn("w-4 h-4", mutedTextVariants({ variant }))} />
                  </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="overflow-y-auto px-4 pb-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left side of popup - Logs and static map */}
                    <div className="space-y-2">
                      {/* Agentic Map Section */}
                      <div className={sectionVariants({ variant })}>
                        <h4 className={cn("text-xs font-medium mb-2", textVariants({ variant }))}>Agentic Process Map</h4>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className={cn("text-xs", mutedTextVariants({ variant }))}>Client Analysis Agent</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className={cn("text-xs", mutedTextVariants({ variant }))}>Portfolio Optimization Agent</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                            <span className={cn("text-xs", mutedTextVariants({ variant }))}>Risk Assessment Agent</span>
                          </div>
                        </div>
                      </div>

                      {/* Backend Logs Section */}
                      <div className={sectionVariants({ variant })}>
                        <h4 className={cn("text-xs font-medium mb-2", textVariants({ variant }))}>Recent Logs</h4>
                        <div className={cn("space-y-1 font-mono text-xs max-h-32 overflow-y-auto", mutedTextVariants({ variant }))}>
                          <div>[12:34:56] Client profile loaded</div>
                          <div>[12:35:02] Running portfolio analysis...</div>
                          <div>[12:35:08] Risk score calculated: 6.2/10</div>
                          <div>[12:35:15] Generating recommendations...</div>
                        </div>
                      </div>
                    </div>

                    {/* Right side of popup - Agent Graph */}
                    <div className="w-full h-full">
                      <MockAgentGraph />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
