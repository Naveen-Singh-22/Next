"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopbar from "@/components/AdminTopbar";
import DonationTrackingClient from "@/components/DonationTrackingClient";
import type { StoredDonation } from "@/lib/donationsStore";

async function getDonations(): Promise<StoredDonation[]> {
  try {
    const response = await fetch("/api/donations", { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as { donations?: StoredDonation[] };
      return data.donations ?? [];
    }
  } catch {
    console.error("Failed to fetch donations");
  }
  return [];
}

export default function DonationTrackingPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [donations, setDonations] = useState<StoredDonation[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  useEffect(() => {
    async function loadDonations() {
      const data = await getDonations();
      setDonations(data);
      setIsLoadingInitial(false);
    }

    loadDonations();
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar
        activeHref="/admin/donation-tracking"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="admin-main">
        <AdminTopbar
          activeHref="/admin/donation-tracking"
          isSidebarOpen={isSidebarOpen}
          onOpenMenu={() => setIsSidebarOpen(true)}
        />

        <main className="admin-content">
          {isLoadingInitial ? (
            <div className="loading-container">
              <p>Loading donation data...</p>
            </div>
          ) : (
            <DonationTrackingClient initialDonations={donations} />
          )}
        </main>
      </div>
    </div>
  );
}
