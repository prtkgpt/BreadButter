"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  ArrowRight,
  Building2,
  Palette,
  Users,
} from "lucide-react";

const steps = [
  {
    id: "business",
    title: "Tell us about your business",
    description: "Help us personalize your experience",
    icon: Building2,
  },
  {
    id: "branding",
    title: "Set up your branding",
    description: "Make your documents look professional",
    icon: Palette,
  },
  {
    id: "clients",
    title: "Add your first client",
    description: "Get started with client management",
    icon: Users,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    website: "",
    brandColor: "#f59e0b",
    tagline: "",
    // First client
    clientName: "",
    clientEmail: "",
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  const handleComplete = async () => {
    setIsLoading(true);

    // If client details provided, create the client
    if (formData.clientName && formData.clientEmail) {
      try {
        await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.clientName,
            email: formData.clientEmail,
          }),
        });
      } catch {
        // Ignore errors for now, redirect anyway
      }
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress bar */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold">Welcome to BreadButter</h1>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip for now
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    idx < currentStep
                      ? "bg-green-500 border-green-500 text-white"
                      : idx === currentStep
                      ? "border-amber-500 text-amber-600"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  {idx < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{idx + 1}</span>
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      idx < currentStep ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
              {(() => {
                const IconComponent = steps[currentStep].icon;
                return <IconComponent className="h-6 w-6 text-amber-600" />;
              })()}
            </div>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Acme Photography"
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType">What type of business do you run?</Label>
                  <Input
                    id="businessType"
                    placeholder="Photography, Design, Consulting, etc."
                    value={formData.businessType}
                    onChange={(e) =>
                      setFormData({ ...formData, businessType: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website (optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brandColor">Brand Color</Label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      id="brandColor"
                      value={formData.brandColor}
                      onChange={(e) =>
                        setFormData({ ...formData, brandColor: e.target.value })
                      }
                      className="w-12 h-12 rounded-lg cursor-pointer border-0"
                    />
                    <Input
                      value={formData.brandColor}
                      onChange={(e) =>
                        setFormData({ ...formData, brandColor: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    This color will be used in your proposals, invoices, and client portal
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Business Tagline (optional)</Label>
                  <Textarea
                    id="tagline"
                    placeholder="Capturing your special moments..."
                    value={formData.tagline}
                    onChange={(e) =>
                      setFormData({ ...formData, tagline: e.target.value })
                    }
                    rows={2}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    placeholder="John Smith"
                    value={formData.clientName}
                    onChange={(e) =>
                      setFormData({ ...formData, clientName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Client Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="client@example.com"
                    value={formData.clientEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, clientEmail: e.target.value })
                    }
                  />
                </div>
                <p className="text-sm text-gray-500">
                  You can always add more clients later from your dashboard.
                </p>
              </div>
            )}

            <div className="flex justify-between mt-6">
              {currentStep > 0 ? (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Back
                </Button>
              ) : (
                <div />
              )}
              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={isLoading}>
                  {isLoading ? "Setting up..." : "Go to Dashboard"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
