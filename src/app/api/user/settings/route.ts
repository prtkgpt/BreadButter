import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    name: user.name,
    email: user.email,
    businessName: user.businessName,
    businessType: user.businessType,
    phone: user.phone,
    website: user.website,
    brandColor: user.brandColor,
    timezone: user.timezone,
    currency: user.currency,
  });
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      businessName,
      businessType,
      phone,
      website,
      brandColor,
      timezone,
      currency,
    } = body;

    const [updated] = await db
      .update(users)
      .set({
        name,
        businessName,
        businessType,
        phone,
        website,
        brandColor,
        timezone,
        currency,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
