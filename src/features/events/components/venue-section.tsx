"use client";

import {
  type Control,
  Controller,
  type FieldErrors,
  type UseFormWatch,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreateEventSchema } from "../schemas";

interface VenueSectionProps {
  control: Control<CreateEventSchema>;
  watch: UseFormWatch<CreateEventSchema>;
  errors?: FieldErrors<CreateEventSchema>;
  variant?: "default" | "plain";
}

export function VenueSection({
  control,
  watch,
  errors,
  variant = "default",
}: VenueSectionProps) {
  const venueType = watch("venue_type");

  const content = (
    <>
      <Controller
        control={control}
        name="venue_type"
        render={({ field }) => (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Venue type <span className="text-destructive">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Physical", value: "physical" },
                { label: "Online", value: "online" },
                { label: "Hybrid", value: "hybrid" },
              ].map((item) => {
                const active = field.value === item.value;
                return (
                  <Button
                    key={item.value}
                    type="button"
                    size="sm"
                    variant={active ? "default" : "outline"}
                    onClick={() => field.onChange(item.value)}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      />
      {errors?.venue_type?.message ? (
        <p className="text-xs text-destructive">{errors.venue_type.message}</p>
      ) : null}

      {(venueType === "physical" || venueType === "hybrid") && (
        <Controller
          control={control}
          name="maps_url"
          render={({ field }) => (
            <div className="space-y-1">
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
      )}

      {errors?.maps_url?.message ? (
        <p className="text-xs text-destructive">{errors.maps_url.message}</p>
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
                  Address <span className="text-destructive">*</span>
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
                  City <span className="text-destructive">*</span>
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
                  Online link <span className="text-destructive">*</span>
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
                  Platform <span className="text-destructive">*</span>
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
        <p className="text-xs text-destructive">{errors.address.message}</p>
      ) : null}
      {errors?.city?.message ? (
        <p className="text-xs text-destructive">{errors.city.message}</p>
      ) : null}
      {errors?.online_link?.message ? (
        <p className="text-xs text-destructive">{errors.online_link.message}</p>
      ) : null}
      {errors?.platform?.message ? (
        <p className="text-xs text-destructive">{errors.platform.message}</p>
      ) : null}
    </>
  );

  if (variant === "plain") {
    return <div className="space-y-3">{content}</div>;
  }

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Venue</h3>
      {content}
    </section>
  );
}
