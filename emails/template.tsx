import {
  Html,
  Head,
  Preview,
  Text,
  Button,
  Section,
  Container,
  Row,
  Column,
  Hr,
} from "@react-email/components";
import * as React from "react";
import { formatCurrency, Currency, DEFAULT_CURRENCY } from "../lib/currency";

type EmailProps = {
  userName?: string;
  type: "budget-alert" | "other-alert" | "monthly-report";
  data?: Record<string, any>;
  currency?: Currency;
};

export default function DynamicEmail({
  userName = "",
  type,
  data = {},
  currency = DEFAULT_CURRENCY,
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
              You've spent <strong>{formatCurrency(spent, currency)}</strong> out of your
              monthly budget of <strong>{formatCurrency(limit, currency)}</strong>.
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

  if (type === "monthly-report") {
    const { stats, month, insights } = data;
    const { totalIncome, totalExpenses, byCategory, transactionCount } = stats;
    const netSavings = totalIncome - totalExpenses;

    // Get top 5 spending categories
    const topCategories = Object.entries(byCategory)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5);

    return (
      <Html>
        <Head />
        <Preview>Your {month} Financial Summary is Here!</Preview>
        <Section style={main}>
          <Container style={container}>
            <Text style={heading}>Your {month} Financial Summary 📊</Text>
            <Text style={paragraph}>Hi {userName},</Text>
            <Text style={paragraph}>
              Here’s a look at your financial activity for {month}. You had a total of <strong>{transactionCount}</strong> transactions.
            </Text>

            <Section style={summarySection}>
              <Row>
                <Column style={summaryBox}>
                  <Text style={summaryLabel}>Total Income</Text>
                  <Text style={{ ...summaryValue, color: "#2e7d32" }}>
                    {formatCurrency(totalIncome, currency)}
                  </Text>
                </Column>
                <Column style={summaryBox}>
                  <Text style={summaryLabel}>Total Expenses</Text>
                  <Text style={{ ...summaryValue, color: "#d32f2f" }}>
                    {formatCurrency(totalExpenses, currency)}
                  </Text>
                </Column>
                <Column style={summaryBox}>
                  <Text style={summaryLabel}>Net Savings</Text>
                  <Text style={summaryValue}>
                    {formatCurrency(netSavings, currency)}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Hr style={hr} />

            <Text style={subheading}>Key Insights for {month}</Text>
            <Text style={insightText}>💡 {insights.summary}</Text>
            <Text style={insightText}>🎯 {insights.topCategoryInsight}</Text>
            <Text style={insightText}>💰 {insights.savingsInsight}</Text>
            
            <Hr style={hr} />

            <Text style={subheading}>Top Spending Categories</Text>
            {topCategories.length > 0 ? (
              topCategories.map(([category, amount]) => (
                <Row key={category}>
                  <Column>
                    <Text style={categoryText}>{category}</Text>
                  </Column>
                  <Column align="right">
                    <Text style={categoryAmount}>{formatCurrency(amount as number, currency)}</Text>
                  </Column>
                </Row>
              ))
            ) : (
              <Text style={paragraph}>No expenses recorded this month.</Text>
            )}
            
            <Section style={{ textAlign: "center", marginTop: "32px" }}>
              <Button href="http://localhost:3000/dashboard" style={button}>
                View Full Dashboard
              </Button>
            </Section>
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


const main = { backgroundColor: "#f6f9fc", fontFamily: "Arial, sans-serif" };
const container = { backgroundColor: "#ffffff", margin: "0 auto", padding: "20px 0 48px", width: "580px" };
const heading = { fontSize: "24px", fontWeight: "bold", color: "#333", textAlign: "center" as const };
const subheading = { fontSize: "18px", fontWeight: "bold", color: "#444", marginTop: "24px" };
const paragraph = { fontSize: "16px", lineHeight: "24px", color: "#555" };
const hr = { borderColor: "#e6ebf1", margin: "20px 0" };
const button = { backgroundColor: "#5e6ad2", color: "#fff", padding: "12px 24px", borderRadius: "6px", textDecoration: "none" };
const summarySection = { marginTop: "20px" };
const summaryBox = { width: "33%", textAlign: "center" as const, padding: "10px" };
const summaryLabel = { fontSize: "14px", color: "#888" };
const summaryValue = { fontSize: "20px", fontWeight: "bold", color: "#333" };
const insightText = { ...paragraph, margin: "8px 0", backgroundColor: "#f6f9fc", padding: "10px", borderRadius: "4px" };
const categoryText = { ...paragraph, margin: "4px 0" };
const categoryAmount = { ...categoryText, fontWeight: "bold" };
