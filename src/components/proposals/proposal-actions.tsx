"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Send,
  FileSignature,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Download,
} from "lucide-react";

interface ProposalActionsProps {
  proposal: {
    id: string;
    status: string;
    clientId: string;
    projectId?: string | null;
    title: string;
  };
}

export function ProposalActions({ proposal }: ProposalActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const data = await response.json();
        if (action === "convert_to_contract" && data.contract) {
          router.push(`/dashboard/contracts/${data.contract.id}`);
        } else {
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard/proposals");
        router.refresh();
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        {proposal.status === "draft" && (
          <Button onClick={() => handleAction("send")} disabled={isLoading}>
            <Send className="h-4 w-4 mr-2" />
            Send Proposal
          </Button>
        )}

        {proposal.status === "accepted" && (
          <Button
            onClick={() => handleAction("convert_to_contract")}
            disabled={isLoading}
          >
            <FileSignature className="h-4 w-4 mr-2" />
            Create Contract
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {proposal.status === "draft" && (
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/proposals/${proposal.id}/edit`)
                }
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Proposal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{proposal.title}&rdquo;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
