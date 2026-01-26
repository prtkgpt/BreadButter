import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { proposals } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, MoreHorizontal, CheckCircle, Clock, Eye, DollarSign } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function ProposalsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const proposalList = await db.query.proposals.findMany({
    where: eq(proposals.userId, user.id),
    orderBy: [desc(proposals.createdAt)],
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
      accepted: "success",
      declined: "destructive",
      expired: "destructive",
    };
    return variants[status] || "secondary";
  };

  const stats = {
    draft: proposalList.filter((p) => p.status === "draft").length,
    pending: proposalList.filter((p) => ["sent", "viewed"].includes(p.status)).length,
    accepted: proposalList.filter((p) => p.status === "accepted").length,
    totalValue: proposalList
      .filter((p) => p.status === "accepted")
      .reduce((sum, p) => sum + parseFloat(p.total || "0"), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
          <p className="text-gray-500 mt-1">
            Create and send proposals to win new business
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/proposals/new">
            <Plus className="h-4 w-4 mr-2" />
            New Proposal
          </Link>
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Drafts</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.draft}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium text-gray-600">Pending</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Accepted</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.accepted}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Won Value</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {formatCurrency(stats.totalValue.toString())}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Proposal List */}
      {proposalList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No proposals yet</h3>
            <p className="text-gray-500 mt-1 text-center max-w-sm">
              Create your first proposal to start winning new business.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/proposals/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Proposal
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Proposals</CardTitle>
            <CardDescription>{proposalList.length} total proposals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-100">
              {proposalList.map((proposal) => (
                <div
                  key={proposal.id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/dashboard/proposals/${proposal.id}`}
                        className="font-medium text-gray-900 hover:text-amber-600"
                      >
                        {proposal.title}
                      </Link>
                      <Badge variant={getStatusVariant(proposal.status)}>
                        {proposal.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <Link
                        href={`/dashboard/clients/${proposal.clientId}`}
                        className="text-sm text-gray-500 hover:text-amber-600"
                      >
                        {proposal.client?.name}
                      </Link>
                      {proposal.project && (
                        <span className="text-sm text-gray-400">
                          {proposal.project.name}
                        </span>
                      )}
                      {proposal.viewedAt && (
                        <span className="text-sm text-gray-400 flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          Viewed
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">
                      {formatCurrency(proposal.total)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/proposals/${proposal.id}`}>
                            View Proposal
                          </Link>
                        </DropdownMenuItem>
                        {proposal.status === "draft" && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/proposals/${proposal.id}/edit`}>
                                Edit Proposal
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Send Proposal</DropdownMenuItem>
                          </>
                        )}
                        {proposal.status === "accepted" && (
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/invoices/new?clientId=${proposal.clientId}`}>
                              Create Invoice
                            </Link>
                          </DropdownMenuItem>
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
