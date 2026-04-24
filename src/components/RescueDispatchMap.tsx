"use client";

import dynamic from "next/dynamic";
export type { RescueDispatchMapReport } from "@/components/RescueDispatchMapClient";

type RescueDispatchMapProps = {
  reports: Array<{
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
  }>;
  selectedReportId?: string;
  onReportSelect: (reportId: string) => void;
};

const RescueDispatchMapClient = dynamic(() => import("@/components/RescueDispatchMapClient"), {
  ssr: false,
  loading: () => (
    <div className="map-box" aria-label="Live rescue map loading state">
      <p className="map-hint">Loading live dispatch map...</p>
    </div>
  ),
});

export default function RescueDispatchMap({ reports, selectedReportId, onReportSelect }: RescueDispatchMapProps) {
  return (
    <RescueDispatchMapClient
      reports={reports}
      selectedReportId={selectedReportId}
      onReportSelect={onReportSelect}
    />
  );
}