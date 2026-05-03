import UserManagementClient from "@/components/UserManagementClient";

export const metadata = {
  title: "User & Role Management | thecaninehelp Admin",
  description: "Manage users and roles in the thecaninehelp admin dashboard",
};

export default function UserManagementPage() {
  return <UserManagementClient />;
}
