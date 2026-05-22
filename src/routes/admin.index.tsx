import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, FileText, Image as ImgIcon } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

async function fetchStats() {
  const [products, posts, media] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("media").select("id", { count: "exact", head: true }),
  ]);
  return {
    products: products.count ?? 0,
    posts: posts.count ?? 0,
    media: media.count ?? 0,
  };
}

function AdminDashboard() {
  const { data } = useQuery({ queryKey: ["admin-stats"], queryFn: fetchStats });
  const stats = [
    { label: "Products", value: data?.products ?? "—", Icon: Package },
    { label: "Articles", value: data?.posts ?? "—", Icon: FileText },
    { label: "Media files", value: data?.media ?? "—", Icon: ImgIcon },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl text-cigar-cream mb-2" style={{ fontFamily: "'Cirkus',serif" }}>Dashboard</h1>
      <p className="text-cigar-cream/60 mb-8">Selamat datang di CMS Adwaya Prana.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="border border-cigar-gold/20 p-6 bg-cigar-dark/50">
            <s.Icon className="text-cigar-gold mb-4" size={24} />
            <p className="text-cigar-cream/60 text-sm uppercase tracking-wider">{s.label}</p>
            <p className="text-3xl text-cigar-cream mt-2">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 border border-cigar-gold/20 p-6 bg-cigar-dark/50">
        <h2 className="text-xl text-cigar-cream mb-3">Tips</h2>
        <ul className="text-cigar-cream/60 text-sm space-y-2 list-disc pl-5">
          <li>Kelola produk di menu <strong className="text-cigar-gold">Products</strong>.</li>
          <li>Edit teks beranda di menu <strong className="text-cigar-gold">Page Content</strong>.</li>
          <li>Tulis artikel di menu <strong className="text-cigar-gold">Blog</strong>.</li>
        </ul>
      </div>
    </div>
  );
}
