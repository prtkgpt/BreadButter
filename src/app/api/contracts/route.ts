import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { contracts } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createContractSchema = z.object({
  clientId: z.string().uuid("Invalid client ID"),
  projectId: z.string().uuid().optional().nullable(),
  templateId: z.string().uuid().optional().nullable(),
  title: z.string().min(2, "Title must be at least 2 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  expiresAt: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contractList = await db.query.contracts.findMany({
      where: eq(contracts.userId, user.id),
      orderBy: (contracts, { desc }) => [desc(contracts.createdAt)],
      with: {
        client: true,
        project: true,
      },
    });

    return NextResponse.json(contractList);
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
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
    const parsed = createContractSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const [newContract] = await db
      .insert(contracts)
      .values({
        userId: user.id,
        clientId: parsed.data.clientId,
        projectId: parsed.data.projectId || null,
        templateId: parsed.data.templateId || null,
        title: parsed.data.title,
        content: parsed.data.content,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
        status: "draft",
      })
      .returning();

    return NextResponse.json(newContract, { status: 201 });
  } catch (error) {
    console.error("Error creating contract:", error);
    return NextResponse.json(
      { error: "Failed to create contract" },
      { status: 500 }
    );
  }
}
