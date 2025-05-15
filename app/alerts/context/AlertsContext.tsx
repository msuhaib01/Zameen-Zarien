"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Define types
export type NotificationMethod = {
  push: boolean;
  sms: boolean;
  email: boolean;
};

export type Alert = {
  id: string;
  commodityId: number;
  threshold: number;
  condition: "above" | "below";
  notificationMethods: NotificationMethod;
  enabled: boolean;
  createdAt: string;
};

type AlertsContextType = {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, "id" | "createdAt">) => void;
  updateAlert: (id: string, alert: Partial<Alert>) => void;
  deleteAlert: (id: string) => void;
  toggleAlertEnabled: (id: string) => void;
};

// Create context
const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

// Sample initial alerts
const initialAlerts: Alert[] = [
  {
    id: "1",
    commodityId: 1, // Wheat
    threshold: 205,
    condition: "above",
    notificationMethods: {
      push: true,
      sms: false,
      email: true,
    },
    enabled: true,
    createdAt: "2023-01-05T10:30:00Z",
  },
  {
    id: "2",
    commodityId: 2, // Rice
    threshold: 140,
    condition: "below",
    notificationMethods: {
      push: true,
      sms: true,
      email: false,
    },
    enabled: false,
    createdAt: "2023-01-07T14:15:00Z",
  },
];

// Provider component
export const AlertsProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  // Add a new alert
  const addAlert = (alert: Omit<Alert, "id" | "createdAt">) => {
    const newAlert: Alert = {
      ...alert,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setAlerts((prevAlerts) => [...prevAlerts, newAlert]);
  };

  // Update an existing alert
  const updateAlert = (id: string, updatedData: Partial<Alert>) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.id === id ? { ...alert, ...updatedData } : alert
      )
    );
  };

  // Delete an alert
  const deleteAlert = (id: string) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  };

  // Toggle alert enabled status
  const toggleAlertEnabled = (id: string) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
      )
    );
  };

  return (
    <AlertsContext.Provider
      value={{
        alerts,
        addAlert,
        updateAlert,
        deleteAlert,
        toggleAlertEnabled,
      }}
    >
      {children}
    </AlertsContext.Provider>
  );
};

// Custom hook to use the alerts context
export const useAlerts = () => {
  const context = useContext(AlertsContext);
  if (context === undefined) {
    throw new Error("useAlerts must be used within an AlertsProvider");
  }
  return context;
};
