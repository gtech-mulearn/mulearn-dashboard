import { TaskEditView } from "@/features/tasks";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata = {
  title: "Edit Task | Management",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TaskEditPage({ params }: PageProps) {
  await requireRole([ROLES.ADMIN]);
  const { id } = await params;
  return <TaskEditView id={id} />;
}
