import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { fetchPublishedPosts } from "@/lib/cms";

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
  head: () => ({
    meta: [
      { title: "Journal — Adwaya Prana" },
      { name: "description", content: "Stories, guides and craft notes from our cigar journal." },
    ],
  }),
});

function BlogIndex() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts", "published"],
    queryFn: fetchPublishedPosts,
  });

  return (
    <SiteShell>
      <section className="pt-32 pb-12 px-6 text-center">
        <p className="text-cigar-gold tracking-[0.3em] text-xs uppercase mb-4">Journal</p>
        <h1 className="text-4xl md:text-5xl text-cigar-cream mb-4">Stories & Notes</h1>
        <div className="w-16 h-px bg-cigar-gold/40 mx-auto" />
      </section>

      <section className="px-6 pb-24">
        <div className="container mx-auto max-w-4xl">
          {isLoading ? (
            <p className="text-center text-cigar-cream/50">Loading…</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-cigar-cream/50">Belum ada artikel.</p>
          ) : (
            <div className="space-y-10">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group block border-b border-cigar-gold/10 pb-10 hover:border-cigar-gold/40 transition-all"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {post.cover_image && (
                      <div className="aspect-[4/3] overflow-hidden bg-cigar-dark/50">
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    )}
                    <div className={post.cover_image ? "md:col-span-2" : "md:col-span-3"}>
                      {post.published_at && (
                        <p className="text-cigar-gold/60 text-xs tracking-wider uppercase mb-2">
                          {new Date(post.published_at).toLocaleDateString("id-ID", { dateStyle: "long" })}
                        </p>
                      )}
                      <h2 className="text-2xl text-cigar-cream group-hover:text-cigar-gold transition-colors mb-3">
                        {post.title}
                      </h2>
                      <p className="text-cigar-cream/60 line-clamp-3">{post.excerpt}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
