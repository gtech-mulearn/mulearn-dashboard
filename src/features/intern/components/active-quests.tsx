"use client";

import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Gem,
  LineChart,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export function ActiveQuests() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
        <Zap className="w-5 h-5 text-warning fill-warning" />
        Active Quests
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/intern/timesheet">
          <Card className="h-full border-2 quest-card-blue transition-all cursor-pointer group shadow-lg">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="p-4 bg-brand-blue/10 rounded-2xl group-hover:scale-110 transition-transform">
                <Calendar className="w-8 h-8 text-brand-blue" />
              </div>
              <div>
                <h4 className="font-black text-lg group-hover:text-brand-blue transition-colors uppercase tracking-tight">
                  Daily Log
                </h4>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Log today's work to earn <Gem className="inline w-3 h-3" /> 10
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/intern/tasks">
          <Card className="h-full border-2 quest-card-success transition-all cursor-pointer group shadow-lg">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="p-4 bg-success/10 rounded-2xl group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <div>
                <h4 className="font-black text-lg group-hover:text-success transition-colors uppercase tracking-tight">
                  Task Tracker
                </h4>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Track assigned duties and progress
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/intern/weekly-review">
          <Card className="h-full border-2 quest-card-purple transition-all cursor-pointer group shadow-lg">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="p-4 bg-brand-purple/10 rounded-2xl group-hover:scale-110 transition-transform">
                <LineChart className="w-8 h-8 text-brand-purple" />
              </div>
              <div>
                <h4 className="font-black text-lg group-hover:text-brand-purple transition-colors uppercase tracking-tight">
                  Reflection
                </h4>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Weekly summary for up to <Gem className="inline w-3 h-3" /> 50
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="http://mulearn.org/r/internplaybook" target="_blank">
          <Card className="h-full border-2 quest-card-warning transition-all cursor-pointer group shadow-lg">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="p-4 bg-warning/10 rounded-2xl group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-warning" />
              </div>
              <div>
                <h4 className="font-black text-lg group-hover:text-warning transition-colors uppercase tracking-tight">
                  Playbook
                </h4>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Unlock new skills & secret strategies
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
