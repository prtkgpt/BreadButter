import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { projects, clients, invoices, contracts, proposals, milestones } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  FileSignature,
  Receipt,
  Plus,
} from "lucide-react";
import { MilestonesSection } from "@/components/projects/milestones-section";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  lead: "bg-gray-100 text-gray-800",
  inquiry: "bg-blue-100 text-blue-800",
  proposal_sent: "bg-yellow-100 text-yellow-800",
  contract_sent: "bg-purple-100 text-purple-800",
  booked: "bg-green-100 text-green-800",
  in_progress: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  if (!project || project.userId !== user.id) {
    notFound();
  }

  const client = await db.query.clients.findFirst({
    where: eq(clients.id, project.clientId),
  });

  const projectInvoices = await db.query.invoices.findMany({
    where: eq(invoices.projectId, id),
  });

  const projectContracts = await db.query.contracts.findMany({
    where: eq(contracts.projectId, id),
  });

  const projectProposals = await db.query.proposals.findMany({
    where: eq(proposals.projectId, id),
  });

  const projectMilestones = await db.query.milestones.findMany({
    where: eq(milestones.projectId, id),
    orderBy: (milestones, { asc }) => [asc(milestones.sortOrder)],
  });

  const totalValue = Number(project.totalValue) || 0;
  const paidAmount = Number(project.paidAmount) || 0;
  const remainingBalance = totalValue - paidAmount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/invoices/new?projectId=${id}&clientId=${project.clientId}`}>
              <Receipt className="h-4 w-4 mr-2" />
              Create Invoice
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/contracts/new?projectId=${id}&clientId=${project.clientId}`}>
              <FileSignature className="h-4 w-4 mr-2" />
              Create Contract
            </Link>
          </Button>
        </div>
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{project.name}</CardTitle>
                  {client && (
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="text-amber-600 hover:underline"
                    >
                      {client.name}
                    </Link>
                  )}
                </div>
                <Badge className={statusColors[project.status] || "bg-gray-100"}>
                  {project.status.replace(/_/g, " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.description && (
                <p className="text-gray-600">{project.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4">
                {project.eventDate && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(project.eventDate).toLocaleDateString()}
                  </div>
                )}
                {project.eventLocation && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {project.eventLocation}
                  </div>
                )}
                {project.projectType && (
                  <div className="flex items-center text-gray-600">
                    <FileText className="h-4 w-4 mr-2" />
                    {project.projectType}
                  </div>
                )}
              </div>

              {project.notes && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{project.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Milestones */}
          <MilestonesSection
            projectId={id}
            clientId={project.clientId}
            milestones={projectMilestones.map(m => ({
              ...m,
              dueDate: m.dueDate ? m.dueDate.toString() : null,
              submittedAt: m.submittedAt ? m.submittedAt.toISOString() : null,
              approvedAt: m.approvedAt ? m.approvedAt.toISOString() : null,
              paidAt: m.paidAt ? m.paidAt.toISOString() : null,
              deliverables: (m.deliverables as string[]) || [],
            }))}
          />

          {/* Invoices */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Receipt className="h-5 w-5 mr-2" />
                Invoices
              </CardTitle>
              <Button size="sm" asChild>
                <Link href={`/dashboard/invoices/new?projectId=${id}&clientId=${project.clientId}`}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {projectInvoices.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No invoices yet</p>
              ) : (
                <div className="space-y-2">
                  {projectInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-500">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${Number(invoice.total).toFixed(2)}</p>
                        <Badge
                          className={
                            invoice.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : invoice.status === "overdue"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contracts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <FileSignature className="h-5 w-5 mr-2" />
                Contracts
              </CardTitle>
              <Button size="sm" asChild>
                <Link href={`/dashboard/contracts/new?projectId=${id}&clientId=${project.clientId}`}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {projectContracts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No contracts yet</p>
              ) : (
                <div className="space-y-2">
                  {projectContracts.map((contract) => (
                    <div
                      key={contract.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{contract.title}</p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(contract.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        className={
                          contract.status === "signed"
                            ? "bg-green-100 text-green-800"
                            : contract.status === "sent"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {contract.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Proposals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Proposals
              </CardTitle>
              <Button size="sm" asChild>
                <Link href={`/dashboard/proposals/new?projectId=${id}&clientId=${project.clientId}`}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {projectProposals.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No proposals yet</p>
              ) : (
                <div className="space-y-2">
                  {projectProposals.map((proposal) => (
                    <div
                      key={proposal.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{proposal.title}</p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(proposal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${Number(proposal.total).toFixed(2)}</p>
                        <Badge
                          className={
                            proposal.status === "accepted"
                              ? "bg-green-100 text-green-800"
                              : proposal.status === "sent"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {proposal.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Financials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Value</span>
                <span className="font-semibold">${totalValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paid</span>
                <span className="font-semibold text-green-600">
                  ${paidAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600">Remaining</span>
                <span className="font-semibold text-amber-600">
                  ${remainingBalance.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {client && (
            <Card>
              <CardHeader>
                <CardTitle>Client</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/dashboard/clients/${client.id}`}
                  className="block hover:bg-gray-50 -m-2 p-2 rounded-lg"
                >
                  <p className="font-medium">{client.name}</p>
                  <p className="text-sm text-gray-500">{client.email}</p>
                  {client.phone && (
                    <p className="text-sm text-gray-500">{client.phone}</p>
                  )}
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
