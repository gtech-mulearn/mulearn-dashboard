import Image from "next/image";
import Link from "next/link";
import { Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type HeroCardProps = {
  name: string;
  src: string;
  alt: string;
};

export function HeroCard({ name, src, alt }: HeroCardProps) {
  return (
    <Card className="relative overflow-hidden rounded-2xl border-none bg-card shadow-sm transition-all hover:shadow-md">
      {/* Creative Background Elements */}
      <div className="absolute -top-24 -right-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl transition-all duration-1000 animate-pulse" />
      <div className="absolute top-1/2 -left-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />

      <div className="relative p-6 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">Welcome back</span>
            </div>

            <div className="space-y-4">
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
                Hello, <span className="text-primary">{name}</span>
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
                Track your learning circles, discover interest groups, and watch
                your karma grow. You're doing great!
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {/* Start Learning */}
              <Button
                asChild
                size="lg"
                className="group h-11 gap-2 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:bg-primary/90"
              >
                <Link href="/dashboard/mujourney">
                  <TrendingUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  Start Learning
                </Link>
              </Button>

              {/* Explore Groups */}
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-11 gap-2 rounded-xl border-border bg-background text-foreground hover:bg-muted/50"
              >
                <Link href="/dashboard/learning-circle">Explore Groups</Link>
              </Button>
            </div>
          </div>

          <div className="relative hidden h-60 w-full items-center justify-center lg:flex">
            {/* Abstract Shapes behind image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 rounded-full bg-gradient-to-tr from-primary/20 to-accent/20 blur-2xl" />
            </div>
            <Image
              alt={alt}
              className="relative z-10 object-contain drop-shadow-xl transition-transform hover:scale-105 duration-500"
              height={224}
              width={280}
              src={src}
              priority
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
