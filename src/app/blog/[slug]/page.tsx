import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/schema";
import { eq, and, desc, ne } from "drizzle-orm";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const post = await db.query.blogPosts.findFirst({
    where: and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")),
  });

  if (!post) {
    return {
      title: "Post Not Found | BreadButter",
    };
  }

  const title = post.metaTitle || post.title;
  const description =
    post.metaDescription || post.excerpt || `Read ${post.title} on BreadButter`;
  const ogImage = post.ogImage || post.coverImage;

  return {
    title: `${title} | BreadButter Blog`,
    description,
    keywords: post.metaKeywords || undefined,
    authors: [{ name: "BreadButter Team" }],
    openGraph: {
      title: post.ogTitle || title,
      description: post.ogDescription || description,
      url: `https://getbreadbutter.com/blog/${post.slug}`,
      siteName: "BreadButter",
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: post.coverImageAlt || post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.ogTitle || title,
      description: post.ogDescription || description,
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: {
      canonical: `https://getbreadbutter.com/blog/${post.slug}`,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const post = await db.query.blogPosts.findFirst({
    where: and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")),
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

  if (!post) {
    notFound();
  }

  // Get related posts
  const relatedPosts = await db.query.blogPosts.findMany({
    where: and(
      eq(blogPosts.status, "published"),
      ne(blogPosts.id, post.id),
      post.categoryId ? eq(blogPosts.categoryId, post.categoryId) : undefined
    ),
    orderBy: [desc(blogPosts.publishedAt)],
    limit: 3,
  });

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.metaDescription,
    image: post.coverImage,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    author: {
      "@type": "Person",
      name: post.author?.name || "BreadButter Team",
    },
    publisher: {
      "@type": "Organization",
      name: "BreadButter",
      logo: {
        "@type": "ImageObject",
        url: "https://getbreadbutter.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://getbreadbutter.com/blog/${post.slug}`,
    },
    wordCount: post.content.trim().split(/\s+/).length,
    articleSection: post.category?.name,
  };

  return (
    <>
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-white">
        {/* Navigation */}
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link
                href="/"
                className="text-2xl font-bold text-amber-500 hover:text-amber-600"
              >
                BreadButter
              </Link>
              <nav className="flex items-center gap-6">
                <Link
                  href="/blog"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Blog
                </Link>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Get Started
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Article Header */}
        <article>
          <header className="py-12 lg:py-16 bg-gradient-to-b from-amber-50 to-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Breadcrumb */}
              <nav className="mb-6" aria-label="Breadcrumb">
                <ol className="flex items-center text-sm text-gray-500">
                  <li>
                    <Link href="/" className="hover:text-amber-600">
                      Home
                    </Link>
                  </li>
                  <li className="mx-2">/</li>
                  <li>
                    <Link href="/blog" className="hover:text-amber-600">
                      Blog
                    </Link>
                  </li>
                  {post.category && (
                    <>
                      <li className="mx-2">/</li>
                      <li>
                        <span className="text-amber-600">
                          {post.category.name}
                        </span>
                      </li>
                    </>
                  )}
                </ol>
              </nav>

              {post.category && (
                <span className="inline-block text-amber-600 text-sm font-medium mb-3">
                  {post.category.name}
                </span>
              )}

              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="mt-4 text-xl text-gray-600">{post.excerpt}</p>
              )}

              <div className="flex items-center mt-6 text-gray-500">
                {post.author?.name && (
                  <span className="font-medium text-gray-900 mr-4">
                    {post.author.name}
                  </span>
                )}
                {post.publishedAt && (
                  <time dateTime={post.publishedAt.toISOString()}>
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                )}
                {post.readingTimeMinutes && (
                  <span className="ml-4">{post.readingTimeMinutes} min read</span>
                )}
              </div>
            </div>
          </header>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="aspect-video relative rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={post.coverImage}
                  alt={post.coverImageAlt || post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          {/* Article Content */}
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="prose prose-lg prose-amber max-w-none prose-headings:font-bold prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Tags/Keywords */}
            {post.metaKeywords && (
              <div className="mt-8 pt-8 border-t">
                <div className="flex flex-wrap gap-2">
                  {post.metaKeywords.split(",").map((keyword, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                    >
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="mt-8 pt-8 border-t">
              <p className="text-gray-900 font-medium mb-3">Share this article</p>
              <div className="flex gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?url=https://getbreadbutter.com/blog/${post.slug}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Twitter
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=https://getbreadbutter.com/blog/${post.slug}&title=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  LinkedIn
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=https://getbreadbutter.com/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((related) => (
                  <article
                    key={related.id}
                    className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Link href={`/blog/${related.slug}`}>
                      {related.coverImage && (
                        <div className="aspect-video relative overflow-hidden">
                          <Image
                            src={related.coverImage}
                            alt={related.coverImageAlt || related.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-amber-600 transition-colors">
                          {related.title}
                        </h3>
                        {related.publishedAt && (
                          <p className="text-sm text-gray-500 mt-2">
                            {new Date(related.publishedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        )}
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-amber-500 py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to streamline your business?
            </h2>
            <p className="text-amber-100 text-lg mb-8">
              Join thousands of creative professionals using BreadButter to
              manage clients, contracts, and invoices.
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-white text-amber-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get Started Free
            </Link>
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
    </>
  );
}
