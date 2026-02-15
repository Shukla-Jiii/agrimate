import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgriMate — Farm Intelligence Platform",
  description:
    "AI-powered agricultural decision intelligence. Real-time market data, weather insights, yield optimization, and crop advisory for smart farming.",
  keywords: [
    "agriculture", "farming", "AI", "market prices",
    "crop advisory", "weather", "smart farming", "mandi prices",
  ],
};

export const viewport: Viewport = {
  themeColor: "#08090c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="noise">{children}</body>
    </html>
  );
}
