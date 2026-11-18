import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { routes } from "@/config/site";
import { logoutAction } from "@/features/auth/actions";
import { requireUser } from "@/features/auth/queries";
import { getProfileById } from "@/features/profile/queries";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const profile = await getProfileById(user.id);
  if (!profile) redirect(routes.setup);

  return (
    <AdminShell username={profile.username} logoutAction={logoutAction}>
      {children}
    </AdminShell>
  );
}