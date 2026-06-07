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

interface ReceiptEmailProps {
  clientEmail: string;
  clientName?: string;
  serviceTitle: string;
  bookingTime: string;
  bookingId: string;
}

export const ReceiptEmail = ({
  clientEmail = "client@example.com",
  clientName = "",
  serviceTitle = "Bridal Mehendi",
  bookingTime = "10:00 AM IST",
  bookingId = "BKG-123",
}: ReceiptEmailProps) => (
  <Html>
    <Head />
    <Preview>Your ARM Artistry booking request has been received</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>ARM Artistry</Heading>
        <Text style={text}>Hello {clientName || clientEmail},</Text>
        <Text style={text}>
          We have received your booking request for the <strong>{serviceTitle}</strong> session at <strong>{bookingTime}</strong>.
        </Text>
        <Section style={card}>
          <Text style={cardText}>Booking ID: {bookingId}</Text>
          <Text style={cardText}>Status: Pending Confirmation</Text>
        </Section>
        <Text style={text}>
          Our team is reviewing your request. You will receive another email as soon as it is confirmed.
        </Text>
        <Text style={footer}>
          &copy; {new Date().getFullYear()} ARM Artistry. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ReceiptEmail;

const main = {
  backgroundColor: "#1A1A1A",
  fontFamily: "Inter, sans-serif",
  padding: "40px 0",
};

const container = {
  backgroundColor: "#F5F5DC",
  padding: "40px",
  borderRadius: "0px",
  maxWidth: "600px",
  margin: "0 auto",
};

const h1 = {
  color: "#1A1A1A",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  marginBottom: "30px",
  fontFamily: "'Playfair Display', serif",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
};

const text = {
  color: "#1A1A1A",
  fontSize: "16px",
  lineHeight: "24px",
  marginBottom: "20px",
};

const card = {
  backgroundColor: "#E8E4D0",
  padding: "20px",
  marginBottom: "20px",
};

const cardText = {
  margin: "0 0 10px 0",
  color: "#1A1A1A",
  fontWeight: "bold",
};

const footer = {
  color: "#666666",
  fontSize: "12px",
  textAlign: "center" as const,
  marginTop: "40px",
};
