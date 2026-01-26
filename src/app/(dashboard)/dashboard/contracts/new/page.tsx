"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  clientId: string;
}

const contractTemplates = [
  {
    id: "photography",
    name: "Photography Services",
    content: [
      "PHOTOGRAPHY SERVICES AGREEMENT",
      "",
      'This Photography Services Agreement ("Agreement") is entered into as of [DATE] between [BUSINESS_NAME] ("Photographer") and [CLIENT_NAME] ("Client").',
      "",
      "1. SERVICES",
      "The Photographer agrees to provide photography services for:",
      "Event/Session Type: [PROJECT_TYPE]",
      "Date: [EVENT_DATE]",
      "Location: [EVENT_LOCATION]",
      "",
      "2. PAYMENT",
      "Total Fee: $[TOTAL_VALUE]",
      "Payment Schedule:",
      "- 50% deposit due upon signing",
      "- Remaining balance due before/on the event date",
      "",
      "3. CANCELLATION POLICY",
      "- Cancellation 30+ days before event: Full deposit refund",
      "- Cancellation 14-29 days before event: 50% deposit retained",
      "- Cancellation less than 14 days: Full deposit retained",
      "",
      "4. IMAGE RIGHTS",
      "The Photographer retains copyright to all images. Client receives a personal use license for the delivered images.",
      "",
      "5. LIABILITY",
      "The Photographer's liability is limited to the total amount paid under this Agreement.",
      "",
      "By signing below, both parties agree to the terms outlined in this Agreement.",
      "",
      "_________________________          _________________________",
      "Photographer Signature               Client Signature",
      "",
      "Date: ________________              Date: ________________",
    ].join("\n"),
  },
  {
    id: "general",
    name: "General Services",
    content: [
      "GENERAL SERVICES AGREEMENT",
      "",
      'This Services Agreement ("Agreement") is entered into as of [DATE] between [BUSINESS_NAME] ("Service Provider") and [CLIENT_NAME] ("Client").',
      "",
      "1. SCOPE OF SERVICES",
      "The Service Provider agrees to provide the following services:",
      "[PROJECT_DESCRIPTION]",
      "",
      "2. COMPENSATION",
      "Total Fee: $[TOTAL_VALUE]",
      "Payment Terms: Net 14",
      "",
      "3. TERM",
      "This Agreement begins on [START_DATE] and continues until services are completed.",
      "",
      "4. TERMINATION",
      "Either party may terminate this Agreement with 14 days written notice.",
      "",
      "5. CONFIDENTIALITY",
      "Both parties agree to keep confidential information private.",
      "",
      "6. LIABILITY",
      "Service Provider's liability is limited to the total amount paid under this Agreement.",
      "",
      "By signing below, both parties agree to the terms outlined in this Agreement.",
      "",
      "_________________________          _________________________",
      "Service Provider Signature           Client Signature",
      "",
      "Date: ________________              Date: ________________",
    ].join("\n"),
  },
];

function NewContractForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId");
  const preselectedProjectId = searchParams.get("projectId");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [formData, setFormData] = useState({
    clientId: preselectedClientId || "",
    projectId: preselectedProjectId || "",
    title: "",
    content: "",
    expiresAt: "",
  });

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch(console.error);

    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch(console.error);
  }, []);

  const applyTemplate = (templateId: string) => {
    const template = contractTemplates.find((t) => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        title: template.name + " Contract",
        content: template.content,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.clientId) {
      setError("Please select a client");
      setIsLoading(false);
      return;
    }

    if (!formData.content) {
      setError("Please enter contract content");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          projectId: formData.projectId || null,
          expiresAt: formData.expiresAt || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create contract");
        return;
      }

      router.push(`/dashboard/contracts/${data.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = formData.clientId
    ? projects.filter((p) => p.clientId === formData.clientId)
    : projects;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/contracts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Contract</h1>
          <p className="text-gray-500">Create a new contract for e-signature</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          {/* Client & Project */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client *</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, clientId: value, projectId: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectId">Project (optional)</Label>
                  <Select
                    value={formData.projectId || "none"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, projectId: value === "none" ? "" : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No project</SelectItem>
                      {filteredProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Contract Title *</Label>
                  <Input
                    id="title"
                    placeholder="Photography Services Agreement"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expires On (optional)</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData({ ...formData, expiresAt: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Start from Template</CardTitle>
              <CardDescription>
                Choose a template to get started quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {contractTemplates.map((template) => (
                  <Button
                    key={template.id}
                    type="button"
                    variant="outline"
                    className="h-auto py-4 justify-start"
                    onClick={() => applyTemplate(template.id)}
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contract Content */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Content</CardTitle>
              <CardDescription>
                Write or edit your contract terms. Use placeholders like [CLIENT_NAME] for dynamic content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="content"
                placeholder="Enter your contract terms here..."
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={20}
                className="font-mono text-sm"
                required
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/contracts">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Contract"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function NewContractPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
      <NewContractForm />
    </Suspense>
  );
}
