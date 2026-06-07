import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Text,
  Section,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface AdminInquiryEmailProps {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceTitle: string;
  eventDate: string;
  eventType: string;
  locationType: string;
  eventCity: string;
  eventVenue?: string;
  notes?: string;
  bookingId: string;
  estimatedTotal?: number;
}

export const AdminInquiryEmail = ({
  clientName = "Priya Sharma",
  clientEmail = "crimson8506@gmail.com",
  clientPhone = "+91 99999 99999",
  serviceTitle = "Bridal Makeup (Standard)",
  eventDate = "Monday, 8 June 2026",
  eventType = "Bridal",
  locationType = "local",
  eventCity = "Varanasi",
  eventVenue = "",
  notes = "",
  bookingId = "A1B2C3D4",
  estimatedTotal,
}: AdminInquiryEmailProps) => (
  <Html>
    <Head />
    <Preview>
      New Inquiry: {clientName} · {eventType} · Ref #{bookingId}
    </Preview>
    <Body style={main}>
      <Container style={wrapper}>

        {/* ── Landscape Card ─────────────────────────────────────── */}
        <Section style={card}>
          <Row>
            {/* LEFT — dark brand panel */}
            <Column style={leftPanel}>
              <Text style={armText}>ARM</Text>
              <Text style={artistryText}>A R T I S T R Y</Text>
              <div style={goldLine} />
              <Text style={newText}>NEW</Text>
              <Text style={bookingText}>BOOKING</Text>
              <Text style={requestText}>REQUEST</Text>
              <Text style={byAppt}>By Appointment</Text>
            </Column>

            {/* RIGHT — details panel */}
            <Column style={rightPanel}>
              {/* Client name */}
              <Text style={clientLabel}>CLIENT</Text>
              <Text style={clientName2}>{clientName}</Text>

              <div style={dividerThin} />

              {/* Service + Total row */}
              <Row style={detailRow}>
                <Column style={detailCol}>
                  <Text style={detailLabel}>SERVICE</Text>
                  <Text style={detailValue}>{serviceTitle}</Text>
                </Column>
                {estimatedTotal && (
                  <Column style={detailCol}>
                    <Text style={detailLabel}>ESTIMATED TOTAL</Text>
                    <Text style={detailValue}>
                      ₹{estimatedTotal.toLocaleString("en-IN")}
                    </Text>
                  </Column>
                )}
              </Row>

              {/* Date + Event row */}
              <Row style={detailRow}>
                <Column style={detailCol}>
                  <Text style={detailLabel}>EVENT DATE</Text>
                  <Text style={detailValue}>{eventDate}</Text>
                </Column>
                <Column style={detailCol}>
                  <Text style={detailLabel}>EVENT TYPE</Text>
                  <Text style={detailValue}>{eventType}</Text>
                </Column>
              </Row>

              {/* Location row */}
              <Row style={detailRow}>
                <Column style={detailCol}>
                  <Text style={detailLabel}>CITY</Text>
                  <Text style={detailValue}>
                    {eventCity}{eventVenue ? ` · ${eventVenue}` : ""}
                  </Text>
                </Column>
                <Column style={detailCol}>
                  <Text style={detailLabel}>LOCATION TYPE</Text>
                  <Text style={detailValue}>
                    {locationType === "outstation" ? "Outstation" : "Local"}
                  </Text>
                </Column>
              </Row>

              <div style={dividerThin} />

              {/* Contact row */}
              <Row style={detailRow}>
                <Column style={detailCol}>
                  <Text style={detailLabel}>EMAIL ADDRESS</Text>
                  <Text style={detailValue}>{clientEmail}</Text>
                </Column>
                <Column style={detailCol}>
                  <Text style={detailLabel}>PHONE / WHATSAPP</Text>
                  <Text style={detailValue}>{clientPhone}</Text>
                </Column>
              </Row>

              {/* Notes if present */}
              {notes ? (
                <>
                  <div style={dividerThin} />
                  <Text style={detailLabel}>NOTES</Text>
                  <Text style={notesVal}>&ldquo;{notes}&rdquo;</Text>
                </>
              ) : null}

              {/* Ref */}
              <Text style={refLine}>Ref #{bookingId}</Text>
            </Column>
          </Row>
        </Section>

        {/* Footer note */}
        <Text style={footerNote}>
          ARM Artistry · Admin Notification · {new Date().getFullYear()}
        </Text>
      </Container>
    </Body>
  </Html>
);

export default AdminInquiryEmail;

