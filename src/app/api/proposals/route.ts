import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { proposals, proposalItems, projects, clients } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      clientId,
      projectId,
      title,
      introduction,
      items,
      expiresAt,
      tax = 0,
      discount = 0,
    } = body;

    // Validate client belongs to user
    const client = await db.query.clients.findFirst({
      where: eq(clients.id, clientId),
    });

    if (!client || client.userId !== user.id) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: { unitPrice: number; quantity: number; isSelected?: boolean }) =>
        sum + (item.isSelected !== false ? item.unitPrice * item.quantity : 0),
      0
    );
    const taxAmount = subtotal * (tax / 100);
    const total = subtotal + taxAmount - discount;

    // Create proposal
    const [proposal] = await db
      .insert(proposals)
      .values({
        userId: user.id,
        clientId,
        projectId: projectId || null,
        title,
        introduction,
        subtotal: subtotal.toString(),
        tax: taxAmount.toString(),
        discount: discount.toString(),
        total: total.toString(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        status: "draft",
      })
      .returning();

    // Create proposal items
    if (items && items.length > 0) {
      await db.insert(proposalItems).values(
        items.map((item: {
          name: string;
          description?: string;
          quantity: number;
          unitPrice: number;
          isOptional?: boolean;
          isSelected?: boolean;
        }, index: number) => ({
          proposalId: proposal.id,
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
    }

    // Update project value if linked
    if (projectId) {
      await db
        .update(projects)
        .set({ totalValue: total.toString() })
        .where(eq(projects.id, projectId));
    }

    return NextResponse.json(proposal);
  } catch (error) {
    console.error("Error creating proposal:", error);
    return NextResponse.json(
      { error: "Failed to create proposal" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const proposalList = await db.query.proposals.findMany({
    where: eq(proposals.userId, user.id),
    with: {
      client: true,
      project: true,
      items: true,
    },
    orderBy: (proposals, { desc }) => [desc(proposals.createdAt)],
  });

  return NextResponse.json(proposalList);
}
