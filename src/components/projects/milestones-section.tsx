"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  FileText,
  Receipt,
} from "lucide-react";

interface Milestone {
  id: string;
  name: string;
  description: string | null;
  amount: string;
  dueDate: string | null;
  status: string;
  deliverables: string[];
  submittedAt: string | null;
  approvedAt: string | null;
  paidAt: string | null;
}

interface MilestonesSectionProps {
  projectId: string;
  clientId: string;
  milestones: Milestone[];
}

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  pending: { color: "bg-gray-100 text-gray-800", icon: Clock, label: "Pending" },
  in_progress: { color: "bg-blue-100 text-blue-800", icon: Clock, label: "In Progress" },
  submitted: { color: "bg-yellow-100 text-yellow-800", icon: FileText, label: "Submitted" },
  revision_requested: { color: "bg-orange-100 text-orange-800", icon: AlertCircle, label: "Revision Requested" },
  approved: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Approved" },
  paid: { color: "bg-emerald-100 text-emerald-800", icon: DollarSign, label: "Paid" },
};

export function MilestonesSection({
  projectId,
  clientId,
  milestones: initialMilestones,
}: MilestonesSectionProps) {
  const router = useRouter();
  const [milestones, setMilestones] = useState(initialMilestones);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
    dueDate: "",
    deliverables: "",
  });

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          name: formData.name,
          description: formData.description || null,
          amount: parseFloat(formData.amount),
          dueDate: formData.dueDate || null,
          deliverables: formData.deliverables
            .split("\n")
            .map((d) => d.trim())
            .filter(Boolean),
        }),
      });

      if (response.ok) {
        const newMilestone = await response.json();
        setMilestones([...milestones, newMilestone]);
        setIsDialogOpen(false);
        setFormData({
          name: "",
          description: "",
          amount: "",
          dueDate: "",
          deliverables: "",
        });
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to create milestone:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMilestoneAction = async (milestoneId: string, action: string) => {
    try {
      const response = await fetch(`/api/milestones/${milestoneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const data = await response.json();
        if (action === "create_invoice" && data.invoice) {
          router.push(`/dashboard/invoices/${data.invoice.id}`);
        } else {
          setMilestones(
            milestones.map((m) => (m.id === milestoneId ? data : m))
          );
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  const totalAmount = milestones.reduce((sum, m) => sum + Number(m.amount), 0);
  const paidAmount = milestones
    .filter((m) => m.status === "paid")
    .reduce((sum, m) => sum + Number(m.amount), 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Milestones
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            ${paidAmount.toFixed(2)} of ${totalAmount.toFixed(2)} paid
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Milestone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Milestone</DialogTitle>
              <DialogDescription>
                Break down your project into payment milestones.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateMilestone} className="space-y-4">
              <div className="space-y-2">
                <Label>Milestone Name *</Label>
                <Input
                  placeholder="e.g., Design Phase"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="What's included in this milestone..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Deliverables (one per line)</Label>
                <Textarea
                  placeholder="List deliverables..."
                  value={formData.deliverables}
                  onChange={(e) =>
                    setFormData({ ...formData, deliverables: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Add Milestone"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {milestones.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No milestones yet. Add milestones to break down your project into
            manageable payment phases.
          </p>
        ) : (
          <div className="space-y-3">
            {milestones.map((milestone, index) => {
              const config = statusConfig[milestone.status] || statusConfig.pending;
              const StatusIcon = config.icon;

              return (
                <div
                  key={milestone.id}
                  className="p-4 border rounded-lg hover:border-amber-200 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{milestone.name}</h4>
                        {milestone.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {milestone.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="font-semibold text-gray-900">
                            ${Number(milestone.amount).toFixed(2)}
                          </span>
                          {milestone.dueDate && (
                            <span className="text-sm text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(milestone.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          <Badge className={config.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        {milestone.deliverables &&
                          milestone.deliverables.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {milestone.deliverables.map((d, i) => (
                                <li
                                  key={i}
                                  className="text-sm text-gray-500 flex items-center"
                                >
                                  <CheckCircle className="h-3 w-3 mr-2 text-gray-400" />
                                  {d}
                                </li>
                              ))}
                            </ul>
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
                        {milestone.status === "pending" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleMilestoneAction(milestone.id, "submit")
                            }
                          >
                            Mark as Submitted
                          </DropdownMenuItem>
                        )}
                        {milestone.status === "submitted" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleMilestoneAction(milestone.id, "approve")
                              }
                            >
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleMilestoneAction(
                                  milestone.id,
                                  "request_revision"
                                )
                              }
                            >
                              Request Revision
                            </DropdownMenuItem>
                          </>
                        )}
                        {milestone.status === "approved" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleMilestoneAction(
                                  milestone.id,
                                  "create_invoice"
                                )
                              }
                            >
                              <Receipt className="h-4 w-4 mr-2" />
                              Create Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleMilestoneAction(milestone.id, "mark_paid")
                              }
                            >
                              Mark as Paid
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
