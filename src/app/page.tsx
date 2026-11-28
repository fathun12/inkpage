import { redirect } from "next/navigation";
import { routes } from "@/config/site";

// The address "/" on localhost and vercel.app goes straight to the sign in page.
// On mfniam.com this file is never reached: "/" is the Home of the website (next.config.ts, rewrites).
export default function Home() {
  redirect(routes.login);
}