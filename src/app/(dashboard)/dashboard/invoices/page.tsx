import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { invoices } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Receipt, MoreHorizontal, Clock, CheckCircle, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function InvoicesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const invoiceList = await db.query.invoices.findMany({
    where: eq(invoices.userId, user.id),
    orderBy: [desc(invoices.createdAt)],
    with: {
      client: true,
      project: true,
    },
  });

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount));
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
      draft: "secondary",
      sent: "warning",
      viewed: "warning",
      partial: "default",
      paid: "success",
      overdue: "destructive",
      cancelled: "destructive",
    };
    return variants[status] || "secondary";
  };

  // Calculate summary stats
  const stats = {
    draft: invoiceList.filter((i) => i.status === "draft"),
    pending: invoiceList.filter((i) => ["sent", "viewed", "partial"].includes(i.status)),
    paid: invoiceList.filter((i) => i.status === "paid"),
    overdue: invoiceList.filter((i) => i.status === "overdue"),
  };

  const totalPending = stats.pending.reduce(
    (sum, i) => sum + parseFloat(i.total || "0") - parseFloat(i.paidAmount || "0"),
    0
  );
  const totalPaid = stats.paid.reduce((sum, i) => sum + parseFloat(i.total || "0"), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500 mt-1">
            Create and manage invoices for your clients
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/invoices/new">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Link>
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium text-gray-600">Pending</span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(totalPending.toString())}</p>
            <p className="text-xs text-gray-500">{stats.pending.length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Paid</span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(totalPaid.toString())}</p>
            <p className="text-xs text-gray-500">{stats.paid.length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-gray-600">Overdue</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.overdue.length}</p>
            <p className="text-xs text-gray-500">invoices overdue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Receipt className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Draft</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.draft.length}</p>
            <p className="text-xs text-gray-500">invoices in draft</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      {invoiceList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Receipt className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No invoices yet</h3>
            <p className="text-gray-500 mt-1 text-center max-w-sm">
              Create your first invoice to start getting paid for your work.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/invoices/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Invoice
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>{invoiceList.length} total invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-100">
              {invoiceList.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="font-medium text-gray-900 hover:text-amber-600"
                      >
                        #{invoice.invoiceNumber}
                      </Link>
                      <Badge variant={getStatusVariant(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <Link
                        href={`/dashboard/clients/${invoice.clientId}`}
                        className="text-sm text-gray-500 hover:text-amber-600"
                      >
                        {invoice.client?.name}
                      </Link>
                      {invoice.project && (
                        <span className="text-sm text-gray-400">
                          {invoice.project.name}
                        </span>
                      )}
                      <span className="text-sm text-gray-400">
                        Due {new Date(invoice.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(invoice.total)}</p>
                      {invoice.status === "partial" && (
                        <p className="text-xs text-gray-500">
                          Paid: {formatCurrency(invoice.paidAmount)}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/invoices/${invoice.id}`}>
                            View Invoice
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                            Edit Invoice
                          </Link>
                        </DropdownMenuItem>
                        {invoice.status === "draft" && (
                          <DropdownMenuItem>Send Invoice</DropdownMenuItem>
                        )}
                        {["sent", "viewed", "partial"].includes(invoice.status) && (
                          <DropdownMenuItem>Record Payment</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
