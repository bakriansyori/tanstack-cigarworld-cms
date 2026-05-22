import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2, Upload, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/media")({
  component: MediaAdmin,
});

type Row = { id: string; url: string; path: string; filename: string | null; size: number | null };

function MediaAdmin() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: items = [] } = useQuery({
    queryKey: ["admin-media"],
    queryFn: async () => {
      const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Row[];
    },
  });

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("media").upload(path, file);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
        const { error: insErr } = await supabase.from("media").insert({
          url: pub.publicUrl,
          path,
          filename: file.name,
          mime_type: file.type,
          size: file.size,
        });
        if (insErr) throw insErr;
      }
      toast.success("Uploaded");
      qc.invalidateQueries({ queryKey: ["admin-media"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload gagal");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function remove(item: Row) {
    if (!confirm("Hapus file ini?")) return;
    await supabase.storage.from("media").remove([item.path]);
    await supabase.from("media").delete().eq("id", item.id);
    toast.success("Dihapus");
    qc.invalidateQueries({ queryKey: ["admin-media"] });
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-cigar-cream" style={{ fontFamily: "'Cirkus',serif" }}>Media Library</h1>
          <p className="text-cigar-cream/60 mt-1">Upload & kelola gambar.</p>
        </div>
        <div>
          <input ref={fileRef} type="file" multiple accept="image/*" onChange={(e) => onUpload(e.target.files)} className="hidden" />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="bg-cigar-gold text-cigar-dark hover:bg-cigar-gold/90">
            <Upload size={16} className="mr-2" /> {uploading ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-cigar-gold/20 p-12 text-center text-cigar-cream/50">Belum ada file.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((m) => (
            <div key={m.id} className="border border-cigar-gold/15 bg-cigar-dark/50 group">
              <div className="aspect-square bg-cigar-dark flex items-center justify-center overflow-hidden">
                <img src={m.url} alt={m.filename ?? ""} className="w-full h-full object-cover" />
              </div>
              <div className="p-2 text-xs text-cigar-cream/60 truncate">{m.filename}</div>
              <div className="flex border-t border-cigar-gold/10">
                <button
                  onClick={() => { navigator.clipboard.writeText(m.url); toast.success("URL copied"); }}
                  className="flex-1 py-2 text-cigar-gold/70 hover:text-cigar-gold text-xs flex items-center justify-center gap-1"
                >
                  <Copy size={12} /> Copy URL
                </button>
                <button
                  onClick={() => remove(m)}
                  className="flex-1 py-2 text-cigar-gold/70 hover:text-destructive text-xs flex items-center justify-center gap-1 border-l border-cigar-gold/10"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
