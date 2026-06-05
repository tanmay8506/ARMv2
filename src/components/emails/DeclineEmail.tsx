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

export const DeclineEmail = ({
  clientEmail = "client@example.com",
  serviceTitle = "Bridal Mehendi",
  bookingTime = "10:00 AM IST",
  bookingId = "BKG-123",
}) => (
  <Html>
    <Head />
    <Preview>Update regarding your ARM Artistry booking request</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>ARM Artistry</Heading>
        <Text style={text}>Hello {clientEmail},</Text>
        <Text style={text}>
          Unfortunately, we are unable to accommodate your booking request for the <strong>{serviceTitle}</strong> session at <strong>{bookingTime}</strong>.
        </Text>
        <Section style={card}>
          <Text style={cardText}>Booking ID: {bookingId}</Text>
          <Text style={cardText}>Status: Declined</Text>
        </Section>
        <Text style={text}>
          We apologize for the inconvenience. Our schedule for that slot has filled up. Please visit our website to select an alternative date or time.
        </Text>
        <Text style={footer}>
          &copy; {new Date().getFullYear()} ARM Artistry. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default DeclineEmail;

const main = { backgroundColor: "#1A1A1A", fontFamily: "Inter, sans-serif", padding: "40px 0" };
const container = { backgroundColor: "#F5F5DC", padding: "40px", maxWidth: "600px", margin: "0 auto" };
const h1 = { color: "#1A1A1A", fontSize: "24px", fontWeight: "bold", textAlign: "center" as const, marginBottom: "30px", fontFamily: "'Playfair Display', serif", textTransform: "uppercase" as const, letterSpacing: "2px" };
const text = { color: "#1A1A1A", fontSize: "16px", lineHeight: "24px", marginBottom: "20px" };
const card = { backgroundColor: "#E8E4D0", padding: "20px", marginBottom: "20px", borderRadius: "4px" };
const cardText = { margin: "0 0 10px 0", color: "#1A1A1A", fontWeight: "bold" };
const footer = { color: "#666666", fontSize: "12px", textAlign: "center" as const, marginTop: "40px" };
