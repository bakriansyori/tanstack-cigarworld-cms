import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { adminCreateUser, adminDeleteUser } from "@/lib/admin-users.functions";
import { Trash2, UserPlus } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  component: UsersAdmin,
});

type Profile = { id: string; email: string | null; display_name: string | null };
type Role = { user_id: string; role: "admin" | "editor" };

function UsersAdmin() {
  const { isAdmin, user } = useAuth();
  const qc = useQueryClient();

  const createUserFn = useServerFn(adminCreateUser);
  const deleteUserFn = useServerFn(adminDeleteUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "editor">("editor");

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id,email,display_name");
      if (error) throw error;
      return data as Profile[];
    },
  });
  const { data: roles = [] } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("user_id,role");
      if (error) throw error;
      return data as Role[];
    },
  });

  const setRole = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: "admin" | "editor" }) => {
      await supabase.from("user_roles").delete().eq("user_id", user_id);
      const { error } = await supabase.from("user_roles").insert({ user_id, role });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role updated");
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal"),
  });

  const createUser = useMutation({
    mutationFn: () =>
      createUserFn({
        data: { email, password, display_name: displayName, role: newRole },
      }),
    onSuccess: () => {
      toast.success("User berhasil dibuat");
      setEmail("");
      setPassword("");
      setDisplayName("");
      setNewRole("editor");
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal membuat user"),
  });

  const deleteUser = useMutation({
    mutationFn: (user_id: string) => deleteUserFn({ data: { user_id } }),
    onSuccess: () => {
      toast.success("User dihapus");
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal menghapus"),
  });

  if (!isAdmin) {
    return (
      <div className="p-8">
        <h1 className="text-3xl text-cigar-cream" style={{ fontFamily: "'Cirkus',serif" }}>
          Users
        </h1>
        <p className="text-cigar-cream/60 mt-4">Hanya admin yang dapat mengelola pengguna.</p>
      </div>
    );
  }

  const rolesByUser = new Map(roles.map((r) => [r.user_id, r.role]));

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl text-cigar-cream" style={{ fontFamily: "'Cirkus',serif" }}>
          Users
        </h1>
        <p className="text-cigar-cream/60 mt-1">Buat akun baru dan atur perannya.</p>
      </div>

      {/* Create user form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!email || !password || !displayName) {
            toast.error("Lengkapi semua field");
            return;
          }
          if (password.length < 8) {
            toast.error("Password minimal 8 karakter");
            return;
          }
          createUser.mutate();
        }}
        className="border border-cigar-gold/20 bg-cigar-dark/50 p-6 space-y-4"
      >
        <h2 className="text-cigar-gold text-sm uppercase tracking-widest flex items-center gap-2">
          <UserPlus size={16} /> Create New User
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-cigar-cream/70">Display name</Label>
            <Input
              className="text-white"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nama lengkap"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-cigar-cream/70">Email</Label>
            <Input
              className="text-white"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-cigar-cream/70">Password (min 8)</Label>
            <Input
              className="text-white"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-cigar-cream/70">Role</Label>
            <Select value={newRole} onValueChange={(v) => setNewRole(v as "admin" | "editor")}>
              <SelectTrigger className="text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" disabled={createUser.isPending}>
          {createUser.isPending ? "Membuat…" : "Create user"}
        </Button>
      </form>

      {/* User list */}
      <div className="border border-cigar-gold/20 bg-cigar-dark/50">
        <table className="w-full text-sm">
          <thead className="bg-cigar-gold/10 text-cigar-cream/70 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Role</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => {
              const role = rolesByUser.get(p.id) ?? "—";
              const isSelf = p.id === user?.id;
              return (
                <tr key={p.id} className="border-t border-cigar-gold/10 text-cigar-cream/80">
                  <td className="p-3">{p.email}</td>
                  <td className="p-3">{p.display_name}</td>
                  <td className="p-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-cigar-gold/15 text-cigar-gold">
                      {role}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2 whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRole.mutate({ user_id: p.id, role: "admin" })}
                    >
                      Make admin
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRole.mutate({ user_id: p.id, role: "editor" })}
                    >
                      Make editor
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isSelf || deleteUser.isPending}
                      onClick={() => {
                        if (confirm(`Hapus user ${p.email}? Tindakan ini permanen.`)) {
                          deleteUser.mutate(p.id);
                        }
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
