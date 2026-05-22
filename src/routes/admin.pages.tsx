import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/pages")({
  component: PagesAdmin,
});

type Row = { id: string; key: string; section: string | null; label: string | null; value: string | null; field_type: string };

function PagesAdmin() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pages_content").select("*").order("section").order("key");
      if (error) throw error;
      return data as Row[];
    },
  });

  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const m: Record<string, string> = {};
    for (const r of rows) m[r.id] = r.value ?? "";
    setValues(m);
  }, [rows]);

  const save = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: string }) => {
      const { error } = await supabase.from("pages_content").update({ value }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tersimpan");
      qc.invalidateQueries({ queryKey: ["pages_content"] });
      qc.invalidateQueries({ queryKey: ["admin-pages"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal"),
  });

  const grouped = rows.reduce((acc, r) => {
    const k = r.section ?? "other";
    (acc[k] = acc[k] ?? []).push(r);
    return acc;
  }, {} as Record<string, Row[]>);

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl text-cigar-cream mb-2" style={{ fontFamily: "'Cirkus',serif" }}>Page Content</h1>
      <p className="text-cigar-cream/60 mb-8">Edit teks yang muncul di halaman publik.</p>
      <div className="space-y-8">
        {Object.entries(grouped).map(([section, items]) => (
          <div key={section} className="border border-cigar-gold/20 bg-cigar-dark/50 p-6">
            <h2 className="text-cigar-gold uppercase tracking-widest text-sm mb-4">{section}</h2>
            <div className="space-y-4">
              {items.map((r) => (
                <div key={r.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <div>
                    <p className="text-cigar-cream/80 text-sm">{r.label ?? r.key}</p>
                    <p className="text-cigar-cream/40 text-xs mt-0.5">{r.key}</p>
                  </div>
                  <div className="md:col-span-2 flex gap-2">
                    {r.field_type === "textarea" ? (
                      <Textarea value={values[r.id] ?? ""} onChange={(e) => setValues({ ...values, [r.id]: e.target.value })} rows={3} className="text-white" />
                    ) : (
                      <Input value={values[r.id] ?? ""} onChange={(e) => setValues({ ...values, [r.id]: e.target.value })} className="text-white" />
                    )}
                    <Button
                      type="button"
                      onClick={() => save.mutate({ id: r.id, value: values[r.id] ?? "" })}
                      disabled={save.isPending || values[r.id] === r.value}
                      className="bg-cigar-gold text-cigar-dark hover:bg-cigar-gold/90"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
