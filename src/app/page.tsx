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
  TrendingUp,
  Clock,
  DollarSign,
  FolderKanban,
  Play,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Client Management",
    description:
      "Keep all your client information, conversations, and files organized in one place.",
    stat: "2x faster",
    statLabel: "client onboarding",
  },
  {
    icon: FileText,
    title: "Proposals & Quotes",
    description:
      "Create beautiful, branded proposals that clients can accept with one click.",
    stat: "85%",
    statLabel: "acceptance rate",
  },
  {
    icon: FileSignature,
    title: "Contracts & E-Sign",
    description:
      "Send contracts for electronic signature. No more printing, scanning, or mailing.",
    stat: "24 hrs",
    statLabel: "avg. sign time",
  },
  {
    icon: Receipt,
    title: "Invoicing & Payments",
    description:
      "Get paid faster with professional invoices and online payment options.",
    stat: "3 days",
    statLabel: "faster payments",
  },
  {
    icon: Calendar,
    title: "Scheduling",
    description:
      "Let clients book meetings based on your availability. Sync with your calendar.",
    stat: "5 hrs",
    statLabel: "saved per week",
  },
  {
    icon: Zap,
    title: "Automations",
    description:
      "Save hours every week by automating follow-ups, reminders, and routine tasks.",
    stat: "10+",
    statLabel: "hours saved weekly",
  },
];

