/**
 * Roles Display Component
 *
 * 📍 src/features/profile/components/roles-display.tsx
 *
 * Shows user's roles/positions.
 */

"use client";

import { Shield } from "lucide-react";

interface RolesDisplayProps {
  roles: string[];
}

export function RolesDisplay({ roles }: RolesDisplayProps) {
  if (!roles || roles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground">Roles</h3>
      <div className="flex flex-wrap gap-2">
        {roles.map((role) => (
          <span
            key={role}
            className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-purple-50 to-indigo-50 px-3 py-1.5 text-sm font-medium text-purple-700 ring-1 ring-inset ring-purple-200"
          >
            <Shield className="h-3.5 w-3.5" />
            {role}
          </span>
        ))}
      </div>
    </div>
  );
}
