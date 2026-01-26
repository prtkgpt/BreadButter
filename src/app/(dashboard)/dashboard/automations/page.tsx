import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { automations } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Zap, MoreHorizontal, Play, Pause, Mail, Clock, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const triggerLabels: Record<string, string> = {
  project_created: "When a project is created",
  proposal_sent: "When a proposal is sent",
  proposal_viewed: "When a proposal is viewed",
  proposal_accepted: "When a proposal is accepted",
  contract_sent: "When a contract is sent",
  contract_signed: "When a contract is signed",
  invoice_sent: "When an invoice is sent",
  invoice_paid: "When an invoice is paid",
  appointment_booked: "When an appointment is booked",
  appointment_reminder: "Before an appointment",
  custom_date: "On a specific date",
};

const triggerIcons: Record<string, typeof Mail> = {
  project_created: FileText,
  proposal_sent: FileText,
  proposal_viewed: FileText,
  proposal_accepted: FileText,
  contract_sent: FileText,
  contract_signed: FileText,
  invoice_sent: FileText,
  invoice_paid: FileText,
  appointment_booked: Clock,
  appointment_reminder: Clock,
  custom_date: Clock,
};

export default async function AutomationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const automationList = await db.query.automations.findMany({
    where: eq(automations.userId, user.id),
    orderBy: [desc(automations.createdAt)],
    with: {
      steps: true,
    },
  });

  const activeCount = automationList.filter((a) => a.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automations</h1>
          <p className="text-gray-500 mt-1">
            Automate repetitive tasks and save time
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/automations/new">
            <Plus className="h-4 w-4 mr-2" />
            New Automation
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Active</span>
            </div>
            <p className="text-2xl font-bold mt-2">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium text-gray-600">Total</span>
            </div>
            <p className="text-2xl font-bold mt-2">{automationList.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Automation List */}
      {automationList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Zap className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No automations yet</h3>
            <p className="text-gray-500 mt-1 text-center max-w-sm">
              Create automations to automatically send emails, update projects, and more.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/automations/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Automation
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Automations</CardTitle>
            <CardDescription>
              {automationList.length} automations, {activeCount} active
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-100">
              {automationList.map((automation) => {
                const TriggerIcon = triggerIcons[automation.trigger] || Zap;
                return (
                  <div
                    key={automation.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-2 rounded-lg bg-amber-50">
                        <TriggerIcon className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <Link
                            href={`/dashboard/automations/${automation.id}`}
                            className="font-medium text-gray-900 hover:text-amber-600"
                          >
                            {automation.name}
                          </Link>
                          <Badge
                            variant={automation.isActive ? "success" : "secondary"}
                          >
                            {automation.isActive ? "Active" : "Paused"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {triggerLabels[automation.trigger]}
                        </p>
                        {automation.steps && automation.steps.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            {automation.steps.length} step
                            {automation.steps.length !== 1 ? "s" : ""}
                          </p>
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
                          <Link href={`/dashboard/automations/${automation.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/automations/${automation.id}/edit`}>
                            Edit Automation
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {automation.isActive ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Templates</CardTitle>
          <CardDescription>
            Get started quickly with pre-built automation workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 justify-start text-left"
              asChild
            >
              <Link href="/dashboard/automations/new?template=welcome">
                <div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-amber-500" />
                    <span className="font-medium">Welcome Email</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Send a welcome email when a new project is created
                  </p>
                </div>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 justify-start text-left"
              asChild
            >
              <Link href="/dashboard/automations/new?template=followup">
                <div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    <span className="font-medium">Proposal Follow-up</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Follow up 3 days after sending a proposal
                  </p>
                </div>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 justify-start text-left"
              asChild
            >
              <Link href="/dashboard/automations/new?template=reminder">
                <div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    <span className="font-medium">Appointment Reminder</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Send a reminder 24 hours before appointments
                  </p>
                </div>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 justify-start text-left"
              asChild
            >
              <Link href="/dashboard/automations/new?template=thankyou">
                <div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-amber-500" />
                    <span className="font-medium">Thank You Email</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Send a thank you when payment is received
                  </p>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
