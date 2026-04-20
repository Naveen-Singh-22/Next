"use client";

import dynamic from "next/dynamic";

const RescueLocationMapClient = dynamic(() => import("@/components/RescueLocationMapClient"), {
  ssr: false,
  loading: () => (
    <div className="map-box" aria-label="India map loading state">
      <p className="map-hint">Loading map...</p>
    </div>
  ),
});

export default function RescueLocationMap() {
  return <RescueLocationMapClient />;
}
