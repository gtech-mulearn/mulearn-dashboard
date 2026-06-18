"use client";

import { Globe, MapPin } from "lucide-react";

interface GeoMapProps {
  data: {
    countries: Record<string, number>;
    region: Record<string, number>;
    city: Record<string, number>;
  };
}

export function GeoMap({ data }: GeoMapProps) {
  const countryData = Object.entries(data.countries);
  const regionData = Object.entries(data.region);
  const cityData = Object.entries(data.city);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Countries</p>
            <div className="space-y-1">
              {countryData.map(([code, count]) => (
                <p key={code} className="text-sm font-medium text-foreground">
                  {code}: <span className="text-primary">{count}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Regions</p>
            <div className="space-y-1">
              {regionData.map(([region, count]) => (
                <p key={region} className="text-sm font-medium text-foreground">
                  {region}: <span className="text-primary">{count}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Cities</p>
            <div className="space-y-1">
              {cityData.map(([city, count]) => (
                <p key={city} className="text-sm font-medium text-foreground">
                  {city}: <span className="text-primary">{count}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
