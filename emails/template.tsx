

import {
  Html,
  Head,
  Preview,
  Text,
  Button,
  Section,
  Container,
} from "@react-email/components";
import * as React from "react";

type EmailProps = {
  userName?: string;
  type: "budget-alert" | "other-alert";
  data?: Record<string, any>;
};

export default function DynamicEmail({
  userName = "Manov",
  type,
  data = {},
}: EmailProps) {
  if (type === "budget-alert") {
    const spent = data.spent ?? 0;
    const limit = data.limit ?? 1;
    const percentUsed = (spent / limit) * 100;

    return (
      <Html>
        <Head />
        <Preview>You've used {percentUsed.toFixed(1)}% of your budget</Preview>
        <Section style={{ backgroundColor: "#f4f4f4", padding: "20px" }}>
          <Container
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <Text style={{ fontSize: "18px", fontWeight: "bold" }}>
              Hi {userName},
            </Text>
            <Text style={{ fontSize: "16px" }}>
              You've spent <strong>₹{spent.toFixed(2)}</strong> out of your
              monthly budget of <strong>₹{limit.toFixed(2)}</strong>.
            </Text>
            <Text style={{ fontSize: "16px", color: "#e63946" }}>
              That's <strong>{percentUsed.toFixed(1)}%</strong> of your budget.
            </Text>
            <Text style={{ fontSize: "14px", marginTop: "20px" }}>
              Please review your spending and take action if needed.
            </Text>
            <Button
              href="https://yourapp.com/dashboard"
              style={{
                backgroundColor: "#0070f3",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: "6px",
                marginTop: "20px",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              View Budget Dashboard
            </Button>
          </Container>
        </Section>
      </Html>
    );
  }

  // Fallback/default rendering for other types
  return (
    <Html>
      <Head />
      <Preview>You've got a new notification</Preview>
      <Section style={{ padding: "20px" }}>
        <Container>
          <Text style={{ fontSize: "18px" }}>
            Hi {userName}, here's your generic email alert.
          </Text>
        </Container>
      </Section>
    </Html>
  );
}
