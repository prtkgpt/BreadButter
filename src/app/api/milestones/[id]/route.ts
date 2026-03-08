import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { milestones, projects, escrowTransactions, invoices, invoiceItems } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const milestone = await db.query.milestones.findFirst({
    where: eq(milestones.id, id),
    with: {
      project: true,
      escrowTransactions: true,
    },
  });

  if (!milestone) {
    return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  }

  // Verify ownership through project
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, milestone.projectId),
  });

  if (!project || project.userId !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  return NextResponse.json(milestone);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const milestone = await db.query.milestones.findFirst({
    where: eq(milestones.id, id),
  });

  if (!milestone) {
    return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  }

  // Verify ownership
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, milestone.projectId),
  });

  if (!project || project.userId !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action, ...updates } = body;

    // Handle status transitions
    if (action === "submit") {
      const [updated] = await db
        .update(milestones)
        .set({
          status: "submitted",
          submittedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(milestones.id, id))
        .returning();

      return NextResponse.json(updated);
    }

    if (action === "approve") {
      const [updated] = await db
        .update(milestones)
        .set({
          status: "approved",
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(milestones.id, id))
        .returning();

      return NextResponse.json(updated);
    }

    if (action === "request_revision") {
      const [updated] = await db
        .update(milestones)
        .set({
          status: "revision_requested",
          updatedAt: new Date(),
        })
        .where(eq(milestones.id, id))
        .returning();

      return NextResponse.json(updated);
    }

    if (action === "mark_paid") {
      const [updated] = await db
        .update(milestones)
        .set({
          status: "paid",
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(milestones.id, id))
        .returning();

      // Update project paid amount
      const allMilestones = await db.query.milestones.findMany({
        where: eq(milestones.projectId, milestone.projectId),
      });
      const paidAmount = allMilestones
        .filter((m) => m.status === "paid")
        .reduce((sum, m) => sum + Number(m.amount), 0);

      await db
        .update(projects)
        .set({ paidAmount: paidAmount.toString() })
        .where(eq(projects.id, milestone.projectId));

      return NextResponse.json(updated);
    }

    if (action === "create_invoice") {
      // Create invoice for this milestone
      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;

      const [invoice] = await db
        .insert(invoices)
        .values({
          userId: user.id,
          clientId: project.clientId,
          projectId: project.id,
          invoiceNumber,
          status: "draft",
          issueDate: new Date().toISOString().split("T")[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          subtotal: milestone.amount,
          total: milestone.amount,
        })
        .returning();

      await db.insert(invoiceItems).values({
        invoiceId: invoice.id,
        description: `${milestone.name} - ${project.name}`,
        quantity: "1",
        unitPrice: milestone.amount,
        total: milestone.amount,
      });

      return NextResponse.json({ invoice });
    }

    // Regular update
    const [updated] = await db
      .update(milestones)
      .set({
        ...updates,
        amount: updates.amount?.toString(),
        updatedAt: new Date(),
      })
      .where(eq(milestones.id, id))
      .returning();

    // Recalculate project total if amount changed
    if (updates.amount) {
      const allMilestones = await db.query.milestones.findMany({
        where: eq(milestones.projectId, milestone.projectId),
      });
      const totalValue = allMilestones.reduce(
        (sum, m) => sum + Number(m.amount),
        0
      );

      await db
        .update(projects)
        .set({ totalValue: totalValue.toString() })
        .where(eq(projects.id, milestone.projectId));
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating milestone:", error);
    return NextResponse.json(
      { error: "Failed to update milestone" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const milestone = await db.query.milestones.findFirst({
    where: eq(milestones.id, id),
  });

  if (!milestone) {
    return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  }

  // Verify ownership
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, milestone.projectId),
  });

  if (!project || project.userId !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  await db.delete(milestones).where(eq(milestones.id, id));

  // Recalculate project total
  const remainingMilestones = await db.query.milestones.findMany({
    where: eq(milestones.projectId, milestone.projectId),
  });
  const totalValue = remainingMilestones.reduce(
    (sum, m) => sum + Number(m.amount),
    0
  );

  await db
    .update(projects)
    .set({ totalValue: totalValue.toString() })
    .where(eq(projects.id, milestone.projectId));

  return NextResponse.json({ success: true });
}
