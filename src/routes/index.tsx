import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, Flame, Leaf, Star } from "lucide-react";
import { SiteShell, useContent } from "@/components/site/SiteShell";
import { fetchPublishedProducts, getContent } from "@/lib/cms";
import logoPilar from "@/assets/logo-pilar.png";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const c = useContent();
  const { data: products = [] } = useQuery({
    queryKey: ["products", "published"],
    queryFn: fetchPublishedProducts,
  });
  const featured = products.slice(0, 3);
  const wa = getContent(c, "contact.whatsapp", "6281287098907");

  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative flex items-center justify-center min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cigar-dark via-cigar-dark/95 to-cigar-dark" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cigar-gold/30 to-transparent" />
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <img src={logoPilar} alt="Logo" className="w-32 md:w-40 h-auto mx-auto mb-8" />
          <p className="text-cigar-gold/80 tracking-[0.3em] text-xs uppercase mb-6">
            {getContent(c, "hero.label")}
          </p>
          <h1 className="text-5xl md:text-7xl text-cigar-cream leading-tight mb-6">
            {getContent(c, "hero.title1")}{" "}
            <span className="text-cigar-gold italic">{getContent(c, "hero.title2")}</span>
          </h1>
          <p className="text-cigar-cream/60 text-lg md:text-xl leading-relaxed mb-10 max-w-xl mx-auto">
            {getContent(c, "hero.subtitle")}
          </p>
          <Link
            to="/products"
            className="inline-block border-2 border-cigar-gold text-cigar-gold px-10 py-4 text-sm tracking-widest uppercase hover:bg-cigar-gold hover:text-cigar-dark transition-all duration-300"
          >
            {getContent(c, "hero.cta", "Explore Collection")}
          </Link>
        </div>
      </section>

      {/* About */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-cigar-gold tracking-[0.3em] text-xs uppercase mb-4">
            {getContent(c, "about.label")}
          </p>
          <h2 className="text-3xl md:text-4xl text-cigar-cream mb-8">
            {getContent(c, "about.title")}
          </h2>
          <div className="w-16 h-px bg-cigar-gold/40 mx-auto mb-8" />
          <p className="text-cigar-cream/60 text-lg leading-relaxed">
            {getContent(c, "about.desc")}
          </p>
        </div>
      </section>

      {/* Why */}
      <section className="py-24 px-6 bg-cigar-dark/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-cigar-gold tracking-[0.3em] text-xs uppercase mb-4">
              {getContent(c, "why.label")}
            </p>
            <h2 className="text-3xl md:text-4xl text-cigar-cream">
              {getContent(c, "why.title")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { Icon: Award, t: "why.q1.title", d: "why.q1.desc" },
              { Icon: Flame, t: "why.q2.title", d: "why.q2.desc" },
              { Icon: Leaf, t: "why.q3.title", d: "why.q3.desc" },
              { Icon: Star, t: "why.q4.title", d: "why.q4.desc" },
            ].map((item) => (
              <div
                key={item.t}
                className="text-center p-6 border border-cigar-gold/10 hover:border-cigar-gold/30 transition-colors"
              >
                <item.Icon className="w-8 h-8 text-cigar-gold mx-auto mb-4" />
                <h3 className="text-lg text-cigar-cream mb-2">{getContent(c, item.t)}</h3>
                <p className="text-cigar-cream/50 text-sm">{getContent(c, item.d)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-cigar-gold tracking-[0.3em] text-xs uppercase mb-4">
              {getContent(c, "featured.label")}
            </p>
            <h2 className="text-3xl md:text-4xl text-cigar-cream">
              {getContent(c, "featured.title")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((p) => (
              <Link
                key={p.id}
                to="/products/$slug"
                params={{ slug: p.slug }}
                className="group border border-cigar-gold/10 hover:border-cigar-gold/30 transition-all"
              >
                <div className="aspect-[4/3] bg-cigar-dark/80 flex items-center justify-center overflow-hidden">
                  {p.main_image && (
                    <img
                      src={p.main_image}
                      alt={p.name}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                </div>
                <div className="p-6">
                  <p className="text-cigar-gold/60 text-xs tracking-wider uppercase mb-1">
                    {p.origin}
                  </p>
                  <h3 className="text-xl text-cigar-cream mb-2">{p.name}</h3>
                  <p className="text-cigar-cream/50 text-sm mb-4 line-clamp-2">{p.description}</p>
                  <span className="text-cigar-gold text-sm">View detail →</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-block border border-cigar-gold/40 text-cigar-gold px-8 py-3 text-sm tracking-widest uppercase hover:bg-cigar-gold hover:text-cigar-dark transition-all"
            >
              {getContent(c, "featured.cta", "View Full Collection")}
            </Link>
          </div>
          {wa && (
            <div className="text-center mt-6">
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cigar-gold/70 text-sm hover:text-cigar-gold"
              >
                {getContent(c, "featured.contact", "Contact via WhatsApp →")}
              </a>
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
