"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

export type RescueDispatchMapReport = {
  reportId: string;
  fullName: string;
  species: string;
  urgency: "critical" | "urgent" | "standard";
  notes: string;
  lastSeenAddress: string;
  createdAt: string;
  healthConditions: string[];
  location: {
    latitude: number;
    longitude: number;
  };
};

type RescueDispatchMapClientProps = {
  reports: RescueDispatchMapReport[];
  selectedReportId?: string;
  onReportSelect: (reportId: string) => void;
};

const INDIA_CENTER: LatLngTuple = [22.7, 79.2];

const INDIA_BOUNDS: LatLngBoundsExpression = [
  [0.0, 60.0],
  [42.0, 103.0],
];

function hasValidLocation(report: RescueDispatchMapReport) {
  return Number.isFinite(report.location.latitude) && Number.isFinite(report.location.longitude);
}

function createDispatchIcon(report: RescueDispatchMapReport, isSelected: boolean) {
  const label = report.species.trim().charAt(0).toUpperCase() || "R";

  return L.divIcon({
    className: "dispatch-marker-wrapper",
    html: `<span class="dispatch-marker ${report.urgency} ${isSelected ? "is-selected" : ""}">${label}</span>`,
    iconAnchor: [14, 14],
    iconSize: [28, 28],
    popupAnchor: [0, -12],
  });
}

function MapViewport({ reports, selectedReport }: { reports: RescueDispatchMapReport[]; selectedReport?: RescueDispatchMapReport }) {
  const map = useMap();

  useEffect(() => {
    const validReports = reports.filter(hasValidLocation);

    if (validReports.length === 0) {
      map.setView(INDIA_CENTER, 5, { animate: true });
      return;
    }

    if (validReports.length === 1) {
      const onlyReport = validReports[0];
      map.flyTo([onlyReport.location.latitude, onlyReport.location.longitude], 10, {
        animate: true,
        duration: 0.7,
      });
      return;
    }

    const bounds = L.latLngBounds(
      validReports.map((report) => [report.location.latitude, report.location.longitude] as LatLngTuple),
    );

    map.fitBounds(bounds.pad(0.18), {
      animate: true,
      duration: 0.8,
    });
  }, [map, reports]);

  useEffect(() => {
    if (!selectedReport) {
      return;
    }

    map.flyTo([selectedReport.location.latitude, selectedReport.location.longitude], Math.max(map.getZoom(), 9), {
      animate: true,
      duration: 0.7,
    });
  }, [map, selectedReport]);

  return null;
}

export default function RescueDispatchMapClient({ reports, selectedReportId, onReportSelect }: RescueDispatchMapClientProps) {
  const validReports = useMemo(() => reports.filter(hasValidLocation), [reports]);
  const selectedReport = validReports.find((report) => report.reportId === selectedReportId) ?? validReports[0];

  if (validReports.length === 0) {
    return (
      <div className="map-box rescue-dispatch-map" aria-label="Live rescue map">
        <p className="map-hint">No rescue reports with coordinates yet.</p>
      </div>
    );
  }

  return (
    <div className="map-box rescue-dispatch-map" aria-label="Live rescue map">
      <MapContainer
        className="rescue-map"
        center={INDIA_CENTER}
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={0.2}
        maxZoom={18}
        minZoom={2}
        scrollWheelZoom
        zoom={5}
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport reports={validReports} selectedReport={selectedReport} />
        {validReports.map((report) => (
          <Marker
            key={report.reportId}
            eventHandlers={{ click: () => onReportSelect(report.reportId) }}
            icon={createDispatchIcon(report, report.reportId === selectedReport?.reportId)}
            position={[report.location.latitude, report.location.longitude]}
          >
            <Popup>
              <strong>{report.fullName}</strong>
              <br />
              {report.species} • {report.urgency.toUpperCase()}
              <br />
              {report.lastSeenAddress}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <p className="map-hint">
        {selectedReport
          ? `${selectedReport.fullName} selected. Click another pin to switch cases.`
          : "Click a pin to focus a rescue case."}
      </p>
    </div>
  );
}