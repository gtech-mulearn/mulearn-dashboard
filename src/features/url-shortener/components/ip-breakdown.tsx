"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface IpBreakdownProps {
  data: Record<string, number>;
}

export function IpBreakdown({ data }: IpBreakdownProps) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>IP Address</TableHead>
            <TableHead>Clicks</TableHead>
            <TableHead>Percentage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map(([ip, count]) => (
            <TableRow key={ip}>
              <TableCell className="font-mono text-sm">{ip}</TableCell>
              <TableCell>{count}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-muted rounded-full h-2 max-w-xs">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(count / total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {((count / total) * 100).toFixed(1)}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
