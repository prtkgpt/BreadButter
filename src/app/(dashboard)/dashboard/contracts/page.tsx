import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { contracts } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileSignature, MoreHorizontal, CheckCircle, Clock, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function ContractsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const contractList = await db.query.contracts.findMany({
    where: eq(contracts.userId, user.id),
    orderBy: [desc(contracts.createdAt)],
    with: {
      client: true,
      project: true,
    },
  });

  const getStatusVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
      draft: "secondary",
      sent: "warning",
      viewed: "warning",
      signed: "success",
      expired: "destructive",
      cancelled: "destructive",
    };
    return variants[status] || "secondary";
  };

  const stats = {
    draft: contractList.filter((c) => c.status === "draft").length,
    sent: contractList.filter((c) => ["sent", "viewed"].includes(c.status)).length,
    signed: contractList.filter((c) => c.status === "signed").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <p className="text-gray-500 mt-1">
            Create and manage contracts with e-signature
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/contracts/new">
            <Plus className="h-4 w-4 mr-2" />
            New Contract
          </Link>
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileSignature className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Drafts</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.draft}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium text-gray-600">Awaiting Signature</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.sent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Signed</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.signed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Contract List */}
      {contractList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileSignature className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No contracts yet</h3>
            <p className="text-gray-500 mt-1 text-center max-w-sm">
              Create your first contract to send to clients for e-signature.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/contracts/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Contract
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Contracts</CardTitle>
            <CardDescription>{contractList.length} total contracts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-100">
              {contractList.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/dashboard/contracts/${contract.id}`}
                        className="font-medium text-gray-900 hover:text-amber-600"
                      >
                        {contract.title}
                      </Link>
                      <Badge variant={getStatusVariant(contract.status)}>
                        {contract.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <Link
                        href={`/dashboard/clients/${contract.clientId}`}
                        className="text-sm text-gray-500 hover:text-amber-600"
                      >
                        {contract.client?.name}
                      </Link>
                      {contract.project && (
                        <span className="text-sm text-gray-400">
                          {contract.project.name}
                        </span>
                      )}
                      {contract.signedAt && (
                        <span className="text-sm text-green-600 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Signed {new Date(contract.signedAt).toLocaleDateString()}
                        </span>
                      )}
                      {contract.viewedAt && !contract.signedAt && (
                        <span className="text-sm text-gray-400 flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          Viewed {new Date(contract.viewedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/contracts/${contract.id}`}>
                          View Contract
                        </Link>
                      </DropdownMenuItem>
                      {contract.status === "draft" && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/contracts/${contract.id}/edit`}>
                              Edit Contract
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Send for Signature</DropdownMenuItem>
                        </>
                      )}
                      {contract.status === "signed" && (
                        <DropdownMenuItem>Download PDF</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
