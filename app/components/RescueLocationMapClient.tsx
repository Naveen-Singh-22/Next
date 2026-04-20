"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";

const INDIA_VIEW_BOUNDS: LatLngBoundsExpression = [
  [6.0, 67.0],
  [38.8, 97.8],
];

const INDIA_MAX_BOUNDS: LatLngBoundsExpression = [
  [0.0, 60.0],
  [42.0, 103.0],
];

type MapClickHandlerProps = {
  onPick: (point: LatLngTuple) => void;
};

function MapClickHandler({ onPick }: MapClickHandlerProps) {
  useMapEvents({
    click(event) {
      onPick([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

export default function RescueLocationMapClient() {
  const [marker, setMarker] = useState<LatLngTuple>([28.6139, 77.209]);

  useEffect(() => {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <div className="map-box" aria-label="India map picker">
      <MapContainer
        className="rescue-map"
        bounds={INDIA_VIEW_BOUNDS}
        boundsOptions={{ padding: [12, 12] }}
        minZoom={2}
        maxZoom={18}
        maxBounds={INDIA_MAX_BOUNDS}
        maxBoundsViscosity={0.2}
        zoomSnap={0.25}
        zoomControl
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapClickHandler onPick={setMarker} />
        <Marker position={marker}>
          <Popup>
            Selected location
            <br />
            Lat: {marker[0].toFixed(4)}, Lng: {marker[1].toFixed(4)}
          </Popup>
        </Marker>
      </MapContainer>
      <p className="map-hint">Click on the map to pin where the animal was last seen.</p>
    </div>
  );
}
