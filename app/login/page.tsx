import { Suspense } from "react";
import UnifiedLoginPage from "@/components/UnifiedLoginPage";

export const dynamic = "force-dynamic";

export default function LoginRoutePage() {
  return (
    <Suspense fallback={null}>
      <UnifiedLoginPage />
    </Suspense>
  );
}
