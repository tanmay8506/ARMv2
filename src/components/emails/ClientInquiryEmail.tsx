import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Hr,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface ClientInquiryEmailProps {
  clientName: string;
  clientEmail: string;
  serviceTitle: string;
  eventDate: string;
  eventType: string;
  location: string;
  bookingId: string;
  supportEmail: string;
  supportPhone: string;
}

export const ClientInquiryEmail = ({
  clientName = "Priya",
  clientEmail = "client@example.com",
  serviceTitle = "Grand Bridal Mehendi",
  eventDate = "Saturday, 14 June 2026 · 08:00 AM IST",
  eventType = "Bridal",
  location = "Varanasi",
  bookingId = "A1B2C3D4",
  supportEmail = "tanmay8506@gmail.com",
  supportPhone = "+91 9810753003",
}: ClientInquiryEmailProps) => (
  <Html>
    <Head />
    <Preview>
      Your ARM Artistry Inquiry Has Been Received · Ref #{bookingId}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Cream header strip */}
        <Section style={accentTop} />

        {/* Brand Header */}
        <Section style={header}>
          <Heading style={brandMark}>ARM ARTISTRY</Heading>
          <Text style={subTagline}>Bridal Henna Atelier</Text>
        </Section>

        {/* Personal Greeting */}
        <Section style={greetingSection}>
          <Text style={greeting}>
            Namaste, {clientName.split(" ")[0]} 🙏
          </Text>
          <Text style={greetingBody}>
            Thank you for reaching out to ARM Artistry. We have received your{" "}
            <strong>{eventType}</strong> inquiry and our team is carefully reviewing your
            details. We will personally respond within{" "}
            <strong style={{ color: "#B8860B" }}>48 hours</strong>.
          </Text>
        </Section>

        {/* Summary Card */}
        <Section style={summaryCard}>
          <Text style={summaryTitle}>YOUR INQUIRY SUMMARY</Text>
          <Hr style={divider} />

          <Row style={fieldRow}>
            <Column style={labelCol}>
              <Text style={fieldLabel}>REFERENCE NO.</Text>
            </Column>
            <Column style={valueCol}>
              <Text style={refCode}>#{bookingId}</Text>
            </Column>
          </Row>

          <Row style={fieldRow}>
            <Column style={labelCol}>
              <Text style={fieldLabel}>SERVICE</Text>
            </Column>
            <Column style={valueCol}>
              <Text style={fieldValueBold}>{serviceTitle}</Text>
            </Column>
          </Row>

          <Row style={fieldRow}>
            <Column style={labelCol}>
              <Text style={fieldLabel}>EVENT</Text>
            </Column>
            <Column style={valueCol}>
              <Text style={fieldValue}>{eventType}</Text>
            </Column>
          </Row>

          <Row style={fieldRow}>
            <Column style={labelCol}>
              <Text style={fieldLabel}>DATE</Text>
            </Column>
            <Column style={valueCol}>
              <Text style={fieldValue}>{eventDate}</Text>
            </Column>
          </Row>

          <Row style={fieldRow}>
            <Column style={labelCol}>
              <Text style={fieldLabel}>LOCATION</Text>
            </Column>
            <Column style={valueCol}>
              <Text style={fieldValue}>{location}</Text>
            </Column>
          </Row>
        </Section>

        {/* What Happens Next */}
        <Section style={nextStepsSection}>
          <Text style={nextStepsTitle}>WHAT HAPPENS NEXT</Text>
          <Hr style={dividerLight} />
          <Text style={stepText}>
            <span style={stepNumber}>01</span> Our team reviews your inquiry and checks schedule availability.
          </Text>
          <Text style={stepText}>
            <span style={stepNumber}>02</span> We reach out within 48 hours to discuss details and confirm availability.
          </Text>
          <Text style={stepText}>
            <span style={stepNumber}>03</span> Once confirmed, you will receive a formal booking confirmation.
          </Text>
        </Section>

        {/* Support */}
        <Section style={supportSection}>
          <Text style={supportTitle}>NEED IMMEDIATE ASSISTANCE?</Text>
          <Text style={supportBody}>
            For urgent queries, reach our team directly:
          </Text>
          <Text style={supportContact}>📧 {supportEmail}</Text>
          <Text style={supportContact}>📞 {supportPhone}</Text>
        </Section>

        {/* Footer */}
        <Section style={footerSection}>
          <Hr style={footerDivider} />
          <Text style={footerText}>
            With warm regards,
            <br />
            <strong style={{ color: "#B8860B" }}>The ARM Artistry Team</strong>
          </Text>
          <Text style={footerLegal}>
            &copy; {new Date().getFullYear()} ARM Artistry. All rights reserved.
            <br />
            This email was sent to {clientEmail} as a result of your inquiry.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default ClientInquiryEmail;

// Styles — warm ivory & gold luxury
const main = {
  backgroundColor: "#F0EDE5",
  fontFamily: "'Georgia', serif",
  padding: "40px 0",
};

const container = {
  backgroundColor: "#FDFAF4",
  maxWidth: "600px",
  margin: "0 auto",
  boxShadow: "0 4px 40px rgba(0,0,0,0.08)",
};

const accentTop = {
  backgroundColor: "#B8860B",
  height: "4px",
};

const header = {
  padding: "36px 40px 24px",
  textAlign: "center" as const,
  borderBottom: "1px solid #E8E1D0",
};

const brandMark = {
  color: "#1A1A1A",
  fontSize: "24px",
  fontWeight: "700" as const,
  letterSpacing: "6px",
  textAlign: "center" as const,
  margin: "0 0 6px 0",
  fontFamily: "Georgia, serif",
};

const subTagline = {
  color: "#B8860B",
  fontSize: "10px",
  letterSpacing: "4px",
  textTransform: "uppercase" as const,
  textAlign: "center" as const,
  margin: "0",
  fontFamily: "'Inter', sans-serif",
};

const greetingSection = {
  padding: "36px 40px 24px",
  borderBottom: "1px solid #E8E1D0",
};

const greeting = {
  color: "#1A1A1A",
  fontSize: "22px",
  fontWeight: "700" as const,
  margin: "0 0 14px 0",
  fontFamily: "Georgia, serif",
};

const greetingBody = {
  color: "#4A4A4A",
  fontSize: "15px",
  lineHeight: "1.8",
  margin: "0",
  fontFamily: "'Inter', sans-serif",
};

const summaryCard = {
  backgroundColor: "#F5F0E5",
  margin: "24px 24px 0",
  padding: "24px",
  border: "1px solid #DDD5BC",
};

const summaryTitle = {
  color: "#888",
  fontSize: "9px",
  letterSpacing: "3px",
  textTransform: "uppercase" as const,
  margin: "0 0 12px 0",
  fontFamily: "'Inter', sans-serif",
  fontWeight: "600" as const,
};

const divider = {
  borderColor: "#DDD5BC",
  margin: "0 0 16px 0",
};

const fieldRow = {
  marginBottom: "10px",
};

const labelCol = {
  width: "35%",
  verticalAlign: "top" as const,
};

const valueCol = {
  width: "65%",
  verticalAlign: "top" as const,
};

const fieldLabel = {
  color: "#AAA",
  fontSize: "9px",
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  margin: "0",
  fontFamily: "'Inter', sans-serif",
  paddingTop: "2px",
};

const fieldValue = {
  color: "#333",
  fontSize: "13px",
  margin: "0",
  fontFamily: "'Inter', sans-serif",
};

const fieldValueBold = {
  color: "#1A1A1A",
  fontSize: "14px",
  fontWeight: "700" as const,
  margin: "0",
  fontFamily: "'Inter', sans-serif",
};

const refCode = {
  color: "#B8860B",
  fontSize: "16px",
  fontWeight: "700" as const,
  fontFamily: "'Courier New', monospace",
  margin: "0",
};

const nextStepsSection = {
  padding: "28px 40px",
  borderBottom: "1px solid #E8E1D0",
};

const nextStepsTitle = {
  color: "#888",
  fontSize: "9px",
  letterSpacing: "3px",
  textTransform: "uppercase" as const,
  margin: "0 0 12px 0",
  fontFamily: "'Inter', sans-serif",
  fontWeight: "600" as const,
};

const dividerLight = {
  borderColor: "#E8E1D0",
  margin: "0 0 16px 0",
};

const stepNumber = {
  color: "#B8860B",
  fontWeight: "700" as const,
  marginRight: "10px",
  fontFamily: "'Courier New', monospace",
  fontSize: "13px",
};

const stepText = {
  color: "#4A4A4A",
  fontSize: "13px",
  lineHeight: "1.7",
  margin: "0 0 10px 0",
  fontFamily: "'Inter', sans-serif",
};

const supportSection = {
  backgroundColor: "#1A1A1A",
  padding: "24px 40px",
  textAlign: "center" as const,
};

const supportTitle = {
  color: "#FFC000",
  fontSize: "10px",
  letterSpacing: "3px",
  textTransform: "uppercase" as const,
  margin: "0 0 10px 0",
  fontFamily: "'Inter', sans-serif",
  fontWeight: "600" as const,
};

const supportBody = {
  color: "#888",
  fontSize: "12px",
  margin: "0 0 10px 0",
  fontFamily: "'Inter', sans-serif",
};

const supportContact = {
  color: "#CCC",
  fontSize: "13px",
  margin: "0 0 4px 0",
  fontFamily: "'Inter', sans-serif",
  fontWeight: "600" as const,
};

const footerSection = {
  padding: "24px 40px 32px",
  textAlign: "center" as const,
};

const footerDivider = {
  borderColor: "#E8E1D0",
  margin: "0 0 20px 0",
};

const footerText = {
  color: "#4A4A4A",
  fontSize: "14px",
  lineHeight: "1.8",
  margin: "0 0 16px 0",
  fontFamily: "Georgia, serif",
};

const footerLegal = {
  color: "#AAA",
  fontSize: "10px",
  lineHeight: "1.6",
  margin: "0",
  fontFamily: "'Inter', sans-serif",
};
