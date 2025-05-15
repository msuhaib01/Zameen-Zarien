import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zameen-Zarien - Agricultural Price Monitoring",
  description: "Monitor agricultural commodity prices and set price alerts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">{children}</body>
    </html>
  );
}
