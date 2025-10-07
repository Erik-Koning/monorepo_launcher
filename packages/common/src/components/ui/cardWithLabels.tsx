import React, { useEffect, useState } from "react";
import { forwardRef } from "react";
import { cn } from "@common/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";
import { gradientClassName } from "@common/lib/tailwind/classNames";
const CardWithLabelsVariants = cva("w-full rounded-lg p-5", {
  variants: {
    variant: {
      default: "border-2 border-green bg-emerald-50",
      modern: cn("relative text-white"),
    },
    size: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface CardWithLabelsProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof CardWithLabelsVariants> {
  className?: string;
  leftLabelJSX?: React.ReactNode;
  rightLabelJSX?: React.ReactNode;
  title?: string;
  gridContent?: React.ReactNode;
  children?: React.ReactNode;
  variant?: "default" | "modern";
}

export const CardWithLabels = forwardRef<HTMLDivElement, CardWithLabelsProps>(
  ({ className, variant = "modern", size, leftLabelJSX, rightLabelJSX, title, gridContent, children, ...props }, ref) => {
    return (
      <div className={cn(CardWithLabelsVariants({ variant, size }), gradientClassName, "pt-14", className)}>
        <div className="absolute -top-3 left-4">{leftLabelJSX}</div>
        <div className="absolute -top-3 right-4">{rightLabelJSX}</div>

        {children}
      </div>
    );
  }
);

CardWithLabels.displayName = "CardWithLabels";
