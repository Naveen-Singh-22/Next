"use client";

import type { AdoptionApplication, AdoptionStatus } from "@/lib/adoptionApplicationTypes";

type ApplicationCardProps = {
  application: AdoptionApplication;
  selected: boolean;
  onOpen: (applicationId: number) => void;
  onMove: (applicationId: number, status: AdoptionStatus) => void;
  isUpdating?: boolean;
};

function formatDate(isoDate: string) {
  const date = new Date(isoDate);
  if (!Number.isFinite(date.getTime())) {
    return "Recently submitted";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function ApplicationCard({ application, selected, onOpen, onMove, isUpdating = false }: ApplicationCardProps) {
  return (
    <article
      className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition ${
        selected ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white hover:border-teal-300"
      }`}
      onClick={() => onOpen(application.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(application.id);
        }
      }}
      aria-label={`Open application ${application.id}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{application.applicantName}</h4>
          <p className="text-xs text-slate-600">Animal #{application.animalId}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase text-slate-600">
          {application.status.replace("_", " ")}
        </span>
      </div>

      <p className="mb-3 text-xs text-slate-500">Submitted {formatDate(application.createdAt)}</p>

      <div className="grid grid-cols-2 gap-2" onClick={(event) => event.stopPropagation()}>
        <button
          className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
          type="button"
          disabled={isUpdating || application.status === "shortlisted"}
          onClick={() => onMove(application.id, "shortlisted")}
        >
          Shortlist
        </button>
        <button
          className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
          type="button"
          disabled={isUpdating || application.status === "home_visit"}
          onClick={() => onMove(application.id, "home_visit")}
        >
          Schedule Visit
        </button>
        <button
          className="rounded-lg border border-emerald-300 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-45"
          type="button"
          disabled={isUpdating || application.status === "approved"}
          onClick={() => onMove(application.id, "approved")}
        >
          Approve
        </button>
        <button
          className="rounded-lg border border-rose-300 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-45"
          type="button"
          disabled={isUpdating || application.status === "rejected"}
          onClick={() => onMove(application.id, "rejected")}
        >
          Reject
        </button>
      </div>
    </article>
  );
}
