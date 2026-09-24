import { Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from "@react-email/components";

export type LeadNotificationProps = {
  returning: boolean;
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string | null;
  email: string;
  phone: string | null;
  registeredAt: string;
  confirmedAt: string;
  downloads: { title: string; at: string }[];
  delayHours: number;
};

const font = '"Source Sans 3", "Source Sans Pro", -apple-system, "Segoe UI", sans-serif';

export function LeadNotification(props: LeadNotificationProps) {
  const name = `${props.firstName} ${props.lastName}`;
  const rows: [string, React.ReactNode][] = [
    ["Name", name],
    ["Company", props.company],
    ["Function", props.jobTitle ?? "–"],
    ["Email", <Link key="e" href={`mailto:${props.email}`} style={link}>{props.email}</Link>],
    ["Mobile", props.phone ? <Link key="p" href={`tel:${props.phone.replace(/[^\d+]/g, "")}`} style={link}>{props.phone}</Link> : "–"],
    ["Registered", props.registeredAt],
    ...(props.returning ? ([["Confirmed again", props.confirmedAt]] as [string, string][]) : []),
  ];

  return (
    <Html lang="en">
      <Head />
      <Preview>
        {props.returning ? "Returning" : "New"} registration: {name}, {props.company}
      </Preview>
      <Body style={{ margin: 0, background: "#f2f2f2", fontFamily: font, color: "#151515" }}>
        <Container style={{ maxWidth: 600, margin: "40px auto", background: "#ffffff", padding: 40 }}>
          <Text style={eyebrow}>{props.returning ? "Returning registration" : "New registration"}</Text>
          <Heading as="h1" style={{ margin: "0 0 24px", fontSize: 26, lineHeight: 1.3, fontWeight: 300 }}>
            {name}, {props.company}
          </Heading>

          <Section>
            {rows.map(([label, value]) => (
              <Text key={label} style={row}>
                <span style={labelStyle}>{label}</span>
                <br />
                {value}
              </Text>
            ))}
          </Section>

          <Hr style={{ borderColor: "#efefef", margin: "24px 0" }} />

          <Text style={{ ...eyebrow, color: "#151515" }}>
            Downloaded documents ({props.downloads.length})
          </Text>
          {props.downloads.length === 0 ? (
            <Text style={body}>No documents downloaded yet.</Text>
          ) : (
            props.downloads.map((d, i) => (
              <Text key={i} style={row}>
                {d.title}
                <br />
                <span style={{ color: "#6b6b6b", fontSize: 13 }}>{d.at}</span>
              </Text>
            ))
          )}

          <Hr style={{ borderColor: "#efefef", margin: "24px 0 16px" }} />
          <Text style={{ margin: 0, fontSize: 13, color: "#6b6b6b" }}>
            Sent automatically {props.delayHours} h after the email confirmation. Reply to this
            email to contact {props.firstName} directly.
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
const body = { margin: 0, fontSize: 15, lineHeight: 1.6, color: "#444444" };
const row = { margin: "0 0 12px", fontSize: 15, lineHeight: 1.5 };
const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.075em",
  textTransform: "uppercase" as const,
  color: "#6b6b6b",
};
const link = { color: "#d4360f", textDecoration: "none" };
