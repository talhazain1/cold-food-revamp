import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) redirect("/");
  const pendingCount = await prisma.order.count({ where: { status: "PENDING" } });
  return (
    <div className="flex min-h-[70vh]">
      <AdminSidebar pendingCount={pendingCount} />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
