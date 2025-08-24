import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Poppins } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";
import Header from "@/components/header";
import {ClerkProvider} from "@clerk/nextjs"
import { Toaster } from "sonner";
import { CurrencyProvider } from "@/components/providers/currency-provider";

const inter = Inter({subsets: ["latin"]})
const poppins = Poppins({subsets: ["latin"], weight: ["500"]})

export const metadata: Metadata = {
  title: "Chingu - AI-Powered Finance Tracker",
  description: "Meet Chingu, your friendly AI finance buddy. Track expenses, scan receipts, get smart insights, and manage your finances effortlessly with AI-powered features.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
       <html lang="en">
      <body
        className={` ${poppins.className}`}
      >
        <CurrencyProvider>
          <Header/>
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster/>
          <Footer/>
        </CurrencyProvider>
      </body>
    </html>
    </ClerkProvider>
   
  );
}
