"use client";

import { BellRing } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PushCampaignDialog } from "./push-campaign-dialog";
import { PushCampaignsTable } from "./push-campaigns-table";
import { PushEngineSettings } from "./push-engine-settings";
import { PushStatsView } from "./push-stats";

/** Mobile push: campaigns, engine settings and delivery activity. */
export function PushAdminCard() {
  const [composing, setComposing] = useState(false);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <CardTitle className="text-base">Mobile push</CardTitle>
          <p className="text-xs text-muted-foreground">
            Notifications on learners' phones: campaigns you send, reminders the
            app sends on its own, and how they land.
          </p>
        </div>
        <Button
          id="push-new-campaign-btn"
          size="sm"
          onClick={() => setComposing(true)}
        >
          <BellRing className="h-4 w-4" />
          <span className="ml-1.5">New push</span>
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="campaigns">
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="activity">Delivery stats</TabsTrigger>
          </TabsList>
          <TabsContent value="campaigns" className="pt-4">
            <PushCampaignsTable />
          </TabsContent>
          <TabsContent value="settings" className="pt-4">
            <PushEngineSettings />
          </TabsContent>
          <TabsContent value="activity" className="pt-4">
            <PushStatsView />
          </TabsContent>
        </Tabs>
      </CardContent>
      <PushCampaignDialog open={composing} onOpenChange={setComposing} />
    </Card>
  );
}
