"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, NotificationMethod } from "../context/AlertsContext";
import { Bell, Mail, MessageSquare } from "lucide-react";

// Sample commodity data
const commodities = [
  { id: 1, name: "Wheat" },
  { id: 2, name: "Rice" },
  { id: 3, name: "Cotton" },
  { id: 4, name: "Sugarcane" },
  { id: 5, name: "Maize" },
];

type EditAlertModalProps = {
  isOpen: boolean;
  onClose: () => void;
  alert: Alert | null;
  onUpdate: (
    id: string,
    alert: {
      commodityId: number;
      threshold: number;
      condition: "above" | "below";
      notificationMethods: NotificationMethod;
    }
  ) => void;
};

export default function EditAlertModal({
  isOpen,
  onClose,
  alert,
  onUpdate,
}: EditAlertModalProps) {
  // Form state
  const [commodityId, setCommodityId] = useState<number>(1);
  const [threshold, setThreshold] = useState<string>("");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [notificationMethods, setNotificationMethods] =
    useState<NotificationMethod>({
      push: true,
      sms: false,
      email: false,
    });

  // Update form when alert changes
  useEffect(() => {
    if (alert) {
      setCommodityId(alert.commodityId);
      setThreshold(alert.threshold.toString());
      setCondition(alert.condition);
      setNotificationMethods(alert.notificationMethods);
    }
  }, [alert]);

  // Handle form submission
  const handleSubmit = () => {
    if (!alert) return;

    if (!threshold || isNaN(Number(threshold))) {
      alert("Please enter a valid price threshold");
      return;
    }

    onUpdate(alert.id, {
      commodityId,
      threshold: Number(threshold),
      condition,
      notificationMethods,
    });

    onClose();
  };

  // Toggle notification method
  const toggleNotificationMethod = (method: keyof NotificationMethod) => {
    setNotificationMethods((prev) => ({
      ...prev,
      [method]: !prev[method],
    }));
  };

  if (!alert) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Price Alert</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="commodity" className="text-right">
              Commodity
            </Label>
            <Select
              value={commodityId.toString()}
              onValueChange={(value) => setCommodityId(Number(value))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a commodity" />
              </SelectTrigger>
              <SelectContent>
                {commodities.map((commodity) => (
                  <SelectItem
                    key={commodity.id}
                    value={commodity.id.toString()}
                  >
                    {commodity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="condition" className="text-right">
              Condition
            </Label>
            <Select
              value={condition}
              onValueChange={(value) =>
                setCondition(value as "above" | "below")
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">Above</SelectItem>
                <SelectItem value="below">Below</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="threshold" className="text-right">
              Price (PKR)
            </Label>
            <Input
              id="threshold"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="col-span-3"
              placeholder="Enter price threshold"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Notifications</Label>
            <div className="col-span-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <span>Push Notification</span>
                </div>
                <Switch
                  checked={notificationMethods.push}
                  onCheckedChange={() => toggleNotificationMethod("push")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>SMS</span>
                </div>
                <Switch
                  checked={notificationMethods.sms}
                  onCheckedChange={() => toggleNotificationMethod("sms")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </div>
                <Switch
                  checked={notificationMethods.email}
                  onCheckedChange={() => toggleNotificationMethod("email")}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Update Alert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
