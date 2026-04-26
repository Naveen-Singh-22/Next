"use client";

import { useState } from "react";
import type { AdoptionApplication } from "@/lib/adoptionApplicationTypes";

type DetailPanelProps = {
  application: AdoptionApplication | null;
  onSaveNotes: (applicationId: number, notes: string) => Promise<void>;
  isSaving?: boolean;
};

function formatDate(isoDate: string) {
  const date = new Date(isoDate);
  if (!Number.isFinite(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function DetailPanel({ application, onSaveNotes, isSaving = false }: DetailPanelProps) {
  const [notes, setNotes] = useState(application?.adminNotes ?? "");

  if (!application) {
    return (
      <aside className="h-fit rounded-2xl border border-dashed border-slate-300 bg-white p-4">
        <p className="text-sm text-slate-500">Select an application card to view details.</p>
      </aside>
    );
  }

  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-1 text-lg font-semibold text-slate-900">Application {application.applicationId}</h3>
      <p className="mb-4 text-sm text-slate-600">Current status: {application.status.replace("_", " ")}</p>

      <div className="mb-4 space-y-1 text-sm text-slate-700">
        <p>
          <strong>Name:</strong> {application.applicantName}
        </p>
        <p>
          <strong>Email:</strong> {application.email}
        </p>
        <p>
          <strong>Phone:</strong> {application.phone}
        </p>
        <p>
          <strong>City:</strong> {application.city}
        </p>
        <p>
          <strong>Housing:</strong> {application.housing}
        </p>
        <p>
          <strong>Animal:</strong> {application.animalName}
        </p>
      </div>

      <div className="mb-4 space-y-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
        <p>
          <strong>Why adopt:</strong> {application.whyAdopt}
        </p>
        <p>
          <strong>Pet experience:</strong> {application.petExperience}
        </p>
      </div>

      <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="admin-notes">
        Admin Notes
      </label>
      <textarea
        id="admin-notes"
        className="mb-2 min-h-24 w-full rounded-xl border border-slate-300 p-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Add private review notes"
      />
      <button
        type="button"
        className="mb-4 rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={() => onSaveNotes(application.id, notes)}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save Notes"}
      </button>

      <h4 className="mb-2 text-sm font-semibold text-slate-900">Timeline</h4>
      <ul className="space-y-2">
        {application.timeline.map((entry, index) => (
          <li key={`${entry.type}-${entry.time}-${index}`} className="rounded-lg border border-slate-200 p-2 text-xs text-slate-600">
            <p className="font-medium text-slate-900">{entry.type}</p>
            <p>{formatDate(entry.time)}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
