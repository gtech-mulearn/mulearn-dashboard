import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plus, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LearningCirclesCard() {
  return (
    <Card className="h-full overflow-hidden rounded-2xl border-none bg-card shadow-sm">
      <CardHeader className="flex-row items-center justify-between border-b border-border/40 px-6 py-4">
        <div className="flex items-center gap-2">
          <Users2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-bold">Learning Circles</CardTitle>
        </div>
        <Link
          className="group flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          href="/dashboard/learning-circle"
        >
          View all
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>

      <CardContent className="grid gap-8 p-6 md:grid-cols-[1.5fr_1fr] md:items-center">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-chart-2/10 px-3 py-1 text-chart-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-2 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-chart-2"></span>
              </span>
              <span className="text-xs font-semibold">Join the community</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">
                No Learning Circle Found!
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                Collaborate with peers, share knowledge, and grow together.
                Learning circles are the best way to stay consistent and
                motivated.
              </p>
            </div>
          </div>

          <Button
            asChild
            className="h-11 gap-2 rounded-xl px-6 shadow-md transition-all hover:scale-105"
            size="lg"
          >
            <Link href="/dashboard/learning-circle">
              <Plus className="h-4 w-4" />
              Create New Circle
            </Link>
          </Button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 scale-90 rounded-full bg-primary/5 blur-3xl" />
          <Image
            alt="Learning circle illustration"
            className="relative z-10 h-48 w-auto object-contain drop-shadow-lg transition-transform hover:scale-105 duration-500"
            height={200}
            width={240}
            src="/Group.png"
          />
        </div>
      </CardContent>
    </Card>
  );
}
