import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  decimal,
  jsonb,
  pgEnum,
  date,
  time,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const projectStatusEnum = pgEnum("project_status", [
  "lead",
  "inquiry",
  "proposal_sent",
  "contract_sent",
  "booked",
  "in_progress",
  "completed",
  "cancelled",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "viewed",
  "partial",
  "paid",
  "overdue",
  "cancelled",
]);

export const contractStatusEnum = pgEnum("contract_status", [
  "draft",
  "sent",
  "viewed",
  "signed",
  "expired",
  "cancelled",
]);

export const proposalStatusEnum = pgEnum("proposal_status", [
  "draft",
  "sent",
  "viewed",
  "accepted",
  "declined",
  "expired",
]);

export const smartFileStatusEnum = pgEnum("smart_file_status", [
  "draft",
  "sent",
  "viewed",
  "partial",
  "completed",
]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
]);

export const automationTriggerEnum = pgEnum("automation_trigger", [
  "project_created",
  "proposal_sent",
  "proposal_viewed",
  "proposal_accepted",
  "contract_sent",
  "contract_signed",
  "invoice_sent",
  "invoice_paid",
  "appointment_booked",
  "appointment_reminder",
  "custom_date",
]);

export const automationActionEnum = pgEnum("automation_action", [
  "send_email",
  "send_reminder",
  "create_task",
  "update_project_status",
  "send_invoice",
  "send_contract",
  "wait",
]);

