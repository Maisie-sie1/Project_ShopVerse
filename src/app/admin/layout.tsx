import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { getSessionUser } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">แผงผู้ดูแลระบบ</h1>
          <p className="mt-1 text-sm text-stone-500">สวัสดี {user.name} 👋</p>
        </div>
      </div>
      <div className="mt-6">
        <AdminNav />
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}