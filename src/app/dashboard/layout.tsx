import { requireAuth } from "@/lib/auth-helpers";

// Dashboard layout — all /dashboard/* routes
// Server-side auth guard (belt-and-suspenders with middleware)
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // This ensures the session is valid even if middleware was bypassed
  await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
