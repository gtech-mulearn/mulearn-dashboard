/**
 * Dynamic Type Page
 *
 * 📍 src/features/dynamic-type/components/dynamic-type-page.tsx
 *
 * Tabbed admin page for managing dynamic role-type and user-type mappings.
 * Uses custom tab UI (no @radix-ui/react-tabs dependency needed).
 */

"use client";

import { Layers, Plus, UserCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DynamicTypeTab } from "../types";
import { DynamicRoleTable } from "./dynamic-role-table";
import { DynamicTypeFormDialog } from "./dynamic-type-form-dialog";
import { DynamicUserTable } from "./dynamic-user-table";

const TABS: { id: DynamicTypeTab; label: string; icon: React.ReactNode }[] = [
  {
    id: "role",
    label: "Role Mappings",
    icon: <Layers className="h-4 w-4" />,
  },
  {
    id: "user",
    label: "User Mappings",
    icon: <UserCircle className="h-4 w-4" />,
  },
];

export function DynamicTypePage() {
  const [activeTab, setActiveTab] = useState<DynamicTypeTab>("role");
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Manage Dynamic Types
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure which roles and users are assigned to which type
            categories (e.g. "Campus Lead" → "Campus").
          </p>
        </div>
        <Button
          id="dynamic-type-create-btn"
          onClick={() => setCreateOpen(true)}
          className="shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Mapping
        </Button>
      </div>

      {/* Tab navigation */}
      <div className="border-b">
        <nav className="-mb-px flex gap-1" aria-label="Dynamic type tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`dynamic-type-tab-${tab.id}`}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
                "border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground",
              )}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab panels */}
      <div role="tabpanel">
        {activeTab === "role" ? <DynamicRoleTable /> : <DynamicUserTable />}
      </div>

      {/* Create dialog (mode=create, active tab determines which form) */}
      <DynamicTypeFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        tab={activeTab}
      />
    </div>
  );
}
