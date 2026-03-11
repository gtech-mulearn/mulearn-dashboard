"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManageIGTable, IGRequestTable } from "@/features/manage-ig";

export default function InterestGroupsManagementPage() {
  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="manage" className="w-full">
        <div className="mb-6">
          <TabsList className="w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="manage">Manage IGs</TabsTrigger>
            <TabsTrigger value="requests">IG Requests</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="manage">
          <ManageIGTable />
        </TabsContent>

        <TabsContent value="requests">
          <IGRequestTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
