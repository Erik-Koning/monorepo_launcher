import axios from "axios";
import { toast } from "../../../../common/src/components/ui/sonner";
import { anonymizeStringWithReferencedFields, getMostLikelyNameFromEntry } from "../../../../common/src/utils/stringManipulation";
import { replacePlaceholders } from "../../../../common/src/utils/replacePlaceholders";
import { DateFormat } from "../../../../common/src/utils/dateManipulation";

const AI_ENDPOINT = process.env.NEXT_PUBLIC_LONG_RUNNING_AI_RESPONSE_URL;

export const promptContentVersions = [
  "You are an expert",
];

export interface sensitiveFieldsConfig {
  anonymize: boolean;
  sensitiveFields: string[];
  currentFieldsOriginal?: Record<string, any>;
  officeDateFormat: DateFormat;
}

/**
 * Call the long-running AI Lambda and return its `data` payload.
 *
 * @param payload  Object that matches `getAISchemaFillReqBody`
 * @returns        The `data` property from the Lambda response, or `null` on error
 */
export async function callAIRequest(payload: Record<string, any>, sensitiveFieldsConfig: sensitiveFieldsConfig): Promise<any | null> {
  try {
    debugger;
    const sensitiveFields = getSensitiveFields(sensitiveFieldsConfig.sensitiveFields, sensitiveFieldsConfig.currentFieldsOriginal);

    payload.systemPrompt = anonymizeStringWithReferencedFields(payload.systemPrompt ?? "", sensitiveFields);
    payload.userPrompt = anonymizeStringWithReferencedFields(payload.userPrompt ?? "", sensitiveFields);

    /* Obtain a short-lived verification token */
    const tokenRes = await axios.get("/api/getVerificationToken");
    const token: string | undefined = tokenRes.data?.jwt;
    if (!token) throw new Error("No verification token found");

    /* Invoke the Lambda */
    const { data } = await axios.post(AI_ENDPOINT as string, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // withCredentials: true, // enable if cookies are required
    });

    const responseText = data.data;

    const populatedData = replacePlaceholders(
      responseText,
      sensitiveFieldsConfig.currentFieldsOriginal ?? {},
      undefined,
      undefined,
      undefined,
      undefined,
      {
        dateFormat: sensitiveFieldsConfig.officeDateFormat,
      }
    );

    return populatedData;
  } catch (err: any) {
    console.error("AI request failed", err);
    toast.error("AI Request Failed", {
      description: err?.message ?? "Please try again or contact support.",
    });
    return null;
  }
}

export const getSensitiveFields = (sensitiveFields: string[], currentFieldsOriginal?: Record<string, any>) => {
  return sensitiveFields.length > 0
    ? //We have sensitive fields, populate the sensitiveFields object with current field values
      sensitiveFields.reduce((acc, key) => {
        acc[key] = currentFieldsOriginal?.[key] ?? "";
        return acc;
      }, {} as Record<string, string>)
    : //No sensitive fields, get the most likely name from the entry
    currentFieldsOriginal
    ? getMostLikelyNameFromEntry(currentFieldsOriginal as Record<string, string>)
    : { firstName: "", lastName: "" };
};
