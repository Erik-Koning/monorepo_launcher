import React, { useEffect, useState } from "react";
import { forwardRef } from "react";
import { cn } from "@common/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { MessageSquare } from "lucide-react";
import { ConsultationTopics } from "./consultation-topics";
import { ConsultationQuestions } from "./consultation-questions";
import { CardWithLabels } from "@/packages/common/src/components/ui/cardWithLabels";

const InvestmentConsultationVariants = cva("", {
  variants: {
    variant: {
      default: "",
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

interface InvestmentConsultationProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof InvestmentConsultationVariants> {
  className?: string;
  selectedClientProfile: Record<string, any> | null;
}

const consultationTopics = [
  {
    label: "Risk Profile Review",
    icon: "chart",
    text: "I need to review the risk profile with the client. Based on their current portfolio allocation and investment timeline, please provide recommendations for adjusting their risk tolerance and asset allocation strategy.",
  },
  {
    label: "Retirement Strategy",
    icon: "umbrella",
    text: "I need to discuss retirement planning strategies with the client. Given their current age, retirement goals, and existing savings, please recommend contribution strategies, withdrawal planning, and income optimization approaches.",
  },
  {
    label: "Portfolio Rebalancing",
    icon: "briefcase",
    text: "I need to discuss portfolio rebalancing with the client. Based on their current asset allocation and market conditions, please recommend rebalancing strategies to maintain their target allocation and optimize returns.",
  },
  {
    label: "Tax Optimization",
    icon: "barchart",
    text: "I need to explore tax optimization strategies with the client. Given their income level and investment accounts, please recommend tax-efficient investment strategies, contribution room utilization, and tax-loss harvesting opportunities.",
  },
  {
    label: "Education Planning",
    icon: "graduation",
    text: "I need to discuss education planning with the client. Based on their children's ages and education goals, please recommend RESP contribution strategies, grant maximization, and investment approaches for education savings.",
  },
  {
    label: "Estate Planning",
    icon: "file",
    text: "I need to discuss estate planning considerations with Priya Sharma. Given their net worth of approximately $1,523,800 and growth objectives, please recommend estate planning strategies including beneficiary designations, tax-efficient wealth transfer options, and appropriate insurance coverage.",
  },
];

export const tailoredQuestionsForPriya = [
  "Both ESG principles and religious considerations are important to you. To ensure we're perfectly aligned, could you elaborate more? For example, are you looking for investments that are strictly certified as Halal, or are you more focused on a broader ESG approach that avoids specific industries like alcohol and gambling?",
  "You've mentioned two exciting long-term goals: retiring at 60 and potentially purchasing another rental property. To help plan our strategy for the $95,000 you're ready to invest, could you share your thoughts on how you see these two goals relating? Do you envision the rental property generating income to support your retirement, or is it a separate goal for wealth diversification?",
  "We've set a primary objective of 'Growth' for your portfolio. As we also plan for Arjun's and Kavya's education, with the first university expenses about 6 years away, how do you feel about balancing that growth objective with capital preservation for their education funds to ensure the capital is there when they need it?",
];

const handleResponsesChange = (responses: Record<number, string>) => {
  console.log("responses", responses);
};

const handleGenerate = (text: string) => {
  console.log("text", text);
};

export const InvestmentConsultation = forwardRef<HTMLDivElement, InvestmentConsultationProps>(
  ({ className, variant, size, selectedClientProfile, ...props }, ref) => {
    return (
      <div {...props} className={cn("space-y-4", InvestmentConsultationVariants({ variant, size }), className)} ref={ref}>
        <CardWithLabels
          className=""
          leftLabelJSX={
            <div className="flex items-center gap-4">
              <div className="flex p-3 items-center justify-center gap-2 rounded-xl border border-white/30 bg-red-600/20 backdrop-blur-sm">
                <MessageSquare className="h-7 w-7 text-primary" />
                <span className="text-xl font-semibold">Investment Consultation</span>
              </div>
              {/*<h1 className="text-3xl font-semibold tracking-tight text-foreground">Client Profile</h1>*/}
            </div>
          }
        >
          <div className="flex flex-col gap-y-2 items-start justify-start">
            <h1 className="text-lg font-semibold">For {selectedClientProfile?.name}</h1>
            <p>Some questions about your investment goals and topics of interest...</p>
          </div>
        </CardWithLabels>
        <ConsultationQuestions questions={tailoredQuestionsForPriya} onResponsesChange={handleResponsesChange} />

        <ConsultationTopics topics={consultationTopics} maxLength={2000} onGenerate={handleGenerate} />
      </div>
    );
  }
);

InvestmentConsultation.displayName = "InvestmentConsultation";
