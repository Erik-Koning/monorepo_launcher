import {
  User,
  Briefcase,
  DollarSign,
  Target,
  TrendingUp,
  PieChart,
  Edit,
  CircleSlash,
  CircleX,
  Hourglass,
  BarChart,
  MessageSquare,
  Lightbulb,
  ChartLine,
  CheckCircle2,
  TriangleAlert,
} from "lucide-react";
import { Card } from "@common/components/ui/card";
import { cn } from "@common/lib/utils";
import { InfoDisplay } from "./info-display";
import { clientProfiles } from "./client-selection";
import { removeKeysNotInArray } from "@common/utils/objectManipulation";
import { Label } from "./Label";
import { Input } from "../inputs/Input";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { LoadingProcess, ProcessItem } from "./loading-process";
import { useState } from "react";
import { gradientClassName } from "@common/lib/tailwind/classNames";


export const loadingProcessItems: ProcessItem[] = [
  {
    id: "kyc",
    icon: <Hourglass />,
    title: "Reaching out to KYC, Partymaster, and Databricks",
    subtitle: "Connecting to external data sources...",
  },
  {
    id: "aggregate",
    icon: <BarChart />,
    title: "Aggregating information",
    subtitle: "Consolidating client data from multiple sources...",
  },
  {
    id: "profile",
    icon: <User />,
    title: "Creating profile",
    subtitle: "Building comprehensive client profile...",
  },
  {
    id: "Consulation",
    icon: <MessageSquare />,
    title: "Consulation Questions",
    subtitle: "Creating client specific questions...",
    isBackground: true,
  },
  {
    id: "Recommendations",
    icon: <Lightbulb />,
    title: "Recommendations",
    subtitle: "Generating recommendations...",
  },
  {
    id: "visualization",
    icon: <ChartLine />,
    title: "Creating visualization",
    subtitle: "Generating visual representations...",
  },
  {
    id: "complete",
    icon: <CheckCircle2 />,
    title: "Client profile created",
    subtitle: "Profile successfully generated and validated",
  },
];

interface ClientProfileProps {
  selectedClient: Record<string, any>;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  latestValues: any;
  selectedClientProfile: Record<string, any> | null;
}

export function ClientProfile({ selectedClient, register, errors, latestValues, selectedClientProfile }: ClientProfileProps) {
  const keysToShowInSelectedClient = ["name", "age", "location", "profession", "riskProfile", "netWorth", "primaryGoal"];
  const clientProfile = selectedClientProfile ?? clientProfiles.find((client) => client.account_info?.client_id ?? (client as any)?.id === selectedClient.value);
  const clientInfoDisplayData = removeKeysNotInArray(clientProfile, keysToShowInSelectedClient);
  const [isComplete, setIsComplete] = useState(false);

  function onComplete() {
    console.log("onComplete");
    setIsComplete(true);
  }

  const totalUnbalanced =
    (latestValues?.Americas ? +latestValues?.Americas : 0) +
      (latestValues?.EMEA ? +latestValues?.EMEA : 0) +
      (latestValues?.APAC ? +latestValues?.APAC : 0) !==
    100
      ? true
      : false;

  return (
    <div className="space-y-8">
      {/* Header */}
      {/* The Selected Client */}
      <InfoDisplay
        title="Selected Client"
        labelJSX={
          <div className="flex items-center gap-4">
            <div className="flex p-3 items-center justify-center gap-2 rounded-xl border border-white/30 bg-red-600/20 backdrop-blur-sm">
              <User className="h-7 w-7 text-primary" />
              <span className="text-xl font-semibold">{clientProfile?.personal_info?.first_name}</span>
            </div>
            {/*<h1 className="text-3xl font-semibold tracking-tight text-foreground">Client Profile</h1>*/}
          </div>
        }
        rightLabelJSX={
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex p-3 items-center justify-center gap-2 rounded-lg border border-white/30 bg-red-600/20 backdrop-blur-sm">
                <Edit className="h-7 w-7 text-primary" />
              </div>
              {/*<h1 className="text-3xl font-semibold tracking-tight text-foreground">Client Profile</h1>*/}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex p-3 items-center justify-center gap-2 rounded-lg border border-white/30 bg-red-600/20 backdrop-blur-sm">
                <CircleX className="h-7 w-7 text-primary" />
              </div>
              {/*<h1 className="text-3xl font-semibold tracking-tight text-foreground">Client Profile</h1>*/}
            </div>
          </div>
        }
        variant={"modern"}
        data={clientInfoDisplayData ?? {}}
        combineKeys={[["age", "location"]]}
        className="mt-2"
      />

      {!isComplete ? (
        <LoadingProcess items={loadingProcessItems} onComplete={onComplete} />
      ) : (
        <>
          {/* Personal Information */}
          <Card className="overflow-hidden border-0 bg-card shadow-sm ring-1 ring-border/50 p-0">
            <div className={cn(" px-6 py-4", gradientClassName)}>
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-primary-foreground" />
                <h2 className="text-lg font-semibold text-primary-foreground">Personal Information</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <InfoField label="Full Name" value="Priya Sharma" />
                <InfoField label="Date of Birth" value="1983-12-03" />
                <InfoField label="Age" value="41" />
                <InfoField label="Country" value="Canada" />
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <InfoField label="Employment Status" value="Employed" />
                <InfoField label="Annual Income" value="$400,000" />
                <InfoField label="Net Worth" value="$1,523,800" />
                <InfoField label="Investment Experience" value="10 years" />
              </div>
            </div>
          </Card>
          {/* Financial Position */}
          <Card className="overflow-hidden border-0 bg-card shadow-sm ring-1 ring-border/50 p-0">
            <div className={cn(" px-6 py-4", gradientClassName)}>
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-primary-foreground" />
                <h2 className="text-lg font-semibold text-primary-foreground">Financial Position</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <InfoField label="Investment Amount" value="$250,000" />
                <InfoField label="RRSP Room Available" value="$32,000" />
                <InfoField label="TFSA Room Available" value="$15,000" />
                <InfoField label="Time Horizon" value="Medium Term" />
              </div>
            </div>
          </Card>
          {/* Risk Assessment */}
          <Card className="overflow-hidden border-0 bg-card shadow-sm ring-1 ring-border/50 p-0">
            <div className={cn(" px-6 py-4", gradientClassName)}>
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-primary-foreground" />
                <h2 className="text-lg font-semibold text-primary-foreground">Risk Assessment and Investment Preference</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <InfoField label="Risk Tolerance" value="Moderate" />
                <InfoField label="Investment Objectives" value="Growth" />
              </div>

              {/* Regional Allocation */}
              <div className="mt-8">
                <h3 className="mb-4 text-sm font-medium text-muted-foreground">Regional Allocation</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <AllocationCard color="bg-emerald-50" region="Americas" percentage={30} register={register} errors={errors} />
                  <AllocationCard color="bg-yellow-50" region="EMEA" percentage={55} register={register} errors={errors} />
                  <AllocationCard color="bg-orange-50" region="APAC" percentage={15} register={register} errors={errors} />
                  <AllocationCard color="" region="Total" percentage={100} isTotal register={register} errors={errors} totalUnbalanced={totalUnbalanced} />
                </div>
                {totalUnbalanced && (
                  <Label
                    width="full"
                    variant={"blank"}
                    className="w-full flex items-center justify-center gap-2 mt-4 rounded-lg min-h-6 bg-red-50 border border-red-500 p-1"
                  >
                    <TriangleAlert className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium text-red-500">Total allocation is not 100%</span>
                  </Label>
                )}
              </div>
            </div>
          </Card>
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="overflow-hidden border-0 bg-card shadow-sm ring-1 ring-border/50 p-0">
              <div className="border-l-4 border-red-600 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/20">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Financial Overview</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <SummaryItem label="Net Worth" value="$1,523,800" />
                  <SummaryItem label="Annual Income" value="$400,000" />
                  <SummaryItem label="Risk Tolerance" value="Moderate" />
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden border-0 bg-card shadow-sm ring-1 ring-border/50 p-0">
              <div className="border-l-4 border-red-600 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/20">
                    <PieChart className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Investment Goals</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <SummaryItem label="Primary Objective" value="Growth" />
                  <SummaryItem label="Time Horizon" value="Medium Term" />
                  <SummaryItem label="Investment Amount" value="$250,000" />
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function InfoField({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="rounded-lg bg-accent/50 px-4 py-3 text-sm font-medium text-foreground backdrop-blur-sm">{value}</div>
    </div>
  );
}

function AllocationCard({
  region,
  percentage,
  color,
  isTotal = false,
  totalUnbalanced = true,
  register,
  errors,
}: {
  region: string;
  percentage: number;
  color: string;
  isTotal?: boolean;
  totalUnbalanced?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
}) {
  const incorrectPercentage = isTotal && totalUnbalanced;

  return (
    <div
      className={cn(
        `rounded-lg ${color} py-1 px-4 backdrop-blur-sm ring-1 ring-inset`,
        isTotal ? (incorrectPercentage ? "ring-rose-500 bg-rose-50" : "bg-emerald-50") : ""
      )}
    >
      <div className="flex h-full items-center justify-between">
        <span className="text-sm font-medium text-foreground">{region}:</span>
        <div className="flex items-center gap-1">
          <Input
            id={region}
            value={percentage}
            register={register}
            errors={errors}
            allowShrinkSize
            maxLength={3}
            minLength={3}
            numberOnly
            cvaSize={"md"}
            inputBoxClassName={cn("text-lg font-semibold", isTotal ? "text-foreground" : "text-foreground")}
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