// ── Styles ────────────────────────────────────────────────────────────────────

const main: React.CSSProperties = {
  backgroundColor: "#EDE8E1",
  fontFamily: "'Georgia', 'Times New Roman', serif",
  padding: "40px 16px",
};

const wrapper: React.CSSProperties = {
  maxWidth: "620px",
  margin: "0 auto",
};

const card: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: "2px",
  overflow: "hidden",
  boxShadow: "0 4px 32px rgba(0,0,0,0.12)",
};

// Left dark panel
const leftPanel: React.CSSProperties = {
  width: "190px",
  backgroundColor: "#1C1917",
  padding: "36px 24px",
  verticalAlign: "middle",
  textAlign: "center",
};

const armText: React.CSSProperties = {
  color: "#C8A96E",
  fontSize: "28px",
  fontWeight: "700",
  letterSpacing: "4px",
  margin: "0 0 2px 0",
  fontFamily: "Georgia, serif",
  lineHeight: "1",
};

const artistryText: React.CSSProperties = {
  color: "#C8A96E",
  fontSize: "8px",
  letterSpacing: "6px",
  margin: "0 0 16px 0",
  fontFamily: "Georgia, serif",
};

const goldLine: React.CSSProperties = {
  width: "32px",
  height: "1px",
  backgroundColor: "#C8A96E",
  margin: "0 auto 16px",
};

const newText: React.CSSProperties = {
  color: "#F5F0E8",
  fontSize: "11px",
  letterSpacing: "5px",
  margin: "0",
  fontFamily: "Georgia, serif",
  lineHeight: "1.8",
};

const bookingText: React.CSSProperties = {
  color: "#F5F0E8",
  fontSize: "11px",
  letterSpacing: "5px",
  margin: "0",
  fontFamily: "Georgia, serif",
  lineHeight: "1.8",
};

const requestText: React.CSSProperties = {
  color: "#F5F0E8",
  fontSize: "11px",
  letterSpacing: "5px",
  margin: "0 0 16px 0",
  fontFamily: "Georgia, serif",
  lineHeight: "1.8",
};

const byAppt: React.CSSProperties = {
  color: "#7A7269",
  fontSize: "9px",
  fontStyle: "italic",
  margin: "0",
  letterSpacing: "1px",
};

// Right light panel
const rightPanel: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  padding: "28px 28px 20px",
  verticalAlign: "top",
};

const clientLabel: React.CSSProperties = {
  color: "#C8A96E",
  fontSize: "8px",
  letterSpacing: "4px",
  textTransform: "uppercase",
  margin: "0 0 4px 0",
  fontFamily: "'Inter', Arial, sans-serif",
  fontWeight: "600",
};

const clientName2: React.CSSProperties = {
  color: "#1C1917",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 14px 0",
  fontFamily: "Georgia, serif",
  lineHeight: "1.2",
};

const dividerThin: React.CSSProperties = {
  borderTop: "1px solid #E8E2D9",
  margin: "10px 0 14px 0",
};

const detailRow: React.CSSProperties = {
  marginBottom: "12px",
};

const detailCol: React.CSSProperties = {
  width: "50%",
  verticalAlign: "top",
  paddingRight: "12px",
};

const detailLabel: React.CSSProperties = {
  color: "#A89B8A",
  fontSize: "7px",
  letterSpacing: "3px",
  textTransform: "uppercase",
  margin: "0 0 3px 0",
  fontFamily: "'Inter', Arial, sans-serif",
  fontWeight: "600",
};

const detailValue: React.CSSProperties = {
  color: "#2D2926",
  fontSize: "12px",
  margin: "0",
  fontFamily: "'Inter', Arial, sans-serif",
  fontWeight: "500",
  lineHeight: "1.4",
};

const notesVal: React.CSSProperties = {
  color: "#5C5248",
  fontSize: "11px",
  fontStyle: "italic",
  margin: "4px 0 0 0",
  fontFamily: "Georgia, serif",
  lineHeight: "1.5",
};

const refLine: React.CSSProperties = {
  color: "#C8C0B4",
  fontSize: "9px",
  fontFamily: "'Courier New', monospace",
  margin: "10px 0 0 0",
  letterSpacing: "1px",
};

const footerNote: React.CSSProperties = {
  color: "#A89B8A",
  fontSize: "9px",
  textAlign: "center",
  margin: "16px 0 0 0",
  letterSpacing: "2px",
  fontFamily: "'Inter', Arial, sans-serif",
};
