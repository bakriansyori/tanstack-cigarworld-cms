import { supabase } from "@/integrations/supabase/client";

export type ContentMap = Record<string, string>;

export async function fetchPagesContent(): Promise<ContentMap> {
  const { data, error } = await supabase.from("pages_content").select("key,value");
  if (error) throw error;
  const map: ContentMap = {};
  for (const row of data ?? []) map[row.key] = row.value ?? "";
  return map;
}

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number | null;
  category: string | null;
  origin: string | null;
  strength: string | null;
  main_image: string | null;
  gallery: unknown;
  status: "draft" | "published";
  sort_order: number;
};

export async function fetchPublishedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Product | null;
}

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  content: string | null;
  status: "draft" | "published";
  published_at: string | null;
  author_id: string | null;
  created_at: string;
};

export async function fetchPublishedPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Post[];
}

export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Post | null;
}

export function getContent(map: ContentMap, key: string, fallback = ""): string {
  return map[key] ?? fallback;
}
