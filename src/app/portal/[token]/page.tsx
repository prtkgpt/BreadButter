import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { clients, projects, invoices, contracts, proposals, smartFiles } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FolderKanban,
  Receipt,
  FileSignature,
  FileText,
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
} from "lucide-react";

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Find client by portal access token
  const client = await db.query.clients.findFirst({
    where: eq(clients.portalAccessToken, token),
    with: {
      user: true,
    },
  });

  if (!client) {
    notFound();
  }

  // Fetch client's data
  const clientProjects = await db.query.projects.findMany({
    where: eq(projects.clientId, client.id),
    orderBy: [desc(projects.createdAt)],
  });

  const clientInvoices = await db.query.invoices.findMany({
    where: eq(invoices.clientId, client.id),
    orderBy: [desc(invoices.createdAt)],
  });

  const clientContracts = await db.query.contracts.findMany({
    where: and(
      eq(contracts.clientId, client.id),
      eq(contracts.status, "sent")
    ),
    orderBy: [desc(contracts.createdAt)],
  });

  const clientProposals = await db.query.proposals.findMany({
    where: and(
      eq(proposals.clientId, client.id),
      eq(proposals.status, "sent")
    ),
    orderBy: [desc(proposals.createdAt)],
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
      paid: "success",
      partial: "warning",
      overdue: "destructive",
      signed: "success",
      accepted: "success",
      in_progress: "default",
      completed: "success",
    };
    return variants[status] || "secondary";
  };

  const pendingInvoices = clientInvoices.filter((i) =>
    ["sent", "viewed", "partial"].includes(i.status)
  );
  const totalDue = pendingInvoices.reduce(
    (sum, i) => sum + parseFloat(i.total || "0") - parseFloat(i.paidAmount || "0"),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {client.user?.logo ? (
                <img
                  src={client.user.logo}
                  alt={client.user.businessName || ""}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: client.user?.brandColor || "#f59e0b" }}
                >
                  {(client.user?.businessName || client.user?.name || "B")[0]}
                </div>
              )}
              <div>
                <h1 className="font-bold text-lg">
                  {client.user?.businessName || client.user?.name}
                </h1>
                <p className="text-sm text-gray-500">Client Portal</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">{client.name}</p>
              <p className="text-sm text-gray-500">{client.email}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <FolderKanban className="h-5 w-5" />
                <span className="text-sm font-medium">Active Projects</span>
              </div>
              <p className="text-2xl font-bold mt-2">
                {clientProjects.filter((p) => !["completed", "cancelled"].includes(p.status)).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <Receipt className="h-5 w-5" />
                <span className="text-sm font-medium">Amount Due</span>
              </div>
              <p className="text-2xl font-bold mt-2">
                {formatCurrency(totalDue.toString())}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">Pending Actions</span>
              </div>
              <p className="text-2xl font-bold mt-2">
                {clientContracts.length + clientProposals.length + pendingInvoices.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Pending Actions */}
            {(clientContracts.length > 0 || clientProposals.length > 0 || pendingInvoices.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Action Required</CardTitle>
                  <CardDescription>
                    Items that need your attention
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {clientProposals.map((proposal) => (
                    <div
                      key={proposal.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-amber-200 bg-amber-50"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-amber-600" />
                        <div>
                          <p className="font-medium">Review Proposal</p>
                          <p className="text-sm text-gray-600">{proposal.title}</p>
                        </div>
                      </div>
                      <Button size="sm">
                        View & Accept
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  ))}
                  {clientContracts.map((contract) => (
                    <div
                      key={contract.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-amber-200 bg-amber-50"
                    >
                      <div className="flex items-center space-x-3">
                        <FileSignature className="h-5 w-5 text-amber-600" />
                        <div>
                          <p className="font-medium">Sign Contract</p>
                          <p className="text-sm text-gray-600">{contract.title}</p>
                        </div>
                      </div>
                      <Button size="sm">
                        Review & Sign
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  ))}
                  {pendingInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-amber-200 bg-amber-50"
                    >
                      <div className="flex items-center space-x-3">
                        <Receipt className="h-5 w-5 text-amber-600" />
                        <div>
                          <p className="font-medium">Pay Invoice #{invoice.invoiceNumber}</p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(invoice.total)} due{" "}
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button size="sm">
                        Pay Now
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Your Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {clientProjects.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No projects yet</p>
                ) : (
                  <div className="space-y-3">
                    {clientProjects.slice(0, 5).map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">{project.name}</p>
                          {project.eventDate && (
                            <p className="text-sm text-gray-500">
                              {new Date(project.eventDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Badge variant={getStatusVariant(project.status)}>
                          {project.status.replace("_", " ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>View and pay your invoices</CardDescription>
              </CardHeader>
              <CardContent>
                {clientInvoices.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No invoices yet</p>
                ) : (
                  <div className="divide-y">
                    {clientInvoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between py-4"
                      >
                        <div>
                          <p className="font-medium">#{invoice.invoiceNumber}</p>
                          <p className="text-sm text-gray-500">
                            Issued {new Date(invoice.issueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(invoice.total)}</p>
                            <Badge variant={getStatusVariant(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            {["sent", "viewed", "partial"].includes(invoice.status) && (
                              <Button size="sm">Pay</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Contracts</CardTitle>
                <CardDescription>View and sign your contracts</CardDescription>
              </CardHeader>
              <CardContent>
                {clientContracts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No contracts pending signature
                  </p>
                ) : (
                  <div className="divide-y">
                    {clientContracts.map((contract) => (
                      <div
                        key={contract.id}
                        className="flex items-center justify-between py-4"
                      >
                        <div>
                          <p className="font-medium">{contract.title}</p>
                          <p className="text-sm text-gray-500">
                            Sent {new Date(contract.sentAt!).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant={getStatusVariant(contract.status)}>
                            {contract.status}
                          </Badge>
                          <Button size="sm">
                            {contract.signedAt ? "View" : "Review & Sign"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Track your project progress</CardDescription>
              </CardHeader>
              <CardContent>
                {clientProjects.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No projects yet</p>
                ) : (
                  <div className="divide-y">
                    {clientProjects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between py-4"
                      >
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-gray-500">
                            {project.projectType && `${project.projectType} • `}
                            {project.eventDate &&
                              new Date(project.eventDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <p className="font-medium">
                            {formatCurrency(project.totalValue)}
                          </p>
                          <Badge variant={getStatusVariant(project.status)}>
                            {project.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          Powered by BreadButter
        </div>
      </footer>
    </div>
  );
}
