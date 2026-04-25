"use client";

import type { AdoptionApplication, AdoptionStatus } from "@/lib/adoptionApplicationTypes";
import ApplicationCard from "@/components/ApplicationCard";

type PipelineColumnProps = {
  title: string;
  status: AdoptionStatus;
  applications: AdoptionApplication[];
  selectedId: number | null;
  updatingId: number | null;
  onOpen: (applicationId: number) => void;
  onMove: (applicationId: number, status: AdoptionStatus) => void;
};

export default function PipelineColumn({
  title,
  status,
  applications,
  selectedId,
  updatingId,
  onOpen,
  onMove,
}: PipelineColumnProps) {
  return (
    <section
      className="min-w-[280px] flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-3"
      data-status={status}
    >
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600">{applications.length}</span>
      </header>

      <div className="space-y-3">
        {applications.length === 0 ? <p className="rounded-xl bg-white p-3 text-xs text-slate-500">No applications.</p> : null}

        {applications.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            selected={selectedId === application.id}
            onOpen={onOpen}
            onMove={onMove}
            isUpdating={updatingId === application.id}
          />
        ))}
      </div>
    </section>
  );
}
