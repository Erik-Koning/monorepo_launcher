"use client";

import { useEffect, useRef, useState } from "react";
import { CircleX, Edit, Star, User, Users } from "lucide-react";
import { SelectBox } from "@common/components/inputs/SelectBox";
import { Card, CardContent } from "@common/components/ui/card";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { ClientProfileDisplay } from "./client-profile-display-accordion";
import { InfoDisplay } from "./info-display";
import { createObjectFromKeys, removeKeysNotInArray, combineAndSetKeys, reorderObjectKeys } from "@common/utils/objectManipulation";

export const clients = [
  {
    value: "SCB-CAN-004",
    label: "Priya Sharma",
    subLabel: "Senior Regulatory Affairs Manager • Mississauga, ON • Moderate Risk • priya.sharma@example.com",
  },
  { value: "2", label: "John Doe", subLabel: "Software Engineer • Toronto, ON • Moderate Risk • john.doe@example.com" },
  { value: "3", label: "Jane Smith", subLabel: "Marketing Manager • Vancouver, BC • Moderate Risk • jane.smith@example.com" },
];

export const clientProfiles = [
  {
    account_info: {
      client_id: "SCB-CAN-004",
    },
    personal_info: {
      first_name: "Priya",
      last_name: "Sharma",
      preferred_name: "Priya",
    },
  },
];

interface Client extends Record<string, any> {}

export interface ClientSelectionProps {
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  latestValues: any;
  setProfile: (profile: Record<string, any>) => void;
}

export function getClientInfoDisplayData(clientProfile?: Client | null) {
  if (!clientProfile) {
    return null;
  }
  debugger;
  /** Data selection and refinement */
  const keysToShowInSelectedClient = [
    "name",
    "age",
    "location",
    "firstName",
    "lastName",
    "preferredName",
    "age",
    "location_province",
    "location_city",
    "profession",
    "riskProfile",
    "netWorth",
    "primaryGoal",
    "knowledge",
    "years_experience",
    "time_horizon",
  ];
  let clientInfoDisplayData = createObjectFromKeys(clientProfile, keysToShowInSelectedClient, {
    firstName: ["personal_info.first_name"],
    lastName: ["personal_info.last_name"],
    preferredName: ["personal_info.preferred_name"],
    age: ["personal_info.age"],
    location_city: ["personal_info.residential_address.city"],
    location_province: ["personal_info.residential_address.province"],
    profession: ["employment.job_title"],
    riskProfile: ["risk_assessment.risk_capacity"],
    netWorth: ["financial_position.net_worth"],
    primaryGoal: ["investment_profile.primary_objective"],
    knowledge: ["investment_profile.investment_knowledge"],
    years_experience: ["investment_profile.investment_experience_years"],
    time_horizon: ["investment_profile.time_horizon"],
  });
  //Coallesce the keys
  clientInfoDisplayData = combineAndSetKeys(clientInfoDisplayData, {
    location: { takeKeys: ["location_city", "location_province"], delimiter: ", " },
    name: { takeKeys: ["firstName", "lastName"], delimiter: " " },
  });

  //Append Preferred Name to the name key
  if (clientInfoDisplayData.preferredName) {
    clientInfoDisplayData.name = clientInfoDisplayData.name + " (" + clientInfoDisplayData.preferredName + ")";
    delete clientInfoDisplayData.preferredName;
  }

  if (clientInfoDisplayData.netWorth) {
    clientInfoDisplayData.netWorth = clientInfoDisplayData.netWorth.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }

  //re-order the keys to show in the info display
  clientInfoDisplayData = reorderObjectKeys(clientInfoDisplayData, keysToShowInSelectedClient);

  if (clientInfoDisplayData) {
    debugger;
  }
  return clientInfoDisplayData;
}

export function ClientSelection({ register, errors, latestValues, setProfile }: ClientSelectionProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientProfile, setClientProfile] = useState<Client | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const hasSentProfile = useRef(false);

  const clientInfoDisplayData = getClientInfoDisplayData(clientProfile ?? null);

  useEffect(() => {
    if (clientInfoDisplayData && Object.keys(clientInfoDisplayData).length > 0 && !hasSentProfile.current) {
      hasSentProfile.current = true;
      setProfile({ ...clientProfile, ...clientInfoDisplayData });
    }
  }, [clientInfoDisplayData, clientProfile, setProfile]);

  useEffect(() => {
    if (!selectedClient) {
      hasSentProfile.current = false;
    }
  }, [selectedClient]);

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const client = clients.find((client) => client.value === e.target.value);
      if (client) {
        debugger;
        setSelectedClient(client);
        const clientProfile = clientProfiles.find(
          (clientProfile) => clientProfile.account_info?.client_id ?? (clientProfile as any)?.id === client.value
        );
        if (clientProfile) {
          setClientProfile(clientProfile);
        }
      }
    }
  };

  const handleClearClient = () => {
    setSelectedClient(null);
    setClientProfile(null);
  };

  if (!clientProfile) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <CardContent className="p-0 w-full flex flex-col gap-y-3">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-semibold">Select a Client</h1>
              <p className="text-muted-foreground mt-1">Choose a client profile to view their details.</p>
            </div>
          </div>
          <div className="w-full">
            <SelectBox
              size="lg"
              id="client-select"
              //labelAbove="Client"
              placeholder="Select a client..."
              defaultOptions={clients}
              onChange={handleClientChange}
              isClearable={true}
            />
          </div>
        </CardContent>
      </div>
    );
  }

  if (selectedClient && clientProfile) {
    return (
      <>
        {selectedClient && (
          <InfoDisplay
            title="Selected Client"
            labelJSX={
              <div className="flex items-center gap-4">
                <div className="flex p-3 items-center justify-center gap-2 rounded-xl border border-white/30 bg-red-600/20 backdrop-blur-sm">
                  <User className="h-7 w-7 text-primary" />
                  <span className="text-xl font-semibold">{clientProfile?.personal_info?.first_name ?? clientProfile?.first_name}</span>
                </div>
                {/*<h1 className="text-3xl font-semibold tracking-tight text-foreground">Client Profile</h1>*/}
              </div>
            }
            rightLabelJSX={
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="flex p-3 items-center justify-center gap-2 rounded-lg border border-white/30 bg-red-600/20 backdrop-blur-sm cursor-pointer"
                    onClick={() => {}}
                  >
                    <Edit className="h-7 w-7 text-primary" />
                  </div>
                  {/*<h1 className="text-3xl font-semibold tracking-tight text-foreground">Client Profile</h1>*/}
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="flex p-3 items-center justify-center gap-2 rounded-lg border border-white/30 bg-red-600/20 backdrop-blur-sm cursor-pointer"
                    onClick={handleClearClient}
                  >
                    <CircleX className="h-7 w-7 text-primary" />
                  </div>
                  {/*<h1 className="text-3xl font-semibold tracking-tight text-foreground">Client Profile</h1>*/}
                </div>
              </div>
            }
            variant={"modern"}
            data={clientInfoDisplayData ?? {}}
            combineKeys={[
              ["age", "location"],
              ["knowledge", "years_experience"],
            ]}
            reOrderKeys={{ "Age & Location": 1 }}
            className="mt-2"
          />
        )}
        <ClientProfileDisplay
          clientProfile={clientProfile}
          register={register}
          errors={errors}
          summary="Comprehensive client information and financial background for Jennifer Martinez"
          defaultAllOpen={true}
          additionalSections={[
            {
              id: "custom-notes",
              title: "Additional Notes",
              icon: Star,
              content: (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This is a custom section that can contain any React content. You can add forms, tables, charts, or any other components here.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold mb-2">Custom Field 1</h4>
                      <p className="text-sm">Custom content goes here</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold mb-2">Custom Field 2</h4>
                      <p className="text-sm">More custom content</p>
                    </div>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </>
    );
  }
}
