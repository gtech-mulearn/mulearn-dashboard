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
      <h3 className="mb-3 text-sm font-semibold text-foreground">Venue</h3>

      <Controller
        control={control}
        name="venue_type"
        render={({ field }) => (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Venue type <span className="text-red-500">*</span>
            </p>
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
          </div>
        )}
      />
      {errors?.venue_type?.message ? (
        <p className="text-xs text-red-600">{errors.venue_type.message}</p>
      ) : null}

      {(venueType === "physical" || venueType === "hybrid") && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Controller
            control={control}
            name="address"
            render={({ field }) => (
              <div className="space-y-1">
                <label
                  htmlFor="venue_address"
                  className="text-sm font-medium text-foreground"
                >
                  Address <span className="text-red-500">*</span>
                </label>
                <Input
                  id="venue_address"
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Address"
                />
              </div>
            )}
          />
          <Controller
            control={control}
            name="city"
            render={({ field }) => (
              <div className="space-y-1">
                <label
                  htmlFor="venue_city"
                  className="text-sm font-medium text-foreground"
                >
                  City <span className="text-red-500">*</span>
                </label>
                <Input
                  id="venue_city"
                  {...field}
                  value={field.value ?? ""}
                  placeholder="City"
                />
              </div>
            )}
          />
          <Controller
            control={control}
            name="maps_url"
            render={({ field }) => (
              <div className="space-y-1 md:col-span-2">
                <label
                  htmlFor="venue_maps_url"
                  className="text-sm font-medium text-foreground"
                >
                  Maps URL{" "}
                  <span className="text-xs text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <Input
                  id="venue_maps_url"
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Google Maps URL"
                />
              </div>
            )}
          />
        </div>
      )}

      {(venueType === "online" || venueType === "hybrid") && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Controller
            control={control}
            name="online_link"
            render={({ field }) => (
              <div className="space-y-1">
                <label
                  htmlFor="venue_online_link"
                  className="text-sm font-medium text-foreground"
                >
                  Online link <span className="text-red-500">*</span>
                </label>
                <Input
                  id="venue_online_link"
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Online Link"
                />
              </div>
            )}
          />
          <Controller
            control={control}
            name="platform"
            render={({ field }) => (
              <div className="space-y-1">
                <label
                  htmlFor="venue_platform"
                  className="text-sm font-medium text-foreground"
                >
                  Platform <span className="text-red-500">*</span>
                </label>
                <Input
                  id="venue_platform"
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Platform"
                />
              </div>
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
