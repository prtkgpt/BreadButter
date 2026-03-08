import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { blogPosts, blogCategories } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Blog | BreadButter - Tips for Creative Professionals",
  description:
    "Expert insights on client management, business growth, invoicing, and productivity tips for photographers, designers, and creative professionals.",
  keywords:
    "client management, creative business, photography business, invoicing tips, freelancer productivity",
  openGraph: {
    title: "Blog | BreadButter",
    description:
      "Expert insights for creative professionals on growing their business.",
    url: "https://getbreadbutter.com/blog",
    siteName: "BreadButter",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | BreadButter",
    description:
      "Expert insights for creative professionals on growing their business.",
  },
  alternates: {
    canonical: "https://getbreadbutter.com/blog",
  },
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await db.query.blogPosts.findMany({
    where: eq(blogPosts.status, "published"),
    orderBy: [desc(blogPosts.publishedAt), desc(blogPosts.createdAt)],
    with: {
      author: {
        columns: {
          id: true,
          name: true,
        },
      },
      category: true,
    },
  });

  const featuredPosts = posts.filter((p) => p.featured);
  const regularPosts = posts.filter((p) => !p.featured);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-amber-50 to-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              BreadButter Blog
            </h1>
            <p className="text-xl text-gray-600">
              Expert insights on client management, business growth, and
              productivity tips for creative professionals.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredPosts.slice(0, 2).map((post) => (
              <article
                key={post.id}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow"
              >
                <Link href={`/blog/${post.slug}`}>
                  {post.coverImage && (
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={post.coverImage}
                        alt={post.coverImageAlt || post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {post.category && (
                      <span className="text-amber-600 text-sm font-medium">
                        {post.category.name}
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 mt-2 group-hover:text-amber-600 transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-gray-600 mt-2 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center mt-4 text-sm text-gray-500">
                      {post.author?.name && (
                        <span className="mr-4">{post.author.name}</span>
                      )}
                      {post.publishedAt && (
                        <time dateTime={post.publishedAt.toISOString()}>
                          {new Date(post.publishedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </time>
                      )}
                      {post.readingTimeMinutes && (
                        <span className="ml-4">
                          {post.readingTimeMinutes} min read
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          {featuredPosts.length > 0 ? "Latest Articles" : "All Articles"}
        </h2>
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No articles published yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <article
                key={post.id}
                className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <Link href={`/blog/${post.slug}`}>
                  {post.coverImage && (
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={post.coverImage}
                        alt={post.coverImageAlt || post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    {post.category && (
                      <span className="text-amber-600 text-xs font-medium uppercase tracking-wide">
                        {post.category.name}
                      </span>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 mt-1 group-hover:text-amber-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center mt-3 text-xs text-gray-500">
                      {post.publishedAt && (
                        <time dateTime={post.publishedAt.toISOString()}>
                          {new Date(post.publishedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </time>
                      )}
                      {post.readingTimeMinutes && (
                        <span className="ml-3">
                          {post.readingTimeMinutes} min read
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter CTA */}
      <section className="bg-amber-50 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Stay in the loop
          </h2>
          <p className="text-gray-600 mb-6">
            Get the latest tips and insights for growing your creative business
            delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button className="px-6 py-3 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Link href="/" className="text-2xl font-bold text-amber-400">
                BreadButter
              </Link>
              <p className="text-gray-400 mt-2">
                Client management for creative professionals
              </p>
            </div>
            <nav className="flex gap-6">
              <Link href="/" className="text-gray-400 hover:text-white">
                Home
              </Link>
              <Link href="/blog" className="text-gray-400 hover:text-white">
                Blog
              </Link>
              <Link href="/login" className="text-gray-400 hover:text-white">
                Login
              </Link>
              <Link href="/signup" className="text-gray-400 hover:text-white">
                Sign Up
              </Link>
            </nav>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} BreadButter. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
