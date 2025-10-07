"use client";

import { TabbedNavigation } from "../../../../../common/src/components/ui/tabbed-navigation";
import { ClientSelection } from "../../../../../common/src/components/ui/client-selection";
import { ChartLine, Lightbulb, Star, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { InvestmentConsultation } from "@/src/components/investmentConsultation";
import { useState } from "react";
import InvestmentRecommendations from "@/src/components/investment-recommendations";

export default function Home() {
  //redirect("/entries"); //we don't use this page yet

  const [profile, setProfile] = useState<Record<string, any> | null>(null);

  const {
    register,
    watch,
    formState: { errors },
  } = useForm();

  //watch latest values
  const latestValues = watch();
  console.log("latestValues", latestValues);

  return (
    <div className="flex flex-col items-center justify-start gap-2 lg:items-start lg:justify-center">
      <TabbedNavigation
        className="border-2 border-faintBlue drop-shadow-lg"
        tabs={[
          {
            id: "tab1",
            label: "T1",
            icon: <User className="h-8 w-8" />,
            tabContent: <div>T1</div>,
          },
          {
            id: "tab2",
            label: "T2",
            icon: <Lightbulb className="h-8 w-8" />,
            tabContent: <div>T2</div>,
          },
          {
            id: "tab3",
            label: "T3",
            icon: <ChartLine className="h-8 w-8" />,
            tabContent: <div>T3</div>,
          },
        ]}
      />
    </div>
  );
}
