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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, FileText, Eye, Briefcase, Camera, Code, Users } from "lucide-react";
import { contractTemplates as templates } from "@/lib/templates";

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

const categoryIcons: Record<string, React.ReactNode> = {
  "General": <Briefcase className="h-5 w-5" />,
  "Creative": <Camera className="h-5 w-5" />,
  "Technology": <Code className="h-5 w-5" />,
  "Professional Services": <Users className="h-5 w-5" />,
};

const categoryColors: Record<string, string> = {
  "General": "bg-blue-100 text-blue-700 border-blue-200",
  "Creative": "bg-purple-100 text-purple-700 border-purple-200",
  "Technology": "bg-green-100 text-green-700 border-green-200",
  "Professional Services": "bg-amber-100 text-amber-700 border-amber-200",
};

function NewContractForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId");
  const preselectedProjectId = searchParams.get("projectId");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState<typeof templates[0] | null>(null);

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
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        title: template.name,
        content: template.content,
      });
      setPreviewTemplate(null);
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
                Choose a professionally drafted template with proper legal clauses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border rounded-lg p-4 hover:border-amber-300 hover:bg-amber-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gray-100">
                          {categoryIcons[template.category] || <FileText className="h-5 w-5" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[template.category] || "bg-gray-100 text-gray-600"}`}>
                            {template.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {template.id === "freelance-services" && "Complete freelance agreement with IP rights, payment terms, and liability clauses."}
                      {template.id === "photography" && "Photography contract covering usage rights, cancellation policy, and deliverables."}
                      {template.id === "web-development" && "Web development agreement with milestones, revision rounds, and technical specs."}
                      {template.id === "consulting" && "Professional consulting contract with confidentiality and non-solicitation terms."}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => applyTemplate(template.id)}
                      >
                        Use Template
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Template Preview Dialog */}
          <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {previewTemplate && categoryIcons[previewTemplate.category]}
                  {previewTemplate?.name}
                </DialogTitle>
                <DialogDescription>
                  Preview the contract template before using it
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto mt-4">
                <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-6 rounded-lg border text-gray-700">
                  {previewTemplate?.content}
                </pre>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  Close
                </Button>
                <Button onClick={() => previewTemplate && applyTemplate(previewTemplate.id)}>
                  Use This Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Contract Content */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Content</CardTitle>
              <CardDescription>
                Edit your contract terms. Variables like {"{{client_name}}"} will be replaced with actual values when the contract is generated.
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
