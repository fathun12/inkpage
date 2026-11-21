import { redirect } from "next/navigation";
import { routes } from "@/config/site";

// Old address. The settings moved to the Customize studio.
export default function AppearancePage() {
  redirect(routes.customize);
}