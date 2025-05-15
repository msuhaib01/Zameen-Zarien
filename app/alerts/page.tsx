"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, BellOff } from "lucide-react";
import { AlertsProvider, useAlerts, Alert } from "./context/AlertsContext";
import AlertCard from "./components/AlertCard";
import AddAlertModal from "./components/AddAlertModal";
import EditAlertModal from "./components/EditAlertModal";
import AlertHistoryModal from "./components/AlertHistoryModal";

function AlertsContent() {
  const { alerts, addAlert, updateAlert, deleteAlert, toggleAlertEnabled } = useAlerts();
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // Handle edit alert
  const handleEditAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsEditModalOpen(true);
  };

  // Handle view history
  const handleViewHistory = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsHistoryModalOpen(true);
  };

  // Handle delete alert
  const handleDeleteAlert = (id: string) => {
    if (confirm("Are you sure you want to delete this alert?")) {
      deleteAlert(id);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Price Alerts</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Alert
        </Button>
      </div>

      {alerts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onEdit={handleEditAlert}
              onDelete={handleDeleteAlert}
              onToggleEnabled={toggleAlertEnabled}
              onViewHistory={handleViewHistory}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BellOff className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No active alerts</h3>
          <p className="mt-2 text-muted-foreground">
            Add an alert to get notified when crop prices change.
          </p>
          <Button className="mt-4" onClick={() => setIsAddModalOpen(true)}>
            Add Your First Alert
          </Button>
        </div>
      )}

      {/* Add Alert Modal */}
      <AddAlertModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addAlert}
      />

      {/* Edit Alert Modal */}
      <EditAlertModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        alert={selectedAlert}
        onUpdate={updateAlert}
      />

      {/* Alert History Modal */}
      <AlertHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        alert={selectedAlert}
      />
    </div>
  );
}

export default function AlertsPage() {
  return (
    <AlertsProvider>
      <AlertsContent />
    </AlertsProvider>
  );
}
