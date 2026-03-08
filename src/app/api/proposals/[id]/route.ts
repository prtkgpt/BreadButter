import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { proposals, proposalItems, contracts, projects } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const proposal = await db.query.proposals.findFirst({
    where: eq(proposals.id, id),
    with: {
      client: true,
      project: true,
      items: {
        orderBy: (items, { asc }) => [asc(items.sortOrder)],
      },
    },
  });

  if (!proposal || proposal.userId !== user.id) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  return NextResponse.json(proposal);
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

  const proposal = await db.query.proposals.findFirst({
    where: eq(proposals.id, id),
  });

  if (!proposal || proposal.userId !== user.id) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { action, items, ...updates } = body;

    // Handle special actions
    if (action === "send") {
      const [updated] = await db
        .update(proposals)
        .set({
          status: "sent",
          sentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(proposals.id, id))
        .returning();

      // Update project status if linked
      if (updated.projectId) {
        await db
          .update(projects)
          .set({ status: "proposal_sent" })
          .where(eq(projects.id, updated.projectId));
      }

      return NextResponse.json(updated);
    }

    if (action === "accept") {
      const [updated] = await db
        .update(proposals)
        .set({
          status: "accepted",
          acceptedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(proposals.id, id))
        .returning();

      // Update project status
      if (updated.projectId) {
        await db
          .update(projects)
          .set({ status: "booked" })
          .where(eq(projects.id, updated.projectId));
      }

      return NextResponse.json(updated);
    }

    if (action === "decline") {
      const [updated] = await db
        .update(proposals)
        .set({
          status: "declined",
          declinedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(proposals.id, id))
        .returning();

      return NextResponse.json(updated);
    }

    if (action === "convert_to_contract") {
      // Create contract from proposal
      const proposalData = await db.query.proposals.findFirst({
        where: eq(proposals.id, id),
        with: { items: true },
      });

      if (!proposalData) {
        return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
      }

      // Generate contract content from proposal
      const itemsList = proposalData.items
        .map((item) => `- ${item.name}: $${Number(item.total).toFixed(2)}`)
        .join("\n");

      const contractContent = `
# Service Agreement

This agreement is entered into between the service provider and ${proposalData.clientId}.

## Services

The following services will be provided:

${itemsList}

## Total Amount

Total: $${Number(proposalData.total).toFixed(2)}

## Terms & Conditions

1. Payment is due upon completion of services unless otherwise agreed.
2. This contract is valid for 30 days from the date of signing.
3. Both parties agree to communicate in good faith.

## Signatures

By signing below, both parties agree to the terms outlined in this contract.
      `.trim();

      const [contract] = await db
        .insert(contracts)
        .values({
          userId: user.id,
          clientId: proposalData.clientId,
          projectId: proposalData.projectId,
          title: `Contract for ${proposalData.title}`,
          content: contractContent,
          status: "draft",
        })
        .returning();

      return NextResponse.json({ contract });
    }

    // Regular update
    if (items) {
      // Delete existing items and recreate
      await db.delete(proposalItems).where(eq(proposalItems.proposalId, id));

      const subtotal = items.reduce(
        (sum: number, item: { unitPrice: number; quantity: number; isSelected?: boolean }) =>
          sum + (item.isSelected !== false ? item.unitPrice * item.quantity : 0),
        0
      );
      const taxAmount = subtotal * (Number(updates.taxRate || 0) / 100);
      const total = subtotal + taxAmount - Number(updates.discount || 0);

      await db.insert(proposalItems).values(
        items.map((item: {
          name: string;
          description?: string;
          quantity: number;
          unitPrice: number;
          isOptional?: boolean;
          isSelected?: boolean;
        }, index: number) => ({
          proposalId: id,
          name: item.name,
          description: item.description || null,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          total: (item.unitPrice * item.quantity).toString(),
          isOptional: item.isOptional || false,
          isSelected: item.isSelected !== false,
          sortOrder: index,
        }))
      );

      updates.subtotal = subtotal.toString();
      updates.tax = taxAmount.toString();
      updates.total = total.toString();
    }

    const [updated] = await db
      .update(proposals)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(proposals.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating proposal:", error);
    return NextResponse.json(
      { error: "Failed to update proposal" },
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

  const proposal = await db.query.proposals.findFirst({
    where: eq(proposals.id, id),
  });

  if (!proposal || proposal.userId !== user.id) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  await db.delete(proposals).where(eq(proposals.id, id));

  return NextResponse.json({ success: true });
}
