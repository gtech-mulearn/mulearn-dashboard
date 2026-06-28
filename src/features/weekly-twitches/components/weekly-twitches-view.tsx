"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampusContentTab } from "./campus-content-tab";
import { OfficeHoursTab } from "./office-hours-tab";

type TabValue = "office-hours" | "salt-mango-tree" | "inspiration-station";

const TAB_OPTIONS: { value: TabValue; label: string }[] = [
  { value: "office-hours", label: "Office Hours" },
  { value: "salt-mango-tree", label: "Salt Mango Tree" },
  { value: "inspiration-station", label: "Inspiration Station Radio" },
];

export function WeeklyTwitchesView() {
  const [activeTab, setActiveTab] = useState<TabValue>("office-hours");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Weekly Twitches</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage Office Hours, Salt Mango Tree, and Inspiration Station Radio
          content.
        </p>
      </div>

      {/* Mobile: Select */}
      <div className="sm:hidden">
        <Select
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabValue)}
        >
          <SelectTrigger className="w-full rounded-xl border-border bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TAB_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs — list hidden on mobile, shown on sm+ */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
      >
        <TabsList className="hidden w-auto justify-start gap-1 rounded-xl border border-border bg-muted/40 p-1 sm:flex">
          {TAB_OPTIONS.map((o) => (
            <TabsTrigger
              key={o.value}
              value={o.value}
              className="rounded-lg text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              {o.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="office-hours" className="mt-4">
          <OfficeHoursTab />
        </TabsContent>

        <TabsContent value="salt-mango-tree" className="mt-4">
          <CampusContentTab contentType="smt" />
        </TabsContent>

        <TabsContent value="inspiration-station" className="mt-4">
          <CampusContentTab contentType="isr" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
