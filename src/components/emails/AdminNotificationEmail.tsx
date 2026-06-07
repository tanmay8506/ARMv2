import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
} from "@react-email/components";
import * as React from "react";

interface AdminNotificationEmailProps {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceTitle: string;
  bookingTime: string;
  bookingId: string;
  notes?: string;
}

export const AdminNotificationEmail = ({
  clientName = "Tanmay Gemini",
  clientEmail = "tanmay8506@gmail.com",
  clientPhone = "+91 99999 99999",
  serviceTitle = "Bridal Mehendi",
  bookingTime = "10:00 AM IST",
  bookingId = "BKG-123",
  notes = "",
}: AdminNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>New Booking Request Received - Action Required</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>ARM Artistry</Heading>
        <Text style={titleText}>New Booking Request</Text>
        
        <Section style={card}>
          <Text style={fieldLabel}>Client</Text>
          <Text style={fieldValueLarge}>{clientName}</Text>

          <Text style={fieldLabel}>Contact Details</Text>
          <Text style={fieldValue}>Email: {clientEmail}</Text>
          <Text style={fieldValue}>Phone: {clientPhone}</Text>

          <Text style={fieldLabel}>Service Package</Text>
          <Text style={fieldValue}>{serviceTitle}</Text>

          <Text style={fieldLabel}>Date & Time (IST)</Text>
          <Text style={fieldValue}>{bookingTime}</Text>

          {notes && (
            <>
              <Text style={fieldLabel}>Client Notes</Text>
              <Text style={fieldValueItalic}>"{notes}"</Text>
            </>
          )}

          <Text style={fieldLabel}>Booking ID</Text>
          <Text style={fieldValueMono}>#{bookingId}</Text>
        </Section>

        <Text style={actionText}>
          Please log into the Control Centre to approve or decline this session.
        </Text>
        
        <Text style={footer}>
          &copy; {new Date().getFullYear()} ARM Artistry. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default AdminNotificationEmail;

const main = {
  backgroundColor: "#0A0A0A",
  fontFamily: "Inter, sans-serif",
  padding: "40px 0",
};

const container = {
  backgroundColor: "#111111",
  padding: "40px",
  borderRadius: "0px",
  maxWidth: "600px",
  margin: "0 auto",
  border: "1px solid #222222",
};

const h1 = {
  color: "#FFC000", // Lamborghini Gold
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  marginBottom: "10px",
  fontFamily: "Georgia, serif",
  textTransform: "uppercase" as const,
  letterSpacing: "4px",
};

const titleText = {
  color: "#FFFFFF",
  fontSize: "18px",
  textAlign: "center" as const,
  marginBottom: "30px",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
};

const card = {
  backgroundColor: "#1A1A1A",
  padding: "30px",
  border: "1px solid #333333",
  marginBottom: "30px",
};

const fieldLabel = {
  color: "#7D7D7D", // Ash
  fontSize: "10px",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  margin: "0 0 5px 0",
};

const fieldValue = {
  color: "#FFFFFF",
  fontSize: "15px",
  margin: "0 0 20px 0",
};

const fieldValueLarge = {
  color: "#FFFFFF",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 20px 0",
};

const fieldValueItalic = {
  color: "#E6E6E6",
  fontSize: "14px",
  fontStyle: "italic",
  margin: "0 0 20px 0",
  lineHeight: "20px",
};

const fieldValueMono = {
  color: "#FFC000",
  fontSize: "13px",
  fontFamily: "monospace",
  margin: "0 0 10px 0",
};

const actionText = {
  color: "#E6E6E6",
  fontSize: "14px",
  lineHeight: "22px",
  textAlign: "center" as const,
  marginBottom: "20px",
};

const footer = {
  color: "#494949",
  fontSize: "11px",
  textAlign: "center" as const,
  marginTop: "40px",
};
