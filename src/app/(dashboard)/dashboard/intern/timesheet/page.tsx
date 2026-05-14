import { Calendar, CheckCircle2, Clock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function TimesheetPage() {
  // Generate mock calendar days
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const isToday = i === 13;
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    let status = "missing";
    if (i < 13 && !isWeekend)
      status = Math.random() > 0.2 ? "submitted" : "missing";
    if (isWeekend) status = "exempt";
    if (isToday) status = "pending";

    return {
      date: d,
      status,
      isToday,
    };
  });

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Daily Timesheet
          </h2>
          <p className="text-muted-foreground mt-1">
            Log your daily activities to maintain your streak.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Calendar View */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Recent History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-center text-xs mb-2 text-muted-foreground">
                <div>Su</div>
                <div>Mo</div>
                <div>Tu</div>
                <div>We</div>
                <div>Th</div>
                <div>Fr</div>
                <div>Sa</div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {/* Empty slots for alignment if necessary, assuming start from Monday for simplicity in this mock */}
                {Array.from({ length: days[0].date.getDay() }).map((_, i) => (
                  <div
                    key={String(i)}
                    className="aspect-square rounded-md opacity-0"
                  />
                ))}
                {days.map((day, i) => {
                  let bg = "bg-muted text-muted-foreground";
                  if (day.status === "submitted")
                    bg = "bg-success/20 text-success border border-success/30";
                  if (day.status === "missing")
                    bg =
                      "bg-destructive/20 text-destructive border border-destructive/30";
                  if (day.status === "pending" || day.isToday)
                    bg =
                      "bg-warning/20 text-warning border-2 border-warning/50";
                  if (day.status === "exempt")
                    bg = "bg-muted/50 text-muted-foreground/50";

                  return (
                    <div
                      key={String(i)}
                      className={`aspect-square flex items-center justify-center rounded-md text-xs font-medium cursor-pointer transition-colors hover:opacity-80 ${bg}`}
                      title={`${day.date.toLocaleDateString()} - ${day.status}`}
                    >
                      {day.date.getDate()}
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-success/20 border border-success/30" />{" "}
                  Submitted
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/20 border border-destructive/30" />{" "}
                  Missed
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-warning/20 border-2 border-warning/50" />{" "}
                  Today
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                Streak Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">14 Days</div>
              <p className="text-sm text-muted-foreground mt-1">
                Keep it up! Submit today to reach 15 days.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Form */}
        <div className="md:col-span-2">
          <Card className="border-border/50 bg-card h-full">
            <CardHeader>
              <CardTitle className="text-xl flex items-center justify-between">
                <span>Submit for Today</span>
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary bg-primary/10"
                >
                  {new Date().toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </Badge>
              </CardTitle>
              <CardDescription>
                Fill out what you accomplished today. Detailed timesheets may
                earn a quality bonus.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Primary Task Category
                </Label>
                <Select>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend">
                      Frontend Development
                    </SelectItem>
                    <SelectItem value="backend">Backend Development</SelectItem>
                    <SelectItem value="design">UI/UX Design</SelectItem>
                    <SelectItem value="learning">
                      Learning / Coursework
                    </SelectItem>
                    <SelectItem value="meeting">Meetings / Syncs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  What did you work on today?
                </Label>
                <Textarea
                  placeholder="Describe your tasks, progress made, and any PRs or designs completed..."
                  className="min-h-[150px] bg-background resize-y"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Hours Spent (Approx)
                </Label>
                <Input
                  type="number"
                  placeholder="e.g. 4"
                  className="bg-background max-w-[150px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Blockers / Issues (Optional)
                </Label>
                <Textarea
                  placeholder="Anything holding you back?"
                  className="min-h-[80px] bg-background resize-y"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
                  Submit Timesheet
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
