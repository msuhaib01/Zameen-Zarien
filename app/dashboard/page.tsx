"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, BarChart2, Clock, Settings } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Zameen-Zarien Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor agricultural commodity prices and set alerts
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/alerts" className="block">
          <Card className="h-full transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5 text-primary" />
                Price Alerts
              </CardTitle>
              <CardDescription>
                Set up notifications for price changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Create custom alerts to get notified when commodity prices rise or fall
                beyond your specified thresholds.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="#" className="block">
          <Card className="h-full transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <BarChart2 className="mr-2 h-5 w-5 text-primary" />
                Price Forecasts
              </CardTitle>
              <CardDescription>
                View price predictions and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Access forecasts and historical data to make informed decisions
                about buying and selling agricultural commodities.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="#" className="block">
          <Card className="h-full transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                Real-Time Prices
              </CardTitle>
              <CardDescription>
                Monitor current market prices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Stay updated with the latest market prices for various agricultural
                commodities across different regions.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Recent Updates</h2>
        <Card>
          <CardHeader>
            <CardTitle>Market Highlights</CardTitle>
            <CardDescription>Latest price movements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Wheat</h3>
                    <p className="text-sm text-muted-foreground">Lahore Market</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">PKR 210</p>
                    <p className="text-sm text-green-600">+5 (2.4%)</p>
                  </div>
                </div>
              </div>
              <div className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Rice</h3>
                    <p className="text-sm text-muted-foreground">Karachi Market</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">PKR 135</p>
                    <p className="text-sm text-red-600">-3 (2.2%)</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Cotton</h3>
                    <p className="text-sm text-muted-foreground">Multan Market</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">PKR 180</p>
                    <p className="text-sm text-green-600">+8 (4.6%)</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
