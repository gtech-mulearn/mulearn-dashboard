/**
 * Dashboard Page
 *
 * 📍 src/app/(dashboard)/dashboard/page.tsx
 *
 * Main dashboard page (placeholder for now).
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | μLearn",
  description: "Your μLearn dashboard",
};

export default function DashboardPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-display font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Welcome to your μLearn dashboard. This page is under construction.
      </p>
    </div>
  );
}
