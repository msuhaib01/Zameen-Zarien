"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert } from "../context/AlertsContext";
import { Bell, Clock, Edit, Trash, Mail, MessageSquare } from "lucide-react";

// Sample commodity data
const commodities = [
  { id: 1, name: "Wheat" },
  { id: 2, name: "Rice" },
  { id: 3, name: "Cotton" },
  { id: 4, name: "Sugarcane" },
  { id: 5, name: "Maize" },
];

// Mock current prices (in a real app, this would come from an API)
const mockCurrentPrices: Record<number, number> = {
  1: 210, // Wheat
  2: 135, // Rice
  3: 180, // Cotton
  4: 95, // Sugarcane
  5: 120, // Maize
};

type AlertCardProps = {
  alert: Alert;
  onEdit: (alert: Alert) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string) => void;
  onViewHistory: (alert: Alert) => void;
};

export default function AlertCard({
  alert,
  onEdit,
  onDelete,
  onToggleEnabled,
  onViewHistory,
}: AlertCardProps) {
  // Get commodity name
  const getCommodityName = (commodityId: number) => {
    return commodities.find((c) => c.id === commodityId)?.name || "Unknown";
  };

  // Get current price
  const getCurrentPrice = (commodityId: number) => {
    return mockCurrentPrices[commodityId] || "-";
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">
            {getCommodityName(alert.commodityId)}
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewHistory(alert)}
              title="View History"
            >
              <Clock className="h-5 w-5 text-primary" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(alert)}
              title="Edit Alert"
            >
              <Edit className="h-5 w-5 text-primary" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(alert.id)}
              title="Delete Alert"
            >
              <Trash className="h-5 w-5 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Condition:</span>
            <span className="font-medium">
              {alert.condition === "above" ? "Above" : "Below"} PKR{" "}
              {alert.threshold}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Price:</span>
            <span className="font-medium">
              PKR {getCurrentPrice(alert.commodityId)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Notification Methods:</span>
            <div className="flex space-x-2">
              {alert.notificationMethods.push && (
                <div className="flex items-center px-2 py-1 bg-primary/10 rounded-full">
                  <Bell className="h-4 w-4 text-primary mr-1" />
                  <span className="text-xs">Push</span>
                </div>
              )}
              {alert.notificationMethods.sms && (
                <div className="flex items-center px-2 py-1 bg-primary/10 rounded-full">
                  <MessageSquare className="h-4 w-4 text-primary mr-1" />
                  <span className="text-xs">SMS</span>
                </div>
              )}
              {alert.notificationMethods.email && (
                <div className="flex items-center px-2 py-1 bg-primary/10 rounded-full">
                  <Mail className="h-4 w-4 text-primary mr-1" />
                  <span className="text-xs">Email</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <span
          className={alert.enabled ? "text-primary" : "text-muted-foreground"}
        >
          {alert.enabled ? "Enabled" : "Disabled"}
        </span>
        <Switch
          checked={alert.enabled}
          onCheckedChange={() => onToggleEnabled(alert.id)}
        />
      </CardFooter>
    </Card>
  );
}
