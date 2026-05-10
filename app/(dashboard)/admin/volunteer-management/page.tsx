"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopbar from "@/components/AdminTopbar";
import VolunteerManagementClient from "@/components/VolunteerManagementClient";
import type { StoredVolunteerApplication } from "@/lib/volunteerApplicationsStore";

async function getVolunteerApplications(): Promise<StoredVolunteerApplication[]> {
  try {
    const response = await fetch("/api/volunteer", { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as { applications?: StoredVolunteerApplication[] };
      return data.applications ?? [];
    }
  } catch {
    console.error("Failed to fetch volunteer applications");
  }
  return [];
}

export default function VolunteerManagementPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [applications, setApplications] = useState<StoredVolunteerApplication[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      const data = await getVolunteerApplications();
      setApplications(data);
      setIsLoadingInitial(false);
    }

    loadApplications();
  }, []);

  return (
    <div className="admin-page admin-mobile-shell">
      <AdminSidebar
        activeHref="/admin/volunteer-management"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="admin-main">
        <AdminTopbar
          activeHref="/admin/volunteer-management"
          isSidebarOpen={isSidebarOpen}
          onOpenMenu={() => setIsSidebarOpen(true)}
        />

        <main className="admin-content">
          {isLoadingInitial ? (
            <div className="loading-container">
              <p>Loading volunteer data...</p>
            </div>
          ) : (
            <VolunteerManagementClient initialApplications={applications} />
          )}
        </main>
      </div>
    </div>
  );
}
