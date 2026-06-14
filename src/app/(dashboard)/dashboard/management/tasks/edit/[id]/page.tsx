import { TaskEditView } from "@/features/tasks";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TaskEditPage({ params }: PageProps) {
  const { id } = await params;
  return <TaskEditView id={id} />;
}
