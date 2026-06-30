"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvailableSessionsList } from "./available-sessions-list";
import { MyInvitedSessionsList } from "./my-invited-sessions-list";
import { MyRequestsList } from "./my-requests-list";
import { RequestSessionDialog } from "./request-session-dialog";

export function StudentSessionsPage() {
  const [requestOpen, setRequestOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Sessions</h1>
        <Button onClick={() => setRequestOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Request Session
        </Button>
      </div>

      <Tabs defaultValue="available">
        <TabsList>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
          <TabsTrigger value="history">History &amp; Invites</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-4">
          <AvailableSessionsList />
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <MyRequestsList />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <MyInvitedSessionsList />
        </TabsContent>
      </Tabs>

      <RequestSessionDialog open={requestOpen} onOpenChange={setRequestOpen} />
    </div>
  );
}
