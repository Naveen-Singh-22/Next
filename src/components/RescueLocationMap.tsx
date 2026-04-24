"use client";

import dynamic from "next/dynamic";
import type { LatLngTuple } from "leaflet";

type RescueLocationMapProps = {
  marker: LatLngTuple;
  onMarkerChange: (point: LatLngTuple) => void;
};

const RescueLocationMapClient = dynamic(() => import("@/components/RescueLocationMapClient"), {
  ssr: false,
  loading: () => (
    <div className="map-box" aria-label="India map loading state">
      <p className="map-hint">Loading map...</p>
    </div>
  ),
});

export default function RescueLocationMap({ marker, onMarkerChange }: RescueLocationMapProps) {
  return <RescueLocationMapClient marker={marker} onMarkerChange={onMarkerChange} />;
}
