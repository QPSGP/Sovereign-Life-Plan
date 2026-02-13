import { redirect } from "next/navigation";
import { verifyAdminCookie } from "@/lib/auth";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const verified = await verifyAdminCookie();
  if (!verified) redirect("/admin/login");
  return <>{children}</>;
}
