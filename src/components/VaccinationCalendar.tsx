"use client";

import { useState } from "react";
import type { VaccinationStatus } from "@/lib/vaccinationTypes";

type CalendarRecord = {
  animalCode: string;
  animalName: string;
  vaccineName: string;
  nextDueDate: string;
  status: VaccinationStatus;
};

type VaccinationCalendarProps = {
  records: CalendarRecord[];
};

function toLocalDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
}

function formatDay(value: number) {
  return new Intl.DateTimeFormat("en", { day: "numeric" }).format(new Date(2024, 0, value));
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function VaccinationCalendar({ records }: VaccinationCalendarProps) {
  const today = new Date();
  const todayKey = toDateKey(today);
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const firstDayIndex = firstDay.getDay();
  const totalCells = Math.ceil((firstDayIndex + lastDay.getDate()) / 7) * 7;
  const recordsByDate = new Map<string, CalendarRecord[]>();

  for (const record of records) {
    const key = record.nextDueDate.slice(0, 10);
    const items = recordsByDate.get(key) ?? [];
    items.push(record);
    recordsByDate.set(key, items);
  }

  const calendarCells = Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - firstDayIndex + 1;

    if (dayNumber < 1 || dayNumber > lastDay.getDate()) {
      return null;
    }

    const cellDate = new Date(today.getFullYear(), today.getMonth(), dayNumber);
    const key = toDateKey(cellDate);

    return {
      dayNumber,
      key,
      records: recordsByDate.get(key) ?? [],
    };
  });

  const selectedDayRecords = [...(recordsByDate.get(selectedDateKey) ?? [])].sort((left, right) => left.animalName.localeCompare(right.animalName));

  const selectedDayLabel = toLocalDate(selectedDateKey).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="rounded-[28px] border border-slate-200 bg-slate-950/95 p-5 text-slate-100 shadow-[0_24px_80px_rgba(15,23,42,0.26)]">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Calendar</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{formatMonthLabel(today)}</h3>
          <p className="mt-1 text-sm text-slate-300">Upcoming vaccinations, boosters, and follow-up due dates.</p>
        </div>
        <div className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
          {records.length} records
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-[0.28em] text-slate-400">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {calendarCells.map((cell, index) => {
          if (!cell) {
            return <div key={`empty-${index}`} className="min-h-24 rounded-2xl border border-white/5 bg-white/5" />;
          }

          const hasRecords = cell.records.length > 0;
          const isToday = cell.dayNumber === today.getDate();

          return (
            <button
              type="button"
              onClick={() => setSelectedDateKey(cell.key)}
              key={cell.key}
              aria-pressed={selectedDateKey === cell.key}
              className={`min-h-24 rounded-2xl border p-2 transition ${
                selectedDateKey === cell.key
                  ? "border-cyan-300 bg-cyan-300/10 shadow-[0_0_0_1px_rgba(103,232,249,0.3)]"
                  : isToday
                    ? "border-cyan-300/60 bg-cyan-300/5"
                    : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>{formatDay(cell.dayNumber)}</span>
                {hasRecords ? <span className="rounded-full bg-amber-300/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-amber-200">Due</span> : null}
              </div>
              <div className="mt-2 space-y-1 text-left">
                {cell.records.slice(0, 2).map((record) => (
                  <div key={`${cell.key}-${record.animalName}-${record.vaccineName}`} className="rounded-xl bg-slate-900/80 px-2 py-1 text-[11px] text-slate-200">
                    <p className="truncate font-medium text-white">{record.animalName}</p>
                    <p className="truncate text-slate-400">{record.vaccineName}</p>
                  </div>
                ))}
                {cell.records.length > 2 ? <p className="px-1 text-[11px] text-slate-400">+{cell.records.length - 2} more</p> : null}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
        <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">Appointments on {selectedDayLabel}</h4>
        <ul className="mt-3 space-y-3">
          {selectedDayRecords.length > 0 ? (
            selectedDayRecords.map((record) => (
              <li key={`${record.animalName}-${record.nextDueDate}`} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900/80 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-white">{record.animalName}</p>
                  <p className="text-xs text-slate-400">{record.animalCode} • {record.vaccineName}</p>
                </div>
                <div className="text-right text-xs text-slate-300">
                  <p>{toLocalDate(record.nextDueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                  <p className="uppercase tracking-[0.25em] text-cyan-200">{record.status}</p>
                </div>
              </li>
            ))
          ) : (
            <li className="rounded-2xl border border-dashed border-white/15 px-3 py-4 text-sm text-slate-400">
              No due appointments on this date.
            </li>
          )}
        </ul>
      </div>
    </article>
  );
}
