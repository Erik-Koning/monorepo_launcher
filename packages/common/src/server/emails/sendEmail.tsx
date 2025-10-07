import { isDevEnv } from "@common/utils/environments";

export type SendEmailParams = {
  senderEmail: string;
  recipient: string;
  subject: string;
  bodyHTML: string;
  senderName?: string;
  bodyText?: string;
  replyToAddresses?: string[];
};

export async function sendEmail({ senderEmail, recipient, subject, bodyHTML, senderName, bodyText, replyToAddresses }: SendEmailParams): Promise<void> {
  console.info("Sending email to", recipient, "with subject", subject, "for region", process.env.AWS_REGION, process.env.NEXT_PUBLIC_AWS_REGION);

  try {
    // Send the email
    ////console.log("Email sent successfully");
  } catch (error) {
    console.error("Failed to send email via ses:", error);
    throw new Error("Failed to send email via ses");
  }
}
