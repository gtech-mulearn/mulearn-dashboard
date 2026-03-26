"use client";

import {
  type Control,
  Controller,
  type FieldErrors,
  type UseFormWatch,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { CreateEventSchema } from "../schemas";

interface VenueSectionProps {
  control: Control<CreateEventSchema>;
  watch: UseFormWatch<CreateEventSchema>;
  errors?: FieldErrors<CreateEventSchema>;
}

export function VenueSection({ control, watch, errors }: VenueSectionProps) {
  const venueType = watch("venue_type");

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <h3 className="font-semibold">Venue</h3>

      <Controller
        control={control}
        name="venue_type"
        render={({ field }) => (
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Physical", value: "physical" },
              { label: "Online", value: "online" },
              { label: "Hybrid", value: "hybrid" },
            ].map((item) => {
              const active = field.value === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  className={`rounded-md border px-3 py-1.5 text-sm ${
                    active ? "border-pink-500 bg-pink-50 text-pink-700" : ""
                  }`}
                  onClick={() => field.onChange(item.value)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      />
      {errors?.venue_type?.message ? (
        <p className="text-xs text-red-600">{errors.venue_type.message}</p>
      ) : null}

      {(venueType === "physical" || venueType === "hybrid") && (
        <div className="grid gap-3 md:grid-cols-2">
          <Controller
            control={control}
            name="address"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="Address"
              />
            )}
          />
          <Controller
            control={control}
            name="city"
            render={({ field }) => (
              <Input {...field} value={field.value ?? ""} placeholder="City" />
            )}
          />
          <Controller
            control={control}
            name="maps_url"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="Google Maps URL"
              />
            )}
          />
        </div>
      )}

      {(venueType === "online" || venueType === "hybrid") && (
        <div className="grid gap-3 md:grid-cols-2">
          <Controller
            control={control}
            name="online_link"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="Online Link"
              />
            )}
          />
          <Controller
            control={control}
            name="platform"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="Platform"
              />
            )}
          />
        </div>
      )}

      {errors?.address?.message ? (
        <p className="text-xs text-red-600">{errors.address.message}</p>
      ) : null}
      {errors?.city?.message ? (
        <p className="text-xs text-red-600">{errors.city.message}</p>
      ) : null}
      {errors?.online_link?.message ? (
        <p className="text-xs text-red-600">{errors.online_link.message}</p>
      ) : null}
      {errors?.platform?.message ? (
        <p className="text-xs text-red-600">{errors.platform.message}</p>
      ) : null}
    </section>
  );
}
