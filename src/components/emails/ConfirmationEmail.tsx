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

export const ConfirmationEmail = ({
  clientEmail = "client@example.com",
  serviceTitle = "Bridal Mehendi",
  bookingTime = "10:00 AM IST",
  bookingId = "BKG-123",
}) => (
  <Html>
    <Head />
    <Preview>Your ARM Artistry booking is confirmed!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>ARM Artistry</Heading>
        <Text style={text}>Hello {clientEmail},</Text>
        <Text style={text}>
          Great news! Your booking request for the <strong>{serviceTitle}</strong> session at <strong>{bookingTime}</strong> has been <strong>APPROVED</strong>.
        </Text>
        <Section style={card}>
          <Text style={cardText}>Booking ID: {bookingId}</Text>
          <Text style={cardText}>Status: Confirmed</Text>
        </Section>
        <Text style={text}>
          Please arrive 10 minutes early. If you need to reschedule, please contact us at least 48 hours in advance.
        </Text>
        <Text style={footer}>
          &copy; {new Date().getFullYear()} ARM Artistry. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ConfirmationEmail;

const main = { backgroundColor: "#1A1A1A", fontFamily: "Inter, sans-serif", padding: "40px 0" };
const container = { backgroundColor: "#F5F5DC", padding: "40px", maxWidth: "600px", margin: "0 auto" };
const h1 = { color: "#1A1A1A", fontSize: "24px", fontWeight: "bold", textAlign: "center" as const, marginBottom: "30px", fontFamily: "'Playfair Display', serif", textTransform: "uppercase" as const, letterSpacing: "2px" };
const text = { color: "#1A1A1A", fontSize: "16px", lineHeight: "24px", marginBottom: "20px" };
const card = { backgroundColor: "#E8E4D0", padding: "20px", marginBottom: "20px", borderRadius: "4px" };
const cardText = { margin: "0 0 10px 0", color: "#1A1A1A", fontWeight: "bold" };
const footer = { color: "#666666", fontSize: "12px", textAlign: "center" as const, marginTop: "40px" };
