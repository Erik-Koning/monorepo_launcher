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
  //backgroundColor: "#656ee8",
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

export type SecureSendRecipientEmailProps = {
  senderName: string;
  senderOffice?: Record<string, any>;
  documentName: string;
  documentUrl: string;
  isNewUser: boolean;
  isReferral?: boolean;
};

export default function SecureSendRecipientEmail({
  senderName,
  senderOffice = { logo: "", name: "" },
  documentName,
  documentUrl,
  isReferral = false,
  isNewUser = false,
}: SecureSendRecipientEmailProps) {
  senderName = senderName ? senderName : senderOffice.name ?? "";
  const senderNameText = senderName && senderName.length > 0 ? `from ${senderName}` : "";
  const appTitle = process.env.NEXT_PUBLIC_APP_TITLE!;

  return (
    <Html>
      <Tailwind config={config as TailwindConfig}>
        <Head />
        <Body style={main} className="">
          <Preview>
            {isReferral
              ? `You've received a message from ${senderNameText} via ${appTitle}`
              : `You've received a message from ${senderNameText} via ${appTitle}`}
          </Preview>
          <Container style={container}>
            <Section style={box}>
              <Img src={`${senderOffice.logo}`} alt={appTitle} width="100" height="auto" />
              <Hr style={hr} />
              {senderOffice.logo && (
                <Img
                  src={senderOffice.logo}
                  alt="Office Logo"
                  width="130"
                  height="auto"
                  style={{
                    margin: "0 auto",
                    display: "block",
                    maxHeight: "180px",
                  }}
                />
              )}

              {isNewUser ? (
                <Text style={paragraph}>
                  {`You've received a message ${
                    senderName ? `from ${senderName} ` : ""
                  }through ${appTitle}, a secure platform for sharing and managing messages.`}
                </Text>
              ) : (
                <Text style={paragraph}>{`${senderName ? `${senderName} has` : `You have been sent`} a message through ${appTitle}.`}</Text>
              )}

              <Text style={paragraph}>
                {isNewUser
                  ? "To view or download your message safely, click the button below:"
                  : "To view or download your message securely, click the button below:"}
              </Text>

              <Button style={button} className="bg-red-600" href={documentUrl ?? ""}>
                View Message
              </Button>

              {isNewUser && (
                <Text style={paragraph}>
                  No software installation is required. You'll just need to create a free account to access and receive messages through {appTitle}. This
                  is a one-time setup – your account will work for all future documents, no matter who sends them.
                </Text>
              )}

              <Hr style={hr} />
              <Text style={paragraph}>
                Depending on the sender's settings, you may also be able to reply or securely forward the message{isNewUser ? " directly" : ""} through{" "}
                {appTitle}.
              </Text>

              {isNewUser ? (
                <Text style={paragraph}>
                  Want to learn more about how {appTitle} works? Visit our{" "}
                  <Link style={anchor} href="">
                    {" "}
                    {/* TODO: Update with actual Help/Docs URL */}
                    website
                  </Link>{" "}
                  for a quick overview.
                </Text>
              ) : (
                <Text style={paragraph}>
                  Need help getting started? Visit our{" "}
                  <Link style={anchor} href="">
                    {" "}
                    {/* TODO: Update with actual Help/Docs URL */}
                    website
                  </Link>{" "}
                  for a quick guide.
                </Text>
              )}

              {isNewUser ? (
                <Text style={paragraph}>
                  Need help? Our{" "}
                  <Link style={anchor} href="">
                    {" "}
                    {/* TODO: Update with actual Support URL */}
                    support team
                  </Link>{" "}
                  is here for you.
                </Text>
              ) : (
                <Text style={paragraph}>
                  Questions or need support? Our{" "}
                  <Link style={anchor} href="">
                    {" "}
                    {/* TODO: Update with actual Support URL */}
                    support team
                  </Link>{" "}
                  is here to help.
                </Text>
              )}

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