// Users table - business owners using the platform
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  name: text("name"),
  businessName: text("business_name"),
  businessType: text("business_type"),
  phone: text("phone"),
  website: text("website"),
  logo: text("logo"),
  brandColor: text("brand_color").default("#f59e0b"),
  timezone: text("timezone").default("America/New_York"),
  currency: text("currency").default("USD"),
  stripeAccountId: text("stripe_account_id"),
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionStatus: text("subscription_status").default("trial"),
  subscriptionPlan: text("subscription_plan").default("starter"),
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Clients table - customers of the business owners
export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  name: text("name").notNull(),
  company: text("company"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country").default("US"),
  notes: text("notes"),
  tags: jsonb("tags").$type<string[]>().default([]),
  portalAccessToken: text("portal_access_token"),
  lastActivity: timestamp("last_activity"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Projects table - jobs/bookings/engagements
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  status: projectStatusEnum("status").default("lead").notNull(),
  projectType: text("project_type"),
  eventDate: date("event_date"),
  eventLocation: text("event_location"),
  totalValue: decimal("total_value", { precision: 10, scale: 2 }).default("0"),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  tags: jsonb("tags").$type<string[]>().default([]),
  customFields: jsonb("custom_fields").$type<Record<string, string>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Services table - reusable services/packages
export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").default("flat"), // flat, hourly, per_item
  duration: integer("duration"), // in minutes, for time-based services
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  invoiceNumber: text("invoice_number").notNull(),
  status: invoiceStatusEnum("status").default("draft").notNull(),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default("0"),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).default("0"),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  terms: text("terms"),
  lastViewedAt: timestamp("last_viewed_at"),
  sentAt: timestamp("sent_at"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Invoice items table
export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payments table
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(), // card, bank, cash, check, other
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeChargeId: text("stripe_charge_id"),
  status: text("status").default("completed"), // pending, completed, failed, refunded
  notes: text("notes"),
  paidAt: timestamp("paid_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Contracts table
export const contracts = pgTable("contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  templateId: uuid("template_id").references(() => templates.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  content: text("content").notNull(), // HTML/markdown content
  status: contractStatusEnum("status").default("draft").notNull(),
  expiresAt: timestamp("expires_at"),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  signedAt: timestamp("signed_at"),
  clientSignature: text("client_signature"), // base64 signature image
  clientSignedIp: text("client_signed_ip"),
  ownerSignature: text("owner_signature"),
  ownerSignedAt: timestamp("owner_signed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Proposals table
export const proposals = pgTable("proposals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  introduction: text("introduction"),
  status: proposalStatusEnum("status").default("draft").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default("0"),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).default("0"),
  expiresAt: timestamp("expires_at"),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  acceptedAt: timestamp("accepted_at"),
  declinedAt: timestamp("declined_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Proposal items table
export const proposalItems = pgTable("proposal_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  proposalId: uuid("proposal_id")
    .notNull()
    .references(() => proposals.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  description: text("description"),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  isOptional: boolean("is_optional").default(false),
  isSelected: boolean("is_selected").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Smart Files - combined proposal, contract, and invoice
export const smartFiles = pgTable("smart_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "set null" }),
  contractId: uuid("contract_id").references(() => contracts.id, { onDelete: "set null" }),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  status: smartFileStatusEnum("status").default("draft").notNull(),
  accessToken: text("access_token").notNull(),
  includeProposal: boolean("include_proposal").default(true),
  includeContract: boolean("include_contract").default(true),
  includeInvoice: boolean("include_invoice").default(true),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Appointment types - configurable meeting types
export const appointmentTypes = pgTable("appointment_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  price: decimal("price", { precision: 10, scale: 2 }).default("0"),
  color: text("color").default("#f59e0b"),
  location: text("location"), // zoom, phone, in-person, etc.
  bufferBefore: integer("buffer_before").default(0), // minutes
  bufferAfter: integer("buffer_after").default(0), // minutes
  maxPerDay: integer("max_per_day"),
  isActive: boolean("is_active").default(true),
  requiresPayment: boolean("requires_payment").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Availability - user's available time slots
export const availability = pgTable("availability", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6, Sunday = 0
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  appointmentTypeId: uuid("appointment_type_id")
    .notNull()
    .references(() => appointmentTypes.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: appointmentStatusEnum("status").default("scheduled").notNull(),
  location: text("location"),
  meetingUrl: text("meeting_url"),
  clientName: text("client_name"),
  clientEmail: text("client_email"),
  notes: text("notes"),
  reminderSent: boolean("reminder_sent").default(false),
  confirmedAt: timestamp("confirmed_at"),
  cancelledAt: timestamp("cancelled_at"),
  cancelReason: text("cancel_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Templates - reusable templates for contracts, emails, etc.
export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // contract, email, proposal, invoice
  name: text("name").notNull(),
  subject: text("subject"), // for email templates
  content: text("content").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Automations/Workflows
export const automations = pgTable("automations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  trigger: automationTriggerEnum("trigger").notNull(),
  triggerConfig: jsonb("trigger_config").$type<Record<string, unknown>>().default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Automation steps
export const automationSteps = pgTable("automation_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  automationId: uuid("automation_id")
    .notNull()
    .references(() => automations.id, { onDelete: "cascade" }),
  action: automationActionEnum("action").notNull(),
  actionConfig: jsonb("action_config").$type<Record<string, unknown>>().default({}),
  delayMinutes: integer("delay_minutes").default(0),
  templateId: uuid("template_id").references(() => templates.id, { onDelete: "set null" }),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Automation logs - track automation executions
export const automationLogs = pgTable("automation_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  automationId: uuid("automation_id")
    .notNull()
    .references(() => automations.id, { onDelete: "cascade" }),
  stepId: uuid("step_id").references(() => automationSteps.id, { onDelete: "set null" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
  status: text("status").notNull(), // pending, running, completed, failed
  result: jsonb("result").$type<Record<string, unknown>>(),
  errorMessage: text("error_message"),
  executedAt: timestamp("executed_at").defaultNow().notNull(),
});

// Messages - communication thread with clients
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  direction: text("direction").notNull(), // inbound, outbound
  subject: text("subject"),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Files/Attachments
export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  messageId: uuid("message_id").references(() => messages.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tasks - to-do items for projects
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  isCompleted: boolean("is_completed").default(false),
  dueDate: date("due_date"),
  sortOrder: integer("sort_order").default(0),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Activity log - audit trail
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  clients: many(clients),
  projects: many(projects),
  services: many(services),
  invoices: many(invoices),
  contracts: many(contracts),
  proposals: many(proposals),
  smartFiles: many(smartFiles),
  appointmentTypes: many(appointmentTypes),
  availability: many(availability),
  appointments: many(appointments),
  templates: many(templates),
  automations: many(automations),
  messages: many(messages),
  files: many(files),
  tasks: many(tasks),
  activityLogs: many(activityLogs),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, { fields: [clients.userId], references: [users.id] }),
  projects: many(projects),
  invoices: many(invoices),
  contracts: many(contracts),
  proposals: many(proposals),
  smartFiles: many(smartFiles),
  appointments: many(appointments),
  messages: many(messages),
  files: many(files),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  client: one(clients, { fields: [projects.clientId], references: [clients.id] }),
  invoices: many(invoices),
  contracts: many(contracts),
  proposals: many(proposals),
  smartFiles: many(smartFiles),
  appointments: many(appointments),
  messages: many(messages),
  files: many(files),
  tasks: many(tasks),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(users, { fields: [invoices.userId], references: [users.id] }),
  client: one(clients, { fields: [invoices.clientId], references: [clients.id] }),
  project: one(projects, { fields: [invoices.projectId], references: [projects.id] }),
  items: many(invoiceItems),
  payments: many(payments),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceItems.invoiceId], references: [invoices.id] }),
  service: one(services, { fields: [invoiceItems.serviceId], references: [services.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, { fields: [payments.invoiceId], references: [invoices.id] }),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  user: one(users, { fields: [contracts.userId], references: [users.id] }),
  client: one(clients, { fields: [contracts.clientId], references: [clients.id] }),
  project: one(projects, { fields: [contracts.projectId], references: [projects.id] }),
  template: one(templates, { fields: [contracts.templateId], references: [templates.id] }),
}));

export const proposalsRelations = relations(proposals, ({ one, many }) => ({
  user: one(users, { fields: [proposals.userId], references: [users.id] }),
  client: one(clients, { fields: [proposals.clientId], references: [clients.id] }),
  project: one(projects, { fields: [proposals.projectId], references: [projects.id] }),
  items: many(proposalItems),
}));

export const proposalItemsRelations = relations(proposalItems, ({ one }) => ({
  proposal: one(proposals, { fields: [proposalItems.proposalId], references: [proposals.id] }),
  service: one(services, { fields: [proposalItems.serviceId], references: [services.id] }),
}));

export const smartFilesRelations = relations(smartFiles, ({ one }) => ({
  user: one(users, { fields: [smartFiles.userId], references: [users.id] }),
  client: one(clients, { fields: [smartFiles.clientId], references: [clients.id] }),
  project: one(projects, { fields: [smartFiles.projectId], references: [projects.id] }),
  proposal: one(proposals, { fields: [smartFiles.proposalId], references: [proposals.id] }),
  contract: one(contracts, { fields: [smartFiles.contractId], references: [contracts.id] }),
  invoice: one(invoices, { fields: [smartFiles.invoiceId], references: [invoices.id] }),
}));

export const appointmentTypesRelations = relations(appointmentTypes, ({ one, many }) => ({
  user: one(users, { fields: [appointmentTypes.userId], references: [users.id] }),
  appointments: many(appointments),
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
  user: one(users, { fields: [availability.userId], references: [users.id] }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, { fields: [appointments.userId], references: [users.id] }),
  client: one(clients, { fields: [appointments.clientId], references: [clients.id] }),
  project: one(projects, { fields: [appointments.projectId], references: [projects.id] }),
  appointmentType: one(appointmentTypes, {
    fields: [appointments.appointmentTypeId],
    references: [appointmentTypes.id],
  }),
}));

export const templatesRelations = relations(templates, ({ one }) => ({
  user: one(users, { fields: [templates.userId], references: [users.id] }),
}));

export const automationsRelations = relations(automations, ({ one, many }) => ({
  user: one(users, { fields: [automations.userId], references: [users.id] }),
  steps: many(automationSteps),
  logs: many(automationLogs),
}));

export const automationStepsRelations = relations(automationSteps, ({ one }) => ({
  automation: one(automations, {
    fields: [automationSteps.automationId],
    references: [automations.id],
  }),
  template: one(templates, { fields: [automationSteps.templateId], references: [templates.id] }),
}));

export const automationLogsRelations = relations(automationLogs, ({ one }) => ({
  automation: one(automations, {
    fields: [automationLogs.automationId],
    references: [automations.id],
  }),
  step: one(automationSteps, { fields: [automationLogs.stepId], references: [automationSteps.id] }),
  project: one(projects, { fields: [automationLogs.projectId], references: [projects.id] }),
  client: one(clients, { fields: [automationLogs.clientId], references: [clients.id] }),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  user: one(users, { fields: [messages.userId], references: [users.id] }),
  client: one(clients, { fields: [messages.clientId], references: [clients.id] }),
  project: one(projects, { fields: [messages.projectId], references: [projects.id] }),
  files: many(files),
}));

export const filesRelations = relations(files, ({ one }) => ({
  user: one(users, { fields: [files.userId], references: [users.id] }),
  client: one(clients, { fields: [files.clientId], references: [clients.id] }),
  project: one(projects, { fields: [files.projectId], references: [projects.id] }),
  message: one(messages, { fields: [files.messageId], references: [messages.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, { fields: [tasks.userId], references: [users.id] }),
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
  client: one(clients, { fields: [activityLogs.clientId], references: [clients.id] }),
  project: one(projects, { fields: [activityLogs.projectId], references: [projects.id] }),
}));

export const servicesRelations = relations(services, ({ one }) => ({
  user: one(users, { fields: [services.userId], references: [users.id] }),
}));

// ============================================
// BLOG CMS (SEO-Optimized)
// ============================================

export const blogPostStatusEnum = pgEnum("blog_post_status", [
  "draft",
  "published",
  "scheduled",
  "archived",
]);

// Blog Categories
export const blogCategories = pgTable("blog_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Blog Posts
export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => blogCategories.id, { onDelete: "set null" }),

  // Content
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"), // Short summary for listings
  content: text("content").notNull(), // Markdown content

  // Media
  coverImage: text("cover_image"),
  coverImageAlt: text("cover_image_alt"), // Alt text for SEO

  // SEO Meta Tags
  metaTitle: text("meta_title"), // Custom title tag (defaults to title if null)
  metaDescription: text("meta_description"), // Meta description
  metaKeywords: text("meta_keywords"), // Keywords (comma separated)
  canonicalUrl: text("canonical_url"), // Custom canonical URL

  // Open Graph
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),

  // Publishing
  status: blogPostStatusEnum("status").notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  scheduledAt: timestamp("scheduled_at"),

  // Settings
  featured: boolean("featured").default(false),
  allowComments: boolean("allow_comments").default(true),

  // Reading time (auto-calculated)
  readingTimeMinutes: integer("reading_time_minutes"),

  // Tracking
  viewCount: integer("view_count").default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Blog Tags
export const blogTags = pgTable("blog_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Blog Post Tags (Many-to-Many)
export const blogPostTags = pgTable("blog_post_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => blogPosts.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id").notNull().references(() => blogTags.id, { onDelete: "cascade" }),
});

// Blog Relations
export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  author: one(users, { fields: [blogPosts.authorId], references: [users.id] }),
  category: one(blogCategories, { fields: [blogPosts.categoryId], references: [blogCategories.id] }),
  tags: many(blogPostTags),
}));

export const blogCategoriesRelations = relations(blogCategories, ({ many }) => ({
  posts: many(blogPosts),
}));

export const blogTagsRelations = relations(blogTags, ({ many }) => ({
  posts: many(blogPostTags),
}));

export const blogPostTagsRelations = relations(blogPostTags, ({ one }) => ({
  post: one(blogPosts, { fields: [blogPostTags.postId], references: [blogPosts.id] }),
  tag: one(blogTags, { fields: [blogPostTags.tagId], references: [blogTags.id] }),
}));

// ============================================
// MILESTONES & ESCROW
// ============================================

export const milestoneStatusEnum = pgEnum("milestone_status", [
  "pending",
  "in_progress",
  "submitted",
  "revision_requested",
  "approved",
  "paid",
]);

export const escrowStatusEnum = pgEnum("escrow_status", [
  "pending",
  "funded",
  "released",
  "refunded",
  "disputed",
]);

// Project Milestones
export const milestones = pgTable("milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: date("due_date"),
  status: milestoneStatusEnum("status").default("pending").notNull(),
  sortOrder: integer("sort_order").default(0),
  deliverables: jsonb("deliverables").$type<string[]>().default([]),
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Escrow Transactions
export const escrowTransactions = pgTable("escrow_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  milestoneId: uuid("milestone_id")
    .notNull()
    .references(() => milestones.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).default("0"),
  status: escrowStatusEnum("status").default("pending").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeTransferId: text("stripe_transfer_id"),
  fundedAt: timestamp("funded_at"),
  releasedAt: timestamp("released_at"),
  refundedAt: timestamp("refunded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Milestone Relations
export const milestonesRelations = relations(milestones, ({ one, many }) => ({
  project: one(projects, { fields: [milestones.projectId], references: [projects.id] }),
  escrowTransactions: many(escrowTransactions),
}));

export const escrowTransactionsRelations = relations(escrowTransactions, ({ one }) => ({
  milestone: one(milestones, { fields: [escrowTransactions.milestoneId], references: [milestones.id] }),
  user: one(users, { fields: [escrowTransactions.userId], references: [users.id] }),
  client: one(clients, { fields: [escrowTransactions.clientId], references: [clients.id] }),
}));

// E-Signature tracking
export const signatures = pgTable("signatures", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: text("entity_type").notNull(), // proposal, contract
  entityId: uuid("entity_id").notNull(),
  signerType: text("signer_type").notNull(), // owner, client
  signerName: text("signer_name").notNull(),
  signerEmail: text("signer_email").notNull(),
  signatureData: text("signature_data").notNull(), // base64 signature image
  signedAt: timestamp("signed_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
