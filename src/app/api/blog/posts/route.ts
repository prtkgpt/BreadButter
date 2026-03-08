import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { blogPosts, blogCategories } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";

const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  categoryId: z.string().uuid().optional().nullable(),
  coverImage: z.string().optional(),
  coverImageAlt: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  status: z.enum(["draft", "published", "scheduled", "archived"]).optional(),
  featured: z.boolean().optional(),
  publishedAt: z.string().optional(),
});

// Calculate reading time (avg 200 words per minute)
function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / 200);
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "50");

    // For public access, only show published posts
    const isPublic = searchParams.get("public") === "true";

    let conditions = [];

    if (isPublic) {
      conditions.push(eq(blogPosts.status, "published"));
    } else {
      // Admin access - check auth
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    if (status && !isPublic) {
      conditions.push(eq(blogPosts.status, status as "draft" | "published" | "scheduled" | "archived"));
    }

    if (featured === "true") {
      conditions.push(eq(blogPosts.featured, true));
    }

    const posts = await db.query.blogPosts.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(blogPosts.publishedAt), desc(blogPosts.createdAt)],
      limit,
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

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check if slug is unique
    const existingPost = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.slug, data.slug),
    });

    if (existingPost) {
      return NextResponse.json(
        { error: "A post with this slug already exists" },
        { status: 400 }
      );
    }

    const readingTime = calculateReadingTime(data.content);

    const [newPost] = await db
      .insert(blogPosts)
      .values({
        authorId: user.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        categoryId: data.categoryId || null,
        coverImage: data.coverImage,
        coverImageAlt: data.coverImageAlt,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        ogImage: data.ogImage,
        status: data.status || "draft",
        featured: data.featured || false,
        publishedAt: data.status === "published" ? new Date() : null,
        readingTimeMinutes: readingTime,
      })
      .returning();

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
