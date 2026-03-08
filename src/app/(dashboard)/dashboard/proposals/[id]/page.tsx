import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { proposals } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Send,
  FileSignature,
  Download,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { ProposalActions } from "@/components/proposals/proposal-actions";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
};

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const proposal = await db.query.proposals.findFirst({
    where: eq(proposals.id, id),
    with: {
      client: true,
      project: true,
      items: {
        orderBy: (items, { asc }) => [asc(items.sortOrder)],
      },
    },
  });

  if (!proposal || proposal.userId !== user.id) {
    notFound();
  }

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/proposals">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
        <ProposalActions proposal={proposal} />
      </div>

      {/* Proposal Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{proposal.title}</CardTitle>
              <div className="flex items-center space-x-4 mt-2">
                <Link
                  href={`/dashboard/clients/${proposal.clientId}`}
                  className="text-amber-600 hover:underline"
                >
                  {proposal.client?.name}
                </Link>
                {proposal.project && (
                  <Link
                    href={`/dashboard/projects/${proposal.projectId}`}
                    className="text-gray-500 hover:underline"
                  >
                    {proposal.project.name}
                  </Link>
                )}
              </div>
            </div>
            <Badge className={statusColors[proposal.status]}>
              {proposal.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {proposal.introduction && (
            <div className="prose max-w-none">
              <p className="text-gray-600 whitespace-pre-wrap">
                {proposal.introduction}
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="flex items-center space-x-6 mt-4 pt-4 border-t text-sm">
            <div>
              <span className="text-gray-500">Created:</span>{" "}
              {new Date(proposal.createdAt).toLocaleDateString()}
            </div>
            {proposal.sentAt && (
              <div className="flex items-center text-blue-600">
                <Send className="h-3 w-3 mr-1" />
                Sent: {new Date(proposal.sentAt).toLocaleDateString()}
              </div>
            )}
            {proposal.viewedAt && (
              <div className="flex items-center text-yellow-600">
                <Eye className="h-3 w-3 mr-1" />
                Viewed: {new Date(proposal.viewedAt).toLocaleDateString()}
              </div>
            )}
            {proposal.acceptedAt && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Accepted: {new Date(proposal.acceptedAt).toLocaleDateString()}
              </div>
            )}
            {proposal.declinedAt && (
              <div className="flex items-center text-red-600">
                <XCircle className="h-3 w-3 mr-1" />
                Declined: {new Date(proposal.declinedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Services & Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {proposal.items.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border ${
                  item.isOptional && !item.isSelected
                    ? "bg-gray-50 opacity-60"
                    : "bg-white"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{item.name}</h4>
                      {item.isOptional && (
                        <Badge variant="secondary" className="text-xs">
                          Optional
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(item.total)}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-4 border-t space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(proposal.subtotal)}</span>
            </div>
            {Number(proposal.tax) > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{formatCurrency(proposal.tax)}</span>
              </div>
            )}
            {Number(proposal.discount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(proposal.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>{formatCurrency(proposal.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expiration */}
      {proposal.expiresAt && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">This proposal expires on:</span>
              <span className="font-medium">
                {new Date(proposal.expiresAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
