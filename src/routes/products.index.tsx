import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell, useContent } from "@/components/site/SiteShell";
import { fetchPublishedProducts, getContent } from "@/lib/cms";

export const Route = createFileRoute("/products/")({
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "Collection — Premium Cigars" },
      { name: "description", content: "Browse our full collection of premium handcrafted cigars." },
    ],
  }),
});

function ProductsPage() {
  const c = useContent();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "published"],
    queryFn: fetchPublishedProducts,
  });
  const wa = getContent(c, "contact.whatsapp");

  return (
    <SiteShell>
      <section className="pt-32 pb-12 px-6 text-center">
        <p className="text-cigar-gold tracking-[0.3em] text-xs uppercase mb-4">Collection</p>
        <h1 className="text-4xl md:text-5xl text-cigar-cream mb-4">Our Cigars</h1>
        <div className="w-16 h-px bg-cigar-gold/40 mx-auto mb-6" />
        <p className="text-cigar-cream/60 max-w-lg mx-auto">
          Setiap cerutu adalah karya seni — pilih yang paling sesuai dengan momen Anda.
        </p>
      </section>

      <section className="px-6 pb-24">
        <div className="container mx-auto max-w-6xl">
          {isLoading ? (
            <p className="text-center text-cigar-cream/50">Loading…</p>
          ) : products.length === 0 ? (
            <p className="text-center text-cigar-cream/50">Belum ada produk.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => (
                <Link
                  key={p.id}
                  to="/products/$slug"
                  params={{ slug: p.slug }}
                  className="group border border-cigar-gold/10 hover:border-cigar-gold/30 transition-all"
                >
                  <div className="aspect-[3/4] bg-cigar-dark/80 flex items-center justify-center overflow-hidden p-4">
                    {p.main_image && (
                      <img
                        src={p.main_image}
                        alt={p.name}
                        className="w-full h-full object-contain opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-cigar-gold/60 text-xs tracking-wider uppercase">{p.origin}</p>
                      {p.strength && <span className="text-cigar-cream/40 text-xs">{p.strength}</span>}
                    </div>
                    <h3 className="text-lg text-cigar-cream mb-2">{p.name}</h3>
                    <p className="text-cigar-cream/50 text-sm mb-4 line-clamp-2">{p.description}</p>
                    <span className="text-cigar-gold text-sm">View →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {wa && (
            <div className="text-center mt-12">
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-cigar-gold/40 text-cigar-gold px-8 py-3 text-sm tracking-widest uppercase hover:bg-cigar-gold hover:text-cigar-dark transition-all"
              >
                Order via WhatsApp
              </a>
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
