import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { fetchPagesContent, getContent } from "@/lib/cms";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function SiteShell({ children }: { children: ReactNode }) {
  const { data } = useQuery({ queryKey: ["pages_content"], queryFn: fetchPagesContent });
  const content = data ?? {};
  const brand = getContent(content, "brand.name", "ADWAYA PRANA");

  return (
    <div className="bg-cigar-dark min-h-screen text-cigar-cream">
      <Navbar brandName={brand} />
      {children}
      <Footer content={content} />
    </div>
  );
}

export function useContent() {
  const { data } = useQuery({ queryKey: ["pages_content"], queryFn: fetchPagesContent });
  return data ?? {};
}
