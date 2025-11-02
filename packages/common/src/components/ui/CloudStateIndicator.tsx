import React, { useEffect, useState } from "react";
import { CloudOff, Cloud, RefreshCw, Check } from "lucide-react";
import { Loader2 } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
import { getHumanFriendlyDateDifference } from "../../utils/getHumanFriendlyDateDifference";
import { Button } from "./Button";
import { cn } from "../../lib/utils";

export const CloudStateIndicator = () => {
  const globCloudState = { cloudState: 0, lastSaved: new Date() };

  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    // Shake effect every 5 seconds when cloudState is -2
    if (globCloudState.cloudState === -2) {
      const interval = setInterval(() => {
        setIsShaking((prevIsShaking) => !prevIsShaking);
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setIsShaking(false);
    }
  }, [globCloudState.cloudState]);

  const renderIcon = () => {
    switch (globCloudState.cloudState) {
      case -2:
        return <Cloud className={`h-6 w-6 text-red-500 ${isShaking ? "animate-shake" : ""}`} style={{ fontSize: "inherit" }} />;
      case -1:
        return <CloudOff className="h-6 w-6 text-red-500" style={{ fontSize: "inherit" }} />;
      case 0:
        return <Cloud className="h-6 w-6 text-[20px] text-secondary-dark" style={{ fontSize: 25 }} />;
      case 1:
        return (
          <div className="relative text-secondary-dark">
            <Cloud className="h-6 w-6" style={{ fontSize: 25 }} />
            <div className="absolute right-[6px] top-[22px] h-[14px] w-[14px] items-center justify-center rounded-full bg-background text-[14px]">
              <RefreshCw className="absolute h-3.5 w-3.5 animate-spin rounded-full" style={{ fontSize: "inherit" }} />
            </div>
          </div>
        );
      case 2:
        return <Check className="h-6 w-6 mb-[2px] text-green" style={{ fontSize: 25 }} />;
    }
  };

  const getStatusBasedOnCloudState = () => {
    switch (globCloudState.cloudState) {
      case -2:
        return (
          <div className="text-red-500">
            <p>Server Error</p>
          </div>
        );
      case -1:
        return <div className="text-red-500">No Internet Connection</div>;
      case 0:
        return undefined;
      case 1:
        return (
          <div className="text-green">
            <p>Auto-Saving...</p>
          </div>
        );
      case 2:
        return (
          <div className="text-purple">
            <p>Autosaved</p>
          </div>
        );
    }
  };

  const getTitleBasedOnCloudState = () => {
    switch (globCloudState.cloudState) {
      case -2:
        return <span className="text-red-500">Server Error</span>;
      case -1:
        return <span className="text-red-500">No Internet Connection</span>;
      case 0:
        return <span className="text-gray-400">Autosave is active</span>;
      case 1:
        return <span>Autosaving...</span>;
      case 2:
        return <span className="text-green">Autosaved</span>;
    }
  };

  const getSubTitleBasedOnCloudState = () => {
    switch (globCloudState.cloudState) {
      case -2:
        return <span className="">Something went wrong</span>;
      case -1:
        return <span className="">Please ask your internet admin</span>;
      case 0:
        return (
          <div>
            <div className="">
              {globCloudState.lastSaved ? getHumanFriendlyDateDifference(globCloudState.lastSaved) + "ago" : "Ready to make changes"}{" "}
            </div>
          </div>
        );
      case 1:
        return <span>{process.env.NEXT_PUBLIC_APP_TITLE} automatically saves as you type and stays synced across devices.</span>;
      case 2:
        return <span className="">{process.env.NEXT_PUBLIC_APP_TITLE} automatically saves as you type and stays synced across devices.</span>;
    }
  };

  return (
    <HoverCard openDelay={800}>
      <HoverCardTrigger asChild>
        <div className="flex items-center justify-center p-[10px]">
          <div
            className={cn(
              { "mr-3 pt-1": getStatusBasedOnCloudState() !== undefined },
              "h-fit w-fit whitespace-nowrap text-center text-base font-normal md:block [@media(min-width:560px)]:block"
            )}
          >
            {getStatusBasedOnCloudState()}
          </div>
          <div className="w-fit text-[27px]">{renderIcon()}</div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-fit max-w-[350px]">
        <div className="space-y-1">
          <h4 className="text-md font-medium">{getTitleBasedOnCloudState()}</h4>
          <div className="text-sm font-normal">{getSubTitleBasedOnCloudState()}</div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
