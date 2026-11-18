import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { routes } from "@/config/site";
import { loginAction } from "@/features/auth/actions";
import { getCurrentUser } from "@/features/auth/queries";

export const metadata: Metadata = { title: "Sign in" };

type Props = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  if (await getCurrentUser()) redirect(routes.admin);
  return <LoginForm action={loginAction} error={error} />;
}