import type { Metadata } from "next";
import { CallbackPageClient } from "./callback-page-client";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Complete your authentication.",
};

export default function CallbackPage() {
  return <CallbackPageClient />;
}
