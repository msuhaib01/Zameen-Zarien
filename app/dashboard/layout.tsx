import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Bell, BarChart2, Clock, Settings, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | Zameen-Zarien",
  description: "Monitor agricultural commodity prices and set alerts",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center text-xl font-bold text-primary"
            >
              Zameen-Zarien
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="flex items-center text-sm font-medium text-foreground"
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/alerts"
                className="flex items-center text-sm font-medium text-foreground"
              >
                <Bell className="mr-2 h-4 w-4" />
                Price Alerts
              </Link>
              <Link
                href="#"
                className="flex items-center text-sm font-medium text-foreground"
              >
                <BarChart2 className="mr-2 h-4 w-4" />
                Forecasts
              </Link>
              <Link
                href="#"
                className="flex items-center text-sm font-medium text-foreground"
              >
                <Clock className="mr-2 h-4 w-4" />
                Real-Time
              </Link>
              <Link
                href="#"
                className="flex items-center text-sm font-medium text-foreground"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
