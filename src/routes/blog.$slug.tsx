import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { fetchPostBySlug } from "@/lib/cms";

export const Route = createFileRoute("/blog/$slug")({
  component: PostPage,
});

function PostPage() {
  const { slug } = Route.useParams();
  const { data: post, isLoading } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPostBySlug(slug),
  });

  return (
    <SiteShell>
      <article className="pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-3xl">
          <Link to="/blog" className="text-cigar-gold/70 text-sm hover:text-cigar-gold">
            ← Back to journal
          </Link>
          {isLoading ? (
            <p className="text-cigar-cream/50 mt-12">Loading…</p>
          ) : !post ? (
            <p className="text-cigar-cream/50 mt-12">Article not found.</p>
          ) : (
            <>
              {post.published_at && (
                <p className="text-cigar-gold/60 text-xs tracking-[0.3em] uppercase mt-12 mb-3">
                  {new Date(post.published_at).toLocaleDateString("id-ID", { dateStyle: "long" })}
                </p>
              )}
              <h1 className="text-4xl md:text-5xl text-cigar-cream mb-6 leading-tight">{post.title}</h1>
              <div className="w-16 h-px bg-cigar-gold/40 mb-8" />
              {post.cover_image && (
                <img src={post.cover_image} alt={post.title} className="w-full h-auto mb-10" />
              )}
              <div
                className="prose prose-invert max-w-none text-cigar-cream/80 leading-relaxed [&_h2]:text-cigar-cream [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-2xl [&_h3]:text-cigar-cream [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl [&_a]:text-cigar-gold [&_strong]:text-cigar-cream [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_blockquote]:border-l-2 [&_blockquote]:border-cigar-gold [&_blockquote]:pl-4 [&_blockquote]:italic"
                dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
              />
            </>
          )}
        </div>
      </article>
    </SiteShell>
  );
}
