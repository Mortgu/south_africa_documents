import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import { company } from "@/content/company";

type Props = { documentTitle: string; verifyUrl: string };

const font = '"Source Sans 3", "Source Sans Pro", -apple-system, "Segoe UI", sans-serif';

export function VerifyEmail({ documentTitle, verifyUrl }: Props) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Confirm your email address to download “{documentTitle}”</Preview>
      <Body style={{ margin: 0, background: "#f2f2f2", fontFamily: font, color: "#151515" }}>
        <Container style={{ maxWidth: 560, margin: "40px auto", background: "#ffffff", padding: 48 }}>
          <Text style={eyebrow}>Unlock document</Text>
          <Heading as="h1" style={{ margin: "0 0 16px", fontSize: 28, lineHeight: 1.3, fontWeight: 300 }}>
            Confirm your email address
          </Heading>
          <Text style={body}>
            Click the button below to confirm your email address. “{documentTitle}” and all other
            protected documents will then be unlocked for you.
          </Text>
          <Button href={verifyUrl} style={button}>
            Confirm email address
          </Button>
          <Text style={{ ...body, fontSize: 14, color: "#6b6b6b" }}>
            The link is valid for 30 minutes. If you didn&apos;t request it, you can ignore this
            email.
          </Text>
          <Hr style={{ borderColor: "#efefef", margin: "32px 0 16px" }} />
          <Text style={{ margin: 0, fontSize: 13, color: "#6b6b6b" }}>
            {company.name} · {company.street}, {company.city}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const eyebrow = {
  margin: "0 0 8px",
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "#d4360f",
};

const body = { margin: "0 0 24px", fontSize: 15, lineHeight: 1.6, color: "#444444" };

const button = {
  display: "inline-block",
  padding: "16px 28px",
  background: "#d4360f",
  color: "#ffffff",
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: "0.075em",
  textTransform: "uppercase" as const,
  textDecoration: "none",
  marginBottom: 24,
};
