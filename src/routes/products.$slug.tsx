import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell, useContent } from "@/components/site/SiteShell";
import { fetchProductBySlug, getContent } from "@/lib/cms";

export const Route = createFileRoute("/products/$slug")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const c = useContent();
  const wa = getContent(c, "contact.whatsapp");
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
  });

  return (
    <SiteShell>
      <section className="pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <Link to="/products" className="text-cigar-gold/70 text-sm hover:text-cigar-gold">
            ← Back to collection
          </Link>
          {isLoading ? (
            <p className="text-cigar-cream/50 mt-12">Loading…</p>
          ) : !product ? (
            <p className="text-cigar-cream/50 mt-12">Product not found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
              <div className="aspect-square bg-cigar-dark/80 flex items-center justify-center border border-cigar-gold/10 p-8">
                {product.main_image && (
                  <img src={product.main_image} alt={product.name} className="w-full h-full object-contain" />
                )}
              </div>
              <div>
                <p className="text-cigar-gold/60 text-xs tracking-[0.3em] uppercase mb-3">
                  {product.origin}
                  {product.strength ? ` · ${product.strength}` : ""}
                </p>
                <h1 className="text-3xl md:text-4xl text-cigar-cream mb-4">{product.name}</h1>
                <div className="w-16 h-px bg-cigar-gold/40 mb-6" />
                <p className="text-cigar-cream/70 leading-relaxed mb-6">{product.description}</p>
                {product.price != null && (
                  <p className="text-cigar-gold text-2xl mb-6">
                    Rp {Number(product.price).toLocaleString("id-ID")}
                  </p>
                )}
                {wa && (
                  <a
                    href={`https://wa.me/${wa}?text=${encodeURIComponent(`Halo, saya tertarik dengan ${product.name}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block border-2 border-cigar-gold text-cigar-gold px-8 py-3 text-sm tracking-widest uppercase hover:bg-cigar-gold hover:text-cigar-dark transition-all"
                  >
                    Order via WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
