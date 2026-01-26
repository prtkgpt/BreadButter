import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { invoices, invoiceItems } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.string().or(z.number()),
  unitPrice: z.string().or(z.number()),
  serviceId: z.string().uuid().optional(),
});

const createInvoiceSchema = z.object({
  clientId: z.string().uuid("Invalid client ID"),
  projectId: z.string().uuid().optional().nullable(),
  issueDate: z.string(),
  dueDate: z.string(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  notes: z.string().optional(),
  terms: z.string().optional(),
  taxRate: z.string().or(z.number()).optional(),
  discount: z.string().or(z.number()).optional(),
});

async function generateInvoiceNumber(userId: string): Promise<string> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(invoices)
    .where(eq(invoices.userId, userId));

  const count = result[0]?.count || 0;
  const nextNumber = Number(count) + 1;
  return `INV-${String(nextNumber).padStart(4, "0")}`;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoiceList = await db.query.invoices.findMany({
      where: eq(invoices.userId, user.id),
      orderBy: (invoices, { desc }) => [desc(invoices.createdAt)],
      with: {
        client: true,
        project: true,
        items: true,
      },
    });

    return NextResponse.json(invoiceList);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
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
    const parsed = createInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { items, taxRate, discount, ...invoiceData } = parsed.data;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
      const qty = parseFloat(String(item.quantity)) || 1;
      const price = parseFloat(String(item.unitPrice)) || 0;
      return sum + qty * price;
    }, 0);

    const taxRateNum = parseFloat(String(taxRate)) || 0;
    const discountNum = parseFloat(String(discount)) || 0;
    const tax = subtotal * (taxRateNum / 100);
    const total = subtotal + tax - discountNum;

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(user.id);

    // Create invoice
    const [newInvoice] = await db
      .insert(invoices)
      .values({
        userId: user.id,
        clientId: invoiceData.clientId,
        projectId: invoiceData.projectId || null,
        invoiceNumber,
        issueDate: invoiceData.issueDate,
        dueDate: invoiceData.dueDate,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        taxRate: taxRateNum.toFixed(2),
        discount: discountNum.toFixed(2),
        total: total.toFixed(2),
        notes: invoiceData.notes,
        terms: invoiceData.terms,
        status: "draft",
      })
      .returning();

    // Create invoice items
    if (items.length > 0) {
      await db.insert(invoiceItems).values(
        items.map((item, index) => ({
          invoiceId: newInvoice.id,
          description: item.description,
          quantity: String(item.quantity),
          unitPrice: String(item.unitPrice),
          total: (
            (parseFloat(String(item.quantity)) || 1) *
            (parseFloat(String(item.unitPrice)) || 0)
          ).toFixed(2),
          serviceId: item.serviceId || null,
          sortOrder: index,
        }))
      );
    }

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
