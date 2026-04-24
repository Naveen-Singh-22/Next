import RescueReportForm from "@/components/RescueReportForm";
import ScrollReveal from "@/components/ScrollReveal";
import SiteNav from "@/components/SiteNav";

export default function RescuePage() {
  return (
    <div className="rescue-page">
      <SiteNav />

      <main className="section-wrap rescue-main">
        <ScrollReveal as="section" className="rescue-head">
          <p className="eyebrow reveal-item">Emergency Dispatch</p>
          <h1 className="reveal-item">Report an Animal in Need.</h1>
          <p className="reveal-item">
            Your report provides a lifeline. Please provide accurate details to
            help our field teams locate and assess the animal as quickly as
            possible.
          </p>
        </ScrollReveal>

        <ScrollReveal as="div" className="rescue-layout-wrap" delayMs={80}>
          <RescueReportForm />
        </ScrollReveal>
      </main>

    </div>
  );
}

