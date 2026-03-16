import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { AuthProvider } from "@/components/layout/session-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <AuthProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-sentinel-950">
        <Sidebar
          user={{
            name: session.user?.name,
            image: session.user?.image,
            email: session.user?.email,
          }}
        />
        <main className="ml-56 min-h-screen">{children}</main>
      </div>
    </AuthProvider>
  );
}
