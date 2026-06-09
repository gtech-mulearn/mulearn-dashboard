import Link from "next/link";

export function VersionBadge() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION;
  const sha = process.env.NEXT_PUBLIC_BUILD_SHA?.slice(0, 7);

  if (!version) return null;

  return (
    <Link
      href="/dashboard/changelog"
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      title="View changelog"
    >
      <span>v{version}</span>
      {sha && sha !== "dev" && <span className="opacity-50">· {sha}</span>}
    </Link>
  );
}
