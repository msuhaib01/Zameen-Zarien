"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert } from "../context/AlertsContext";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Sample commodity data
const commodities = [
  { id: 1, name: "Wheat" },
  { id: 2, name: "Rice" },
  { id: 3, name: "Cotton" },
  { id: 4, name: "Sugarcane" },
  { id: 5, name: "Maize" },
];

// Mock history data
type HistoryItem = {
  id: string;
  date: string;
  price: number;
  triggered: boolean;
};

type AlertHistoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  alert: Alert | null;
};

export default function AlertHistoryModal({
  isOpen,
  onClose,
  alert,
}: AlertHistoryModalProps) {
  // Get commodity name
  const getCommodityName = (commodityId: number) => {
    return commodities.find((c) => c.id === commodityId)?.name || "Unknown";
  };

  // Generate mock history data
  const generateMockHistory = (alert: Alert): HistoryItem[] => {
    if (!alert) return [];

    // Generate some mock history items
    return [
      {
        id: "1",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        price: alert.threshold + 5,
        triggered: alert.condition === "above",
      },
      {
        id: "2",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        price: alert.threshold - 2,
        triggered: alert.condition === "below",
      },
      {
        id: "3",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        price: alert.threshold + 10,
        triggered: alert.condition === "above",
      },
    ];
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  if (!alert) return null;

  const historyItems = generateMockHistory(alert);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Alert History - {getCommodityName(alert.commodityId)}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="text-sm text-muted-foreground mb-4">
            Alert condition: {alert.condition === "above" ? "Above" : "Below"}{" "}
            PKR {alert.threshold}
          </div>
          {historyItems.length > 0 ? (
            <div className="space-y-4">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-3 flex flex-col space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {formatDate(item.date)}
                    </span>
                    <Badge
                      variant={item.triggered ? "default" : "outline"}
                      className={item.triggered ? "bg-green-500" : ""}
                    >
                      {item.triggered ? "Triggered" : "Not Triggered"}
                    </Badge>
                  </div>
                  <div className="text-lg font-semibold">PKR {item.price}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No history available for this alert.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
