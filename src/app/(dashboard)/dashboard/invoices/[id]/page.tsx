import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { invoices, clients, invoiceItems, projects } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Download, DollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-purple-100 text-purple-800",
  partial: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, id),
  });

  if (!invoice || invoice.userId !== user.id) {
    notFound();
  }

  const client = await db.query.clients.findFirst({
    where: eq(clients.id, invoice.clientId),
  });

  const items = await db.query.invoiceItems.findMany({
    where: eq(invoiceItems.invoiceId, id),
  });

  const project = invoice.projectId
    ? await db.query.projects.findFirst({
        where: eq(projects.id, invoice.projectId),
      })
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/invoices">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Link>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          {invoice.status === "draft" && (
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Send Invoice
            </Button>
          )}
          {invoice.status !== "paid" && invoice.status !== "draft" && (
            <Button>
              <DollarSign className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* Invoice */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-2xl">Invoice {invoice.invoiceNumber}</CardTitle>
            <p className="text-gray-500 mt-1">
              Issued: {new Date(invoice.issueDate).toLocaleDateString()}
            </p>
          </div>
          <Badge className={statusColors[invoice.status] || "bg-gray-100"}>
            {invoice.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client & Project Info */}
          <div className="grid grid-cols-2 gap-6 pb-6 border-b">
            <div>
              <h3 className="font-medium text-gray-500 text-sm mb-1">Bill To</h3>
              {client && (
                <div>
                  <p className="font-semibold">{client.name}</p>
                  <p className="text-gray-600">{client.email}</p>
                  {client.address && <p className="text-gray-600">{client.address}</p>}
                </div>
              )}
            </div>
            <div className="text-right">
              <h3 className="font-medium text-gray-500 text-sm mb-1">Details</h3>
              <p>Due Date: <span className="font-semibold">{new Date(invoice.dueDate).toLocaleDateString()}</span></p>
              {project && (
                <p>Project: <Link href={`/dashboard/projects/${project.id}`} className="text-amber-600 hover:underline">{project.name}</Link></p>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div>
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-gray-500 text-sm">
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium text-right">Qty</th>
                  <th className="pb-2 font-medium text-right">Price</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3">{item.description}</td>
                    <td className="py-3 text-right">{Number(item.quantity)}</td>
                    <td className="py-3 text-right">${Number(item.unitPrice).toFixed(2)}</td>
                    <td className="py-3 text-right font-medium">${Number(item.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${Number(invoice.subtotal).toFixed(2)}</span>
              </div>
              {Number(invoice.tax) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax ({Number(invoice.taxRate)}%)</span>
                  <span>${Number(invoice.tax).toFixed(2)}</span>
                </div>
              )}
              {Number(invoice.discount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-red-600">-${Number(invoice.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t font-semibold text-lg">
                <span>Total</span>
                <span>${Number(invoice.total).toFixed(2)}</span>
              </div>
              {Number(invoice.paidAmount) > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Paid</span>
                    <span>-${Number(invoice.paidAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Balance Due</span>
                    <span>${(Number(invoice.total) - Number(invoice.paidAmount)).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Notes</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {/* Terms */}
          {invoice.terms && (
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Terms & Conditions</h3>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{invoice.terms}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
