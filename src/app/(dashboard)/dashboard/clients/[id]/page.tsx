import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { clients, projects, invoices, contracts, proposals } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building,
  Edit,
  FileText,
  Receipt,
  FileSignature,
  FolderKanban,
  Plus,
} from "lucide-react";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const client = await db.query.clients.findFirst({
    where: and(eq(clients.id, id), eq(clients.userId, user.id)),
  });

  if (!client) {
    notFound();
  }

  // Fetch related data
  const clientProjects = await db.query.projects.findMany({
    where: and(eq(projects.clientId, id), eq(projects.userId, user.id)),
    orderBy: [desc(projects.createdAt)],
    limit: 5,
  });

  const clientInvoices = await db.query.invoices.findMany({
    where: and(eq(invoices.clientId, id), eq(invoices.userId, user.id)),
    orderBy: [desc(invoices.createdAt)],
    limit: 5,
  });

  const clientContracts = await db.query.contracts.findMany({
    where: and(eq(contracts.clientId, id), eq(contracts.userId, user.id)),
    orderBy: [desc(contracts.createdAt)],
    limit: 5,
  });

  const clientProposals = await db.query.proposals.findMany({
    where: and(eq(proposals.clientId, id), eq(proposals.userId, user.id)),
    orderBy: [desc(proposals.createdAt)],
    limit: 5,
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount));
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
      lead: "secondary",
      inquiry: "secondary",
      proposal_sent: "warning",
      contract_sent: "warning",
      booked: "success",
      in_progress: "default",
      completed: "success",
      cancelled: "destructive",
      draft: "secondary",
      sent: "warning",
      viewed: "warning",
      paid: "success",
      partial: "warning",
      overdue: "destructive",
      signed: "success",
      accepted: "success",
      declined: "destructive",
      expired: "destructive",
    };
    return variants[status] || "secondary";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl">
              {getInitials(client.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            {client.company && (
              <p className="text-gray-500">{client.company}</p>
            )}
            {client.tags && (client.tags as string[]).length > 0 && (
              <div className="flex gap-1 mt-2">
                {(client.tags as string[]).map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/clients/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/projects/new?clientId=${id}`}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <a
                href={`mailto:${client.email}`}
                className="text-sm text-amber-600 hover:underline"
              >
                {client.email}
              </a>
            </div>
            {client.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <a
                  href={`tel:${client.phone}`}
                  className="text-sm text-gray-700"
                >
                  {client.phone}
                </a>
              </div>
            )}
            {client.company && (
              <div className="flex items-center space-x-3">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">{client.company}</span>
              </div>
            )}
            {(client.address || client.city) && (
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="text-sm text-gray-700">
                  {client.address && <p>{client.address}</p>}
                  {(client.city || client.state || client.zipCode) && (
                    <p>
                      {[client.city, client.state, client.zipCode]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  {client.country && <p>{client.country}</p>}
                </div>
              </div>
            )}

            {client.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
                <p className="text-sm text-gray-600">{client.notes}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-400">
                Client since{" "}
                {new Date(client.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="projects">
            <TabsList>
              <TabsTrigger value="projects">
                <FolderKanban className="h-4 w-4 mr-2" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="invoices">
                <Receipt className="h-4 w-4 mr-2" />
                Invoices
              </TabsTrigger>
              <TabsTrigger value="contracts">
                <FileSignature className="h-4 w-4 mr-2" />
                Contracts
              </TabsTrigger>
              <TabsTrigger value="proposals">
                <FileText className="h-4 w-4 mr-2" />
                Proposals
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Projects</CardTitle>
                    <CardDescription>
                      {clientProjects.length} projects with this client
                    </CardDescription>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/projects/new?clientId=${id}`}>
                      <Plus className="h-4 w-4 mr-1" />
                      New
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {clientProjects.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No projects yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {clientProjects.map((project) => (
                        <Link
                          key={project.id}
                          href={`/dashboard/projects/${project.id}`}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                        >
                          <div>
                            <p className="font-medium">{project.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatCurrency(project.totalValue)}
                            </p>
                          </div>
                          <Badge variant={getStatusVariant(project.status)}>
                            {project.status.replace("_", " ")}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Invoices</CardTitle>
                    <CardDescription>
                      {clientInvoices.length} invoices for this client
                    </CardDescription>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/invoices/new?clientId=${id}`}>
                      <Plus className="h-4 w-4 mr-1" />
                      New
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {clientInvoices.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No invoices yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {clientInvoices.map((invoice) => (
                        <Link
                          key={invoice.id}
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                        >
                          <div>
                            <p className="font-medium">
                              #{invoice.invoiceNumber}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatCurrency(invoice.total)}
                            </p>
                          </div>
                          <Badge variant={getStatusVariant(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contracts" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Contracts</CardTitle>
                    <CardDescription>
                      {clientContracts.length} contracts for this client
                    </CardDescription>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/contracts/new?clientId=${id}`}>
                      <Plus className="h-4 w-4 mr-1" />
                      New
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {clientContracts.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No contracts yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {clientContracts.map((contract) => (
                        <Link
                          key={contract.id}
                          href={`/dashboard/contracts/${contract.id}`}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                        >
                          <div>
                            <p className="font-medium">{contract.title}</p>
                            <p className="text-sm text-gray-500">
                              {contract.sentAt
                                ? `Sent ${new Date(contract.sentAt).toLocaleDateString()}`
                                : "Draft"}
                            </p>
                          </div>
                          <Badge variant={getStatusVariant(contract.status)}>
                            {contract.status}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="proposals" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Proposals</CardTitle>
                    <CardDescription>
                      {clientProposals.length} proposals for this client
                    </CardDescription>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/proposals/new?clientId=${id}`}>
                      <Plus className="h-4 w-4 mr-1" />
                      New
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {clientProposals.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No proposals yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {clientProposals.map((proposal) => (
                        <Link
                          key={proposal.id}
                          href={`/dashboard/proposals/${proposal.id}`}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                        >
                          <div>
                            <p className="font-medium">{proposal.title}</p>
                            <p className="text-sm text-gray-500">
                              {formatCurrency(proposal.total)}
                            </p>
                          </div>
                          <Badge variant={getStatusVariant(proposal.status)}>
                            {proposal.status}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
