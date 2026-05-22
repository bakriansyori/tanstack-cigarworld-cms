import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  component: ProductsAdmin,
});

type Row = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number | null;
  category: string | null;
  origin: string | null;
  strength: string | null;
  main_image: string | null;
  status: "draft" | "published";
  sort_order: number;
};

const empty: Partial<Row> = { status: "draft", sort_order: 0 };

function ProductsAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Row> | null>(null);

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("sort_order");
      if (error) throw error;
      return data as Row[];
    },
  });

  const save = useMutation({
    mutationFn: async (row: Partial<Row>) => {
      if (!row.name || !row.slug) throw new Error("Name & slug wajib");
      const payload = {
        name: row.name,
        slug: row.slug,
        description: row.description ?? null,
        price: row.price ?? null,
        category: row.category ?? null,
        origin: row.origin ?? null,
        strength: row.strength ?? null,
        main_image: row.main_image ?? null,
        status: row.status ?? "draft",
        sort_order: row.sort_order ?? 0,
      };
      if (row.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Tersimpan");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products", "published"] });
      setEditing(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Dihapus");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products", "published"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal hapus (perlu admin)"),
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-cigar-cream" style={{ fontFamily: "'Cirkus',serif" }}>Products</h1>
          <p className="text-cigar-cream/60 mt-1">Kelola katalog cerutu Anda.</p>
        </div>
        <Button onClick={() => setEditing({ ...empty })} className="bg-cigar-gold text-cigar-dark hover:bg-cigar-gold/90">
          <Plus size={16} className="mr-2" /> New product
        </Button>
      </div>

      <div className="border border-cigar-gold/20 bg-cigar-dark/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cigar-gold/10 text-cigar-cream/70 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Order</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-cigar-gold/10 text-cigar-cream/80">
                <td className="p-3">{p.name}</td>
                <td className="p-3 text-cigar-cream/50">{p.slug}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${p.status === "published" ? "bg-cigar-gold/20 text-cigar-gold" : "bg-cigar-cream/10 text-cigar-cream/60"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-3">{p.sort_order}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(p)} className="text-cigar-gold/70 hover:text-cigar-gold p-1"><Pencil size={14} /></button>
                  <button onClick={() => confirm("Hapus?") && remove.mutate(p.id)} className="text-cigar-gold/70 hover:text-destructive p-1 ml-2"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-cigar-cream/50">Belum ada produk.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="bg-cigar-dark border-cigar-gold/20 text-cigar-cream max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-cigar-cream">{editing?.id ? "Edit product" : "New product"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <Field label="Name *">
                  <Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
                </Field>
                <Field label="Slug *">
                  <Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} required pattern="[a-z0-9-]+" />
                </Field>
                <Field label="Category">
                  <Input value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
                </Field>
                <Field label="Origin">
                  <Input value={editing.origin ?? ""} onChange={(e) => setEditing({ ...editing, origin: e.target.value })} />
                </Field>
                <Field label="Strength">
                  <Input value={editing.strength ?? ""} onChange={(e) => setEditing({ ...editing, strength: e.target.value })} />
                </Field>
                <Field label="Price (IDR)">
                  <Input type="number" value={editing.price ?? ""} onChange={(e) => setEditing({ ...editing, price: e.target.value ? Number(e.target.value) : null })} />
                </Field>
              </div>
              <Field label="Main image URL">
                <Input value={editing.main_image ?? ""} onChange={(e) => setEditing({ ...editing, main_image: e.target.value })} placeholder="/images/your.webp atau https://..." />
              </Field>
              <Field label="Description">
                <Textarea rows={4} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Status">
                  <select
                    value={editing.status ?? "draft"}
                    onChange={(e) => setEditing({ ...editing, status: e.target.value as "draft" | "published" })}
                    className="w-full bg-cigar-dark border border-cigar-gold/20 px-3 py-2 rounded text-cigar-cream"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </Field>
                <Field label="Sort order">
                  <Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
                </Field>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="submit" disabled={save.isPending} className="bg-cigar-gold text-cigar-dark hover:bg-cigar-gold/90">
                  {save.isPending ? "Saving…" : "Save"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-cigar-cream/70 text-xs uppercase tracking-wider mb-1 block">{label}</Label>
      {children}
    </div>
  );
}
