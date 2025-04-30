
import React, { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ToastProvider } from "@/components/ui/toast";
import { InventoryProvider } from "@/context/InventoryContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <InventoryProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Sidebar />
          <main className="flex-1 overflow-x-hidden p-4">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </InventoryProvider>
  );
};
