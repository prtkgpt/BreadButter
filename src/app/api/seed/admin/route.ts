import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

// Master admin credentials
const MASTER_ADMIN = {
  email: "bizwithpg@gmail.com",
  password: "Demo1234",
  name: "Master Admin",
  businessName: "BreadButter",
};

export async function POST(req: NextRequest) {
  try {
    // Check for secret key to prevent unauthorized seeding
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    if (secret !== "breadbutter-seed-2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if admin already exists
    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.email, MASTER_ADMIN.email),
    });

    if (existingAdmin) {
      return NextResponse.json({
        message: "Master admin already exists",
        email: existingAdmin.email,
      });
    }

    // Create master admin
    const passwordHash = await hashPassword(MASTER_ADMIN.password);

    const [admin] = await db
      .insert(users)
      .values({
        email: MASTER_ADMIN.email,
        passwordHash,
        name: MASTER_ADMIN.name,
        businessName: MASTER_ADMIN.businessName,
        emailVerified: true,
        subscriptionStatus: "active",
        subscriptionPlan: "enterprise",
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
      });

    return NextResponse.json({
      message: "Master admin created successfully",
      admin,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed admin" },
      { status: 500 }
    );
  }
}
