import * as React from "react";
import { Body, Button, Container, Head, Hr, Html, Img, Link, Preview, Section, Tailwind, TailwindConfig, Text } from "@react-email/components";
import config from "../tailwind.config";

const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "10px",
};

const box = {
  padding: "0 48px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const paragraph = {
  color: "#525f7f",

  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const anchor = {
  color: "#556cd6",
};

const button = {
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "10px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
};

export type StripeSubscriptionStartedEmailProps = {
  userName?: string;
  isTrial?: boolean;
  subscriptionManagementUrl: string;
};

export default function StripeSubscriptionStartedEmail({ userName, isTrial = false, subscriptionManagementUrl }: StripeSubscriptionStartedEmailProps) {
  const appTitle = process.env.NEXT_PUBLIC_APP_TITLE || "Platform";

  return (
    <Html>
      <Tailwind config={config as TailwindConfig}>
        <Head />
        <Body style={main}>
          <Preview>Your {appTitle} subscription is active!</Preview>
          <Container style={container}>
            <Section style={box}>
              <Img src={``} alt={appTitle} width="100" height="auto" />
              <Hr style={hr} />
              <Text style={paragraph}>Hi {userName || "there"},</Text>
              <Text style={paragraph}>
                Congratulations and welcome to {appTitle}! Your {isTrial ? "trial " : ""}
                subscription has successfully started.
              </Text>
              <Text style={paragraph}>You now have access to all the features included in your plan.</Text>

              <Button style={button} className="bg-red-600" href={subscriptionManagementUrl ?? ""}>
                Manage Your Subscription
              </Button>

              <Text style={paragraph}>
                If you have any questions or need help getting started, please don't hesitate to visit our{" "}
                <Link style={anchor} href="">
                  support page
                </Link>
                .
              </Text>

              <Text style={paragraph}>— The {appTitle} team</Text>
              <Hr style={hr} />
              <Section style={footer}>
                <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                  <tr>
                    <td align="left" style={{ fontSize: "12px", color: "#8898aa" }}>
                      © {appTitle}
                    </td>
                    <td align="right" style={{ fontSize: "12px", color: "#8898aa" }}>
                      {(process.env.NEXT_PUBLIC_STAGE ?? "").toLowerCase().includes("canada") ? "Canada" : "United States"}
                    </td>
                  </tr>
                </table>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
