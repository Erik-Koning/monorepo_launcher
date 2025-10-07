"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@common/lib/utils";
import { ReactNode } from "react";

interface TabbedNavigationProps {
  tabs: tabContent[];
  className?: string;
}

export interface tabContent {
  id: string;
  label: string;
  icon: ReactNode;
  tabContent: ReactNode;
}

export function TabbedNavigation({ tabs, className }: TabbedNavigationProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const tabVariants = {
    active: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    inactive: {
      opacity: 0,
      y: 10,
      transition: {
        opacity: { duration: 0 },
        y: { duration: 0.3 },
      },
    },
  };

  return (
    <div className="w-full mx-auto p-4">
      <nav className="relative bg-card rounded-2xl p-1.5 py-1.5 shadow-sm border border-border/50 backdrop-blur-xl">
        <div className="flex gap-1 relative">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex-1 px-6 py-[8px] text-lg font-medium rounded-xl transition-colors duration-[200ms] z-0 flex items-center gap-x-2",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 justify-center",
                activeTab === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-background rounded-xl shadow-sm border border-border/50 after:content-[''] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-red-500 after:rounded-full"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}
              <div className="relative z-0">{tab.icon}</div>
              <span className="relative z-0">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Tab Content */}
      <div className="relative mt-8">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <motion.div
              key={tab.id}
              variants={tabVariants}
              animate={isActive ? "active" : "inactive"}
              style={{
                pointerEvents: isActive ? "auto" : "none",
                position: isActive ? "relative" : "absolute",
                top: 0,
                left: 0,
                right: 0,
                marginTop: isActive ? 0 : -1000,
                zIndex: isActive ? 10 : -10,
              }}
              className={cn("p-8 bg-card rounded-2xl border border-border/50 shadow-sm", className)}
            >
              {tab.tabContent}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
