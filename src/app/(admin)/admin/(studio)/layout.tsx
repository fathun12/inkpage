import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { routes } from "@/config/site";
import { requireUser } from "@/features/auth/queries";
import { getProfileById } from "@/features/profile/queries";

// The studio has its own full-screen layout (no AdminShell), but the same login guard.
export default async function StudioLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const profile = await getProfileById(user.id);
  if (!profile) redirect(routes.setup);

  return <>{children}</>;
}