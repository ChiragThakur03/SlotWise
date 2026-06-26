import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SlotWise — Booking & scheduling for service pros",
  description:
    "SlotWise is a booking and scheduling platform built for tattoo artists, groomers, music teachers, mobile stylists, physiotherapists, and personal trainers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(inter.variable)}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
