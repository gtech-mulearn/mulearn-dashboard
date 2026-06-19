import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Desktop Sidebar - Left Side */}
      <div className="hidden lg:flex w-1/2  flex-col justify-between p-16 text-secondary relative overflow-hidden bg-brand-blue">
        <div className="z-10">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.webp"
              alt="μLearn"
              width={120}
              height={40}
              className="brightness-0 invert"
              priority
            />
          </Link>
          <div className="mt-16 space-y-4">
            <h1 className="text-5xl text-primary-foreground font-bold leading-tight">
              We Grow As A<br />
              Community
            </h1>
            <p className="text-lg text-primary-foreground max-w-md">
              Join the fastest growing tech community.
            </p>
          </div>
        </div>

        {/* Illustration */}
        <div className="z-10 flex justify-start ">
          <Image
            src="/layout/Group.png"
            alt="Community Illustration"
            width={400}
            height={300}
            className="object-contain"
            priority
          />
        </div>

        <div className="z-10 text-sm text-primary-foreground/50 absolute bottom-4">
          © {new Date().getFullYear()} μLearn. All rights reserved.
        </div>
      </div>

      {/* Main Content - Right Side */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-[400px] space-y-6">{children}</div>
      </main>
    </div>
  );
}
