import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  clientId: z.string().uuid("Invalid client ID"),
  description: z.string().optional(),
  projectType: z.string().optional(),
  eventDate: z.string().optional(),
  eventLocation: z.string().optional(),
  totalValue: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum([
    "lead",
    "inquiry",
    "proposal_sent",
    "contract_sent",
    "booked",
    "in_progress",
    "completed",
    "cancelled",
  ]).optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectList = await db.query.projects.findMany({
      where: eq(projects.userId, user.id),
      orderBy: (projects, { desc }) => [desc(projects.createdAt)],
      with: {
        client: true,
      },
    });

    return NextResponse.json(projectList);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
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
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const [newProject] = await db
      .insert(projects)
      .values({
        userId: user.id,
        ...parsed.data,
        tags: parsed.data.tags || [],
        status: parsed.data.status || "lead",
      })
      .returning();

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
