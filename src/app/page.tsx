import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Receipt,
  FileSignature,
  Calendar,
  Zap,
  FileText,
  CheckCircle,
  Star,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Client Management",
    description:
      "Keep all your client information, conversations, and files organized in one place.",
  },
  {
    icon: FileText,
    title: "Proposals & Quotes",
    description:
      "Create beautiful, branded proposals that clients can accept with one click.",
  },
  {
    icon: FileSignature,
    title: "Contracts & E-Sign",
    description:
      "Send contracts for electronic signature. No more printing, scanning, or mailing.",
  },
  {
    icon: Receipt,
    title: "Invoicing & Payments",
    description:
      "Get paid faster with professional invoices and online payment options.",
  },
  {
    icon: Calendar,
    title: "Scheduling",
    description:
      "Let clients book meetings based on your availability. Sync with your calendar.",
  },
  {
    icon: Zap,
    title: "Automations",
    description:
      "Save hours every week by automating follow-ups, reminders, and routine tasks.",
  },
];

const testimonials = [
  {
    quote:
      "BreadButter has completely transformed how I run my photography business. I save at least 10 hours a week!",
    author: "Sarah M.",
    role: "Wedding Photographer",
  },
  {
    quote:
      "Finally, an affordable alternative that has everything I need. The client portal is a game-changer.",
    author: "Michael K.",
    role: "Freelance Designer",
  },
  {
    quote:
      "The automation features alone are worth it. My follow-up emails go out automatically now.",
    author: "Jessica L.",
    role: "Event Planner",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: 9,
    description: "Perfect for getting started",
    features: [
      "Up to 5 active clients",
      "Unlimited invoices",
      "Basic contracts",
      "Email support",
    ],
  },
  {
    name: "Professional",
    price: 19,
    description: "Most popular for growing businesses",
    features: [
      "Unlimited clients",
      "Proposals & quotes",
      "E-signatures",
      "Scheduling",
      "Automations",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Business",
    price: 39,
    description: "For established businesses",
    features: [
      "Everything in Professional",
      "Custom branding",
      "Advanced automations",
      "Team members (coming soon)",
      "API access",
      "Phone support",
    ],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🍞</span>
              <span className="font-bold text-xl">BreadButter</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900">
                Testimonials
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
              The affordable way to manage your{" "}
              <span className="text-amber-600">client business</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              Proposals, contracts, invoices, scheduling, and automation — all in one
              place. Built for freelancers and small businesses who want powerful tools
              without the enterprise price tag.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link href="/signup">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <p className="text-sm text-gray-500">
                No credit card required • 14-day free trial
              </p>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mx-4 md:mx-auto max-w-5xl">
              <div className="bg-gray-100 px-4 py-3 flex items-center space-x-2 border-b">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Revenue", value: "$12,450" },
                    { label: "Clients", value: "24" },
                    { label: "Pending", value: "$3,200" },
                    { label: "Projects", value: "8" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 bg-white p-4 rounded-lg shadow-sm h-48" />
                  <div className="bg-white p-4 rounded-lg shadow-sm h-48" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything you need to run your business
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Stop juggling multiple tools. BreadButter brings it all together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              How BreadButter works
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Get started in minutes, not hours
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create your account",
                description:
                  "Sign up in 30 seconds. No credit card required for your free trial.",
              },
              {
                step: "2",
                title: "Add your clients",
                description:
                  "Import your existing clients or add them manually. We make it easy.",
              },
              {
                step: "3",
                title: "Start winning business",
                description:
                  "Send proposals, sign contracts, and get paid — all from one dashboard.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-amber-500 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Loved by freelancers and small businesses
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Save up to 50% compared to other platforms
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.popular
                    ? "border-amber-500 border-2 shadow-xl"
                    : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardContent className="pt-8">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-8"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/signup">Start Free Trial</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-amber-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to simplify your business?
          </h2>
          <p className="mt-4 text-xl text-amber-100">
            Join thousands of freelancers and small businesses using BreadButter
          </p>
          <Button
            size="lg"
            className="mt-8 bg-white text-amber-600 hover:bg-amber-50"
            asChild
          >
            <Link href="/signup">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🍞</span>
                <span className="font-bold text-xl text-white">BreadButter</span>
              </div>
              <p className="text-sm">
                The affordable client management platform for freelancers and small
                businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} BreadButter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
