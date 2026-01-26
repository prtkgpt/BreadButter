import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, clients } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderKanban, MoreHorizontal, Calendar, DollarSign } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const projectList = await db.query.projects.findMany({
    where: eq(projects.userId, user.id),
    orderBy: [desc(projects.createdAt)],
    with: {
      client: true,
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
      lead: "secondary",
      inquiry: "secondary",
      proposal_sent: "warning",
      contract_sent: "warning",
      booked: "success",
      in_progress: "default",
      completed: "success",
      cancelled: "destructive",
    };
    return variants[status] || "secondary";
  };

  const statusLabels: Record<string, string> = {
    lead: "Lead",
    inquiry: "Inquiry",
    proposal_sent: "Proposal Sent",
    contract_sent: "Contract Sent",
    booked: "Booked",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  // Group projects by status for pipeline view
  const pipelineStatuses = [
    "lead",
    "inquiry",
    "proposal_sent",
    "contract_sent",
    "booked",
    "in_progress",
    "completed",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">
            Manage your projects and track their progress
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Project List */}
      {projectList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderKanban className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
            <p className="text-gray-500 mt-1 text-center max-w-sm">
              Create your first project to start tracking your work, invoices, and contracts.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/projects/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pipeline View - Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {pipelineStatuses.map((status) => {
              const count = projectList.filter((p) => p.status === status).length;
              const value = projectList
                .filter((p) => p.status === status)
                .reduce((sum, p) => sum + parseFloat(p.totalValue || "0"), 0);

              return (
                <Card key={status} className="p-3">
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    {statusLabels[status]}
                  </p>
                  <p className="text-2xl font-bold mt-1">{count}</p>
                  <p className="text-xs text-gray-400">
                    {formatCurrency(value.toString())}
                  </p>
                </Card>
              );
            })}
          </div>

          {/* Project List */}
          <Card>
            <CardHeader>
              <CardTitle>All Projects</CardTitle>
              <CardDescription>{projectList.length} total projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-100">
                {projectList.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/dashboard/projects/${project.id}`}
                          className="font-medium text-gray-900 hover:text-amber-600"
                        >
                          {project.name}
                        </Link>
                        <Badge variant={getStatusVariant(project.status)}>
                          {statusLabels[project.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <Link
                          href={`/dashboard/clients/${project.clientId}`}
                          className="text-sm text-gray-500 hover:text-amber-600"
                        >
                          {project.client?.name}
                        </Link>
                        {project.eventDate && (
                          <span className="text-sm text-gray-400 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(project.eventDate).toLocaleDateString()}
                          </span>
                        )}
                        <span className="text-sm text-gray-400 flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {formatCurrency(project.totalValue)}
                        </span>
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
                          <Link href={`/dashboard/projects/${project.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/projects/${project.id}/edit`}>
                            Edit Project
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/invoices/new?projectId=${project.id}`}>
                            Create Invoice
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/contracts/new?projectId=${project.id}`}>
                            Create Contract
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
