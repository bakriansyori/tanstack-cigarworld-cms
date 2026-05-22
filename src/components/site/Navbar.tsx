import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import logoPilar from "@/assets/logo-pilar.png";

export function Navbar({ brandName = "ADWAYA PRANA" }: { brandName?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Collection" },
    { to: "/blog", label: "Journal" },
  ] as const;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHome ? "bg-cigar-dark/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="flex items-center gap-3 text-2xl md:text-3xl tracking-widest text-cigar-gold"
          style={{ fontFamily: "'Cirkus', serif" }}
        >
          <img src={logoPilar} alt="" className="h-8 w-8 object-contain" />
          {brandName}
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm tracking-wider text-cigar-cream/80 hover:text-cigar-gold transition-colors uppercase"
              activeProps={{ className: "text-cigar-gold" }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <button
          className="md:hidden text-cigar-gold"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-cigar-dark/95 backdrop-blur-md border-t border-cigar-gold/20 px-6 pb-6 space-y-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block text-sm tracking-wider text-cigar-cream/80 hover:text-cigar-gold uppercase"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
