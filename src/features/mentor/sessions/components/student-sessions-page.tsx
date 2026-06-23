"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenteesPage } from "@/features/mentor/mentees/components/mentees-page";
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

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">History & Invites</TabsTrigger>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4">
          <MenteesPage title="" />
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <MyRequestsList />
        </TabsContent>
      </Tabs>

      <RequestSessionDialog open={requestOpen} onOpenChange={setRequestOpen} />
    </div>
  );
}
