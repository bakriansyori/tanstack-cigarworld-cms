import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/admin",
    mode: s.mode === "signup" ? "signup" : "login",
  }),
});

const schema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
});

function LoginPage() {
  const { redirect, mode } = useSearch({ from: "/login" });
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Akun berhasil dibuat. Anda sekarang masuk.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Berhasil masuk.");
      }
      navigate({ to: redirect });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cigar-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md border border-cigar-gold/20 p-8 bg-cigar-dark/50">
        <Link to="/" className="text-cigar-gold/60 text-xs hover:text-cigar-gold">← Back to site</Link>
        <h1 className="text-3xl text-cigar-cream mt-6 mb-2" style={{ fontFamily: "'Cirkus',serif" }}>
          {isSignup ? "Create account" : "Sign in"}
        </h1>
        <p className="text-cigar-cream/60 text-sm mb-8">
          {isSignup ? "User pertama otomatis menjadi admin." : "Masuk ke dashboard CMS."}
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-cigar-cream/80">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-cigar-dark border-cigar-gold/20 text-cigar-cream" />
          </div>
          <div>
            <Label htmlFor="password" className="text-cigar-cream/80">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="bg-cigar-dark border-cigar-gold/20 text-cigar-cream" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-cigar-gold text-cigar-dark hover:bg-cigar-gold/90">
            {loading ? "Memproses…" : isSignup ? "Sign up" : "Sign in"}
          </Button>
        </form>
        <button
          type="button"
          onClick={() => setIsSignup(!isSignup)}
          className="mt-6 text-cigar-gold/70 text-sm hover:text-cigar-gold w-full text-center"
        >
          {isSignup ? "Sudah punya akun? Sign in" : "Belum punya akun? Sign up"}
        </button>
      </div>
    </div>
  );
}
