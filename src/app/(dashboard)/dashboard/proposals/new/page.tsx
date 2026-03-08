"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
}

interface LineItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  isOptional: boolean;
  isSelected: boolean;
}

function NewProposalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId");
  const preselectedProjectId = searchParams.get("projectId");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [formData, setFormData] = useState({
    clientId: preselectedClientId || "",
    projectId: preselectedProjectId || "",
    title: "",
    introduction: "",
    taxRate: 0,
    discount: 0,
    expiresAt: "",
  });

  const [items, setItems] = useState<LineItem[]>([
    {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      isOptional: false,
      isSelected: true,
    },
  ]);

  useEffect(() => {
    Promise.all([
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/services").then((r) => r.json()),
    ]).then(([clientsData, servicesData]) => {
      setClients(clientsData);
      setServices(servicesData);
    });
  }, []);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        isOptional: false,
        isSelected: true,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, updates: Partial<LineItem>) => {
    setItems(items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const addServiceToItems = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      setItems([
        ...items,
        {
          id: crypto.randomUUID(),
          name: service.name,
          description: service.description || "",
          quantity: 1,
          unitPrice: Number(service.price),
          isOptional: false,
          isSelected: true,
        },
      ]);
    }
  };

  const calculateTotals = () => {
    const subtotal = items
      .filter((item) => item.isSelected)
      .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = subtotal * (formData.taxRate / 100);
    const total = subtotal + tax - formData.discount;
    return { subtotal, tax, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { subtotal, tax, total } = calculateTotals();

    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: items.map((item) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            isOptional: item.isOptional,
            isSelected: item.isSelected,
          })),
          tax: formData.taxRate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create proposal");
        return;
      }

      router.push(`/dashboard/proposals/${data.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/proposals">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Proposal</h1>
          <p className="text-gray-500">Build a proposal to win new business</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Proposal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client *</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, clientId: value })
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
                <Label>Expires On</Label>
                <Input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Proposal Title *</Label>
              <Input
                placeholder="e.g., Wedding Photography Package"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Introduction</Label>
              <Textarea
                placeholder="Thank you for considering our services..."
                value={formData.introduction}
                onChange={(e) =>
                  setFormData({ ...formData, introduction: e.target.value })
                }
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Services & Products</CardTitle>
            <div className="flex space-x-2">
              {services.length > 0 && (
                <Select onValueChange={addServiceToItems}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Add from services" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - ${Number(service.price).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="p-4 border rounded-lg bg-gray-50 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                    <span className="text-sm font-medium text-gray-500">
                      Item {index + 1}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={item.isOptional}
                        onCheckedChange={(checked) =>
                          updateItem(item.id, { isOptional: checked })
                        }
                      />
                      <Label className="text-sm">Optional</Label>
                    </div>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="Service or product name"
                      value={item.name}
                      onChange={(e) =>
                        updateItem(item.id, { name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, { quantity: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(item.id, { unitPrice: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe this item..."
                    value={item.description}
                    onChange={(e) =>
                      updateItem(item.id, { description: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-gray-500">
                    {item.isOptional && !item.isSelected && "(Not included in total)"}
                  </span>
                  <span className="font-medium">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={(e) =>
                      setFormData({ ...formData, taxRate: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {formData.taxRate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Tax ({formData.taxRate}%)
                    </span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                )}
                {formData.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${formData.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button variant="outline" type="button" asChild>
            <Link href="/dashboard/proposals">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Proposal"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewProposalPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
      <NewProposalForm />
    </Suspense>
  );
}
