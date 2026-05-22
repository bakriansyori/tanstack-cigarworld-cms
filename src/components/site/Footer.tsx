import { Link } from "@tanstack/react-router";
import type { ContentMap } from "@/lib/cms";
import { getContent } from "@/lib/cms";

export function Footer({ content }: { content: ContentMap }) {
  const brand = getContent(content, "brand.name", "ADWAYA PRANA");
  const tagline = getContent(content, "footer.tagline");
  const copyright = getContent(content, "footer.copyright", "All rights reserved.");
  const email = getContent(content, "contact.email");
  const wa = getContent(content, "contact.whatsapp");
  const location = getContent(content, "contact.location");

  return (
    <footer className="bg-cigar-dark border-t border-cigar-gold/20">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3
              className="text-3xl md:text-4xl tracking-widest text-cigar-gold mb-4"
              style={{ fontFamily: "'Cirkus', serif" }}
            >
              {brand}
            </h3>
            <p className="text-cigar-cream/60 text-sm leading-relaxed">{tagline}</p>
          </div>
          <div>
            <h4 className="text-sm tracking-wider text-cigar-gold uppercase mb-4">Navigation</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-cigar-cream/60 hover:text-cigar-gold text-sm">Home</Link>
              <Link to="/products" className="block text-cigar-cream/60 hover:text-cigar-gold text-sm">Collection</Link>
              <Link to="/blog" className="block text-cigar-cream/60 hover:text-cigar-gold text-sm">Journal</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm tracking-wider text-cigar-gold uppercase mb-4">Contact</h4>
            <div className="space-y-2 text-cigar-cream/60 text-sm">
              {email && <a href={`mailto:${email}`} className="block hover:text-cigar-gold">{email}</a>}
              {wa && (
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:text-cigar-gold"
                >
                  WhatsApp: +{wa}
                </a>
              )}
              {location && <p>{location}</p>}
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-cigar-gold/10 text-center">
          <p className="text-cigar-cream/40 text-xs tracking-wider">
            © {new Date().getFullYear()} {brand}. {copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
