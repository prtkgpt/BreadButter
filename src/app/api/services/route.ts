import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { services } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, price, unit, duration } = body;

    // Get sort order
    const existingServices = await db.query.services.findMany({
      where: eq(services.userId, user.id),
    });

    const [service] = await db
      .insert(services)
      .values({
        userId: user.id,
        name,
        description,
        price: price.toString(),
        unit: unit || "flat",
        duration: duration || null,
        sortOrder: existingServices.length,
      })
      .returning();

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceList = await db.query.services.findMany({
    where: eq(services.userId, user.id),
    orderBy: [desc(services.createdAt)],
  });

  return NextResponse.json(serviceList);
}
