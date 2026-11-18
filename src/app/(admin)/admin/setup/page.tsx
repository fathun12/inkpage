import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SetupForm } from "@/components/admin/SetupForm";
import { routes } from "@/config/site";
import { requireUser } from "@/features/auth/queries";
import { createProfileAction } from "@/features/profile/actions";
import { getProfileById } from "@/features/profile/queries";

export const metadata: Metadata = { title: "Set up" };

type Props = { searchParams: Promise<{ error?: string }> };

export default async function SetupPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const user = await requireUser();
  if (await getProfileById(user.id)) redirect(routes.admin);
  return <SetupForm action={createProfileAction} error={error} />;
}