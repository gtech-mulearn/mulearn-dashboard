import Link from "next/link";

export default function AuthNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-6xl font-bold tracking-tighter">404</h1>
      <h2 className="text-xl font-semibold">Page Not Found</h2>
      <p className="text-muted-foreground text-center max-w-md">
        This page doesn&apos;t exist.
      </p>
      <Link
        href="/login"
        className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
      >
        Back to Login
      </Link>
    </div>
  );
}
