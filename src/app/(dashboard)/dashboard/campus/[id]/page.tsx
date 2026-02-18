import { CampusView } from "@/features/campus";

export default async function CampusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="container mx-auto py-10">
      <CampusView id={id} />
    </div>
  );
}
