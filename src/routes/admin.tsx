import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, FileText, Image as ImgIcon, Users, Settings, LogOut, Globe } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isStaff, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", search: { redirect: pathname, mode: "login" } });
  }, [loading, user, navigate, pathname]);

  if (loading) {
    return <div className="min-h-screen bg-cigar-dark flex items-center justify-center text-cigar-cream/60">Loading…</div>;
  }
  if (!user) return null;
  if (!isStaff) {
    return (
      <div className="min-h-screen bg-cigar-dark flex items-center justify-center px-4 text-center">
        <div>
          <h1 className="text-2xl text-cigar-cream mb-2">Access denied</h1>
          <p className="text-cigar-cream/60 mb-6">Akun Anda belum memiliki peran staff.</p>
          <Button onClick={() => signOut()} variant="outline">Sign out</Button>
        </div>
      </div>
    );
  }

  const items: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/pages", label: "Page Content", icon: Settings },
    { to: "/admin/blog", label: "Blog", icon: FileText },
    { to: "/admin/media", label: "Media", icon: ImgIcon },
    { to: "/admin/users", label: "Users", icon: Users },
  ];

  return (
    <div className="min-h-screen flex bg-cigar-dark">
      <aside className="w-60 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <div className="text-xl text-cigar-gold tracking-widest" style={{ fontFamily: "'Cirkus',serif" }}>CMS</div>
          <p className="text-cigar-cream/40 text-xs mt-1">Adwaya Prana</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((it) => {
            const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                  active
                    ? "bg-cigar-gold/15 text-cigar-gold"
                    : "text-cigar-cream/70 hover:text-cigar-gold hover:bg-cigar-gold/5"
                }`}
              >
                <it.icon size={16} />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded text-sm text-cigar-cream/70 hover:text-cigar-gold">
            <Globe size={16} /> View site
          </Link>
          <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-cigar-cream/70 hover:text-cigar-gold">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