const testimonials = [
  {
    quote:
      "BreadButter has completely transformed how I run my photography business. I save at least 10 hours a week!",
    author: "Sarah M.",
    role: "Wedding Photographer",
    avatar: "SM",
    revenue: "$45K managed",
  },
  {
    quote:
      "Finally, an affordable alternative that has everything I need. The client portal is a game-changer.",
    author: "Michael K.",
    role: "Freelance Designer",
    avatar: "MK",
    revenue: "$72K managed",
  },
  {
    quote:
      "The automation features alone are worth it. My follow-up emails go out automatically now.",
    author: "Jessica L.",
    role: "Event Planner",
    avatar: "JL",
    revenue: "$120K managed",
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

const stats = [
  { value: "$2.5M+", label: "Processed by users" },
  { value: "10K+", label: "Active businesses" },
  { value: "98%", label: "Customer satisfaction" },
  { value: "50%", label: "Cost savings vs competitors" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-slate-900 font-bold text-sm">BB</span>
              </div>
              <span className="font-bold text-xl text-white">BreadButter</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-400 hover:text-white transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-slate-400 hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-slate-400 hover:text-white transition-colors">
                Testimonials
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-semibold" asChild>
                <Link href="/signup">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full text-sm text-slate-300 mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              Save 50% compared to HoneyBook
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
              Run your business
              <span className="block bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                like a pro
              </span>
            </h1>

            <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Proposals, contracts, invoices, scheduling, and automation — all in one
              place. Built for freelancers and small businesses who want powerful tools
              without the enterprise price tag.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-lg px-8 h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-semibold shadow-lg shadow-amber-500/25" asChild>
                <Link href="/signup">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>

          {/* Dashboard Preview - Much more detailed and visible */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none h-full" />

            <div className="bg-slate-900 rounded-2xl shadow-2xl shadow-amber-500/10 border border-slate-800 overflow-hidden mx-auto max-w-6xl">
              {/* Browser chrome */}
              <div className="bg-slate-800 px-4 py-3 flex items-center space-x-2 border-b border-slate-700">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-slate-700 rounded-md px-4 py-1 text-xs text-slate-400">
                    app.getbreadbutter.com/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="flex">
                {/* Sidebar */}
                <div className="w-56 bg-slate-900 border-r border-slate-800 p-4 hidden md:block">
                  <div className="flex items-center space-x-2 mb-8">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-slate-900 font-bold text-xs">BB</span>
                    </div>
                    <span className="font-semibold text-white text-sm">BreadButter</span>
                  </div>

                  <nav className="space-y-1">
                    {[
                      { name: "Dashboard", icon: TrendingUp, active: true },
                      { name: "Clients", icon: Users, active: false },
                      { name: "Projects", icon: FolderKanban, active: false },
                      { name: "Invoices", icon: Receipt, active: false },
                      { name: "Contracts", icon: FileSignature, active: false },
                      { name: "Calendar", icon: Calendar, active: false },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm ${
                          item.active
                            ? "bg-amber-500/10 text-amber-400"
                            : "text-slate-400"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </nav>
                </div>

                {/* Main content */}
                <div className="flex-1 p-6 bg-slate-900/50">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white">Good morning, Sarah!</h2>
                    <p className="text-slate-400 text-sm">Here&apos;s what&apos;s happening with your business today.</p>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: "Revenue", value: "$12,450", change: "+12%", icon: DollarSign, color: "text-green-400" },
                      { label: "Active Clients", value: "24", change: "+3", icon: Users, color: "text-blue-400" },
                      { label: "Pending", value: "$3,200", change: "2 invoices", icon: Clock, color: "text-amber-400" },
                      { label: "Projects", value: "8", change: "3 in progress", icon: FolderKanban, color: "text-purple-400" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-400 text-sm">{stat.label}</span>
                          <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className={`text-xs ${stat.color}`}>{stat.change}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                      <h3 className="font-semibold text-white mb-4">Recent Projects</h3>
                      <div className="space-y-3">
                        {[
                          { name: "Johnson Wedding", client: "Emily Johnson", value: "$4,500", status: "In Progress", statusColor: "bg-blue-500" },
                          { name: "Tech Startup Branding", client: "Alex Chen", value: "$2,800", status: "Proposal Sent", statusColor: "bg-amber-500" },
                          { name: "Family Portrait", client: "The Williams", value: "$650", status: "Completed", statusColor: "bg-green-500" },
                        ].map((project) => (
                          <div key={project.name} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                            <div>
                              <p className="text-white font-medium text-sm">{project.name}</p>
                              <p className="text-slate-400 text-xs">{project.client}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-medium text-sm">{project.value}</p>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${project.statusColor} text-white`}>
                                {project.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                      <h3 className="font-semibold text-white mb-4">Upcoming</h3>
                      <div className="space-y-3">
                        {[
                          { title: "Client Call", time: "Today, 2:00 PM", type: "meeting" },
                          { title: "Invoice #1042 Due", time: "Tomorrow", type: "invoice" },
                          { title: "Photo Session", time: "Jan 28, 10:00 AM", type: "event" },
                        ].map((event, idx) => (
                          <div key={idx} className="flex items-start space-x-3 py-2 border-b border-slate-700 last:border-0">
                            <div className="w-2 h-2 bg-amber-400 rounded-full mt-2" />
                            <div>
                              <p className="text-white text-sm">{event.title}</p>
                              <p className="text-slate-400 text-xs">{event.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 border-y border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Everything you need to
              <span className="block bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                run your business
              </span>
            </h2>
            <p className="mt-4 text-xl text-slate-400 max-w-2xl mx-auto">
              Stop juggling multiple tools. BreadButter brings it all together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all duration-300 group">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-4 group-hover:from-amber-500/30 group-hover:to-orange-500/30 transition-colors">
                    <feature.icon className="h-6 w-6 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 mb-4">{feature.description}</p>
                  <div className="pt-4 border-t border-slate-800">
                    <span className="text-2xl font-bold text-amber-400">{feature.stat}</span>
                    <span className="text-slate-500 text-sm ml-2">{feature.statLabel}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Get started in
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"> minutes</span>
            </h2>
            <p className="mt-4 text-xl text-slate-400">
              No complicated setup. No learning curve.
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
            ].map((item, idx) => (
              <div key={item.step} className="relative">
                {idx < 2 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-amber-500/50 to-transparent" />
                )}
                <div className="text-center relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-900 text-2xl font-bold flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/25">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Loved by{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                10,000+
              </span>{" "}
              businesses
            </h2>
            <p className="mt-4 text-xl text-slate-400">
              See why freelancers and small businesses choose BreadButter
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="bg-slate-900 border-slate-800">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-6 text-lg">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-slate-900 font-semibold text-sm">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {testimonial.author}
                        </p>
                        <p className="text-sm text-slate-500">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Revenue</p>
                      <p className="text-sm font-semibold text-amber-400">{testimonial.revenue}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-sm text-green-400 mb-6">
              <CheckCircle className="w-4 h-4 mr-2" />
              Save up to 50% vs competitors
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Simple, transparent
              <span className="block bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                pricing
              </span>
            </h2>
            <p className="mt-4 text-xl text-slate-400">
              No hidden fees. No surprises. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative bg-slate-900 ${
                  plan.popular
                    ? "border-amber-500 border-2 shadow-xl shadow-amber-500/10"
                    : "border-slate-800"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 text-sm font-semibold px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardContent className="pt-8">
                  <h3 className="text-xl font-semibold text-white">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                  <div className="mt-6">
                    <span className="text-5xl font-bold text-white">${plan.price}</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-8 h-12 font-semibold ${
                      plan.popular
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900"
                        : "bg-slate-800 hover:bg-slate-700 text-white"
                    }`}
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
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Ready to grow your business?
          </h2>
          <p className="mt-4 text-xl text-slate-400">
            Join 10,000+ freelancers and small businesses using BreadButter
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="text-lg px-8 h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-semibold shadow-lg shadow-amber-500/25"
              asChild
            >
              <Link href="/signup">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            No credit card required • 14-day free trial
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-slate-900 font-bold text-sm">BB</span>
                </div>
                <span className="font-bold text-xl text-white">BreadButter</span>
              </div>
              <p className="text-sm text-slate-400">
                The affordable client management platform for freelancers and small
                businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-sm text-center text-slate-500">
            <p>&copy; {new Date().getFullYear()} BreadButter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
