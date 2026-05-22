import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/blog")({
  component: BlogAdmin,
});

type Row = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  content: string | null;
  status: "draft" | "published";
  published_at: string | null;
};

function BlogAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Row> | null>(null);

  const { data: posts = [] } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Row[];
    },
  });

  const save = useMutation({
    mutationFn: async (row: Partial<Row>) => {
      if (!row.title || !row.slug) throw new Error("Title & slug wajib");
      const payload = {
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt ?? null,
        cover_image: row.cover_image ?? null,
        content: row.content ?? null,
        status: row.status ?? "draft",
        published_at: row.status === "published" ? (row.published_at ?? new Date().toISOString()) : null,
      };
      if (row.id) {
        const { error } = await supabase.from("posts").update(payload).eq("id", row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("posts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Tersimpan");
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      qc.invalidateQueries({ queryKey: ["posts", "published"] });
      setEditing(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Dihapus");
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal (perlu admin)"),
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-cigar-cream" style={{ fontFamily: "'Cirkus',serif" }}>Blog</h1>
          <p className="text-cigar-cream/60 mt-1">Tulis & kelola artikel.</p>
        </div>
        <Button onClick={() => setEditing({ status: "draft" })} className="bg-cigar-gold text-cigar-dark hover:bg-cigar-gold/90">
          <Plus size={16} className="mr-2" /> New article
        </Button>
      </div>

      <div className="border border-cigar-gold/20 bg-cigar-dark/50">
        <table className="w-full text-sm">
          <thead className="bg-cigar-gold/10 text-cigar-cream/70 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-cigar-gold/10 text-cigar-cream/80">
                <td className="p-3">{p.title}</td>
                <td className="p-3 text-cigar-cream/50">{p.slug}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${p.status === "published" ? "bg-cigar-gold/20 text-cigar-gold" : "bg-cigar-cream/10 text-cigar-cream/60"}`}>{p.status}</span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(p)} className="text-cigar-gold/70 hover:text-cigar-gold p-1"><Pencil size={14} /></button>
                  <button onClick={() => confirm("Hapus?") && remove.mutate(p.id)} className="text-cigar-gold/70 hover:text-destructive p-1 ml-2"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-cigar-cream/50">Belum ada artikel.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="bg-cigar-dark border-cigar-gold/20 text-cigar-cream max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-cigar-cream">{editing?.id ? "Edit article" : "New article"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-cigar-cream/70">Title *</Label>
                  <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-cigar-cream/70">Slug *</Label>
                  <Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} required pattern="[a-z0-9-]+" />
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-cigar-cream/70">Cover image URL</Label>
                <Input value={editing.cover_image ?? ""} onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-cigar-cream/70">Excerpt</Label>
                <Textarea rows={2} value={editing.excerpt ?? ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-cigar-cream/70">Content (HTML)</Label>
                <Textarea rows={12} className="font-mono text-xs" value={editing.content ?? ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} placeholder="<p>Tulis di sini...</p>" />
                <p className="text-cigar-cream/40 text-xs mt-1">Tip: gunakan tag &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;&lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;.</p>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-cigar-cream/70">Status</Label>
                <select
                  value={editing.status ?? "draft"}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as "draft" | "published" })}
                  className="w-full bg-cigar-dark border border-cigar-gold/20 px-3 py-2 rounded text-cigar-cream"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
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
