import { redirect } from "next/navigation";

export default function InventoryRouteRedirectPage() {
  redirect("/admin/inventory");
}
