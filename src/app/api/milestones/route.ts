import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { milestones, projects } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { projectId, name, description, amount, dueDate, deliverables } = body;

    // Verify project belongs to user
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    if (!project || project.userId !== user.id) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get existing milestones count for sort order
    const existingMilestones = await db.query.milestones.findMany({
      where: eq(milestones.projectId, projectId),
    });

    const [milestone] = await db
      .insert(milestones)
      .values({
        projectId,
        name,
        description,
        amount: amount.toString(),
        dueDate: dueDate || null,
        deliverables: deliverables || [],
        sortOrder: existingMilestones.length,
        status: "pending",
      })
      .returning();

    // Update project total value
    const allMilestones = await db.query.milestones.findMany({
      where: eq(milestones.projectId, projectId),
    });
    const totalValue = allMilestones.reduce(
      (sum, m) => sum + Number(m.amount),
      0
    );

    await db
      .update(projects)
      .set({ totalValue: totalValue.toString() })
      .where(eq(projects.id, projectId));

    return NextResponse.json(milestone);
  } catch (error) {
    console.error("Error creating milestone:", error);
    return NextResponse.json(
      { error: "Failed to create milestone" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  // Verify project belongs to user
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project || project.userId !== user.id) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const milestoneList = await db.query.milestones.findMany({
    where: eq(milestones.projectId, projectId),
    orderBy: (milestones, { asc }) => [asc(milestones.sortOrder)],
  });

  return NextResponse.json(milestoneList);
}
