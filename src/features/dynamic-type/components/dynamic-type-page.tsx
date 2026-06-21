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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          className="shrink-0 w-full sm:w-auto"
          aria-label="Create new mapping"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Mapping
        </Button>
      </div>

      {/* Tab navigation */}
      <div className="border-b">
        {/* Mobile dropdown */}
        <div className="md:hidden pb-3">
          <Select
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as DynamicTypeTab)}
          >
            <SelectTrigger id="dynamic-type-mobile-select" className="w-full">
              <SelectValue placeholder="Select Tab" />
            </SelectTrigger>
            <SelectContent>
              {TABS.map((tab) => (
                <SelectItem key={tab.id} value={tab.id}>
                  {tab.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop navigation */}
        <nav
          className="hidden md:flex -mb-px gap-1"
          aria-label="Dynamic type tabs"
        >
          {TABS.map((tab) => (
            <Button
              key={tab.id}
              id={`dynamic-type-tab-${tab.id}`}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2"
              aria-label={tab.label}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              {tab.icon}
              {tab.label}
            </Button>
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
