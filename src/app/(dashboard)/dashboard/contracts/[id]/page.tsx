import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { contracts, clients, projects } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Download, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-purple-100 text-purple-800",
  signed: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const contract = await db.query.contracts.findFirst({
    where: eq(contracts.id, id),
  });

  if (!contract || contract.userId !== user.id) {
    notFound();
  }

  const client = await db.query.clients.findFirst({
    where: eq(clients.id, contract.clientId),
  });

  const project = contract.projectId
    ? await db.query.projects.findFirst({
        where: eq(projects.id, contract.projectId),
      })
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/contracts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contracts
            </Link>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          {contract.status === "draft" && (
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Send for Signature
            </Button>
          )}
          {contract.status === "sent" && (
            <Button variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Signed
            </Button>
          )}
        </div>
      </div>

      {/* Contract Info */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{contract.title}</CardTitle>
            <p className="text-gray-500 mt-1">
              Created: {new Date(contract.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Badge className={statusColors[contract.status] || "bg-gray-100"}>
            {contract.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client & Project Info */}
          <div className="grid grid-cols-2 gap-6 pb-6 border-b">
            <div>
              <h3 className="font-medium text-gray-500 text-sm mb-1">Client</h3>
              {client && (
                <div>
                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="font-semibold text-amber-600 hover:underline"
                  >
                    {client.name}
                  </Link>
                  <p className="text-gray-600">{client.email}</p>
                </div>
              )}
            </div>
            <div className="text-right">
              <h3 className="font-medium text-gray-500 text-sm mb-1">Details</h3>
              {contract.expiresAt && (
                <p>Expires: <span className="font-semibold">{new Date(contract.expiresAt).toLocaleDateString()}</span></p>
              )}
              {project && (
                <p>Project: <Link href={`/dashboard/projects/${project.id}`} className="text-amber-600 hover:underline">{project.name}</Link></p>
              )}
            </div>
          </div>

          {/* Signature Status */}
          {contract.status === "signed" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Contract Signed</span>
              </div>
              {contract.signedAt && (
                <p className="text-sm text-green-600 mt-1">
                  Signed on {new Date(contract.signedAt).toLocaleDateString()} at {new Date(contract.signedAt).toLocaleTimeString()}
                </p>
              )}
            </div>
          )}

          {/* Contract Content */}
          <div className="pt-4">
            <h3 className="font-medium mb-4">Contract Terms</h3>
            <div className="prose prose-sm max-w-none bg-gray-50 p-6 rounded-lg whitespace-pre-wrap font-mono text-sm">
              {contract.content}
            </div>
          </div>

          {/* Signatures */}
          {contract.status === "signed" && (
            <div className="grid grid-cols-2 gap-6 pt-6 border-t">
              <div>
                <h3 className="font-medium text-gray-500 text-sm mb-2">Client Signature</h3>
                {contract.clientSignature ? (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p className="font-script text-2xl">{contract.clientSignature}</p>
                    {contract.signedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(contract.signedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">Not signed</p>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-500 text-sm mb-2">Your Signature</h3>
                {contract.ownerSignature ? (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p className="font-script text-2xl">{contract.ownerSignature}</p>
                    {contract.ownerSignedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(contract.ownerSignedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">Not signed</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
