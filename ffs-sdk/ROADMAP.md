<!--
📌 Context: This roadmap was created to align the Flying Fox Template Library project with the company’s real business goals, product strategy, and long-term vision.
It should be used as a guiding reference for Sprint 1 planning, backlog prioritization, folder structure, and template generation decisions.
It connects directly to the GitHub Project Board “Cursor Trial Sprint – Template Library” and should inform how components, blueprints, and archetypes are designed.
-->

# 🚀 Flying Fox Template Library – Project Roadmap

**Time Horizon:** 6–24 Months  
**Owner:** Flying Fox Solutions  
**Repository:** Cursor Trial Sprint – Template Library

---

## 🧭 Overview & Purpose

The **Flying Fox Template Library** is a strategic initiative to dramatically accelerate the development of client projects and internal products, reduce Cursor token usage by 50–90%, and potentially replace or downgrade reliance on Lovable.

This library will serve as a **core engine** for Flying Fox’s business over the next 2 years, powering both revenue-critical client builds and experimental product prototypes. It will include:

- 🧩 Reusable atomic components
- 🏗️ Prebuilt blueprint starters
- 🏢 Full-stack product archetypes
- 🔌 Integration stubs and API connectors

Our goal is to build a scalable library that lets Flying Fox **launch apps, portals, dashboards, and SaaS tools in days, not weeks** — while remaining flexible enough to serve multiple industries and recurring use cases.

---

## 🛠️ 1. Project Types – Planned Builds (6–24 Months)

### 📦 Client-Facing Solutions

- **Custom Dietary Restrictions Web App** – User-defined food avoidance tool with multiple data source integration.
- **Connected Health Tracking Portal** – Syncs with Wi-Fi/Bluetooth fitness devices for weight and health metrics tracking.
- **Whirled Languages Conversational Platform** – Multi-user language exchange app with teacher pairing tools, print/export, and OCR digitization.
- **Subscription Billing & Auto-Pay Portal** – Handles recurring payments, invoicing, and billing management with Stripe, Square, and ACH.
- **Small Business POS System Starter** – Square-based POS with HubSpot, delivery service, and accounting integrations.
- **Branded Website & Client Portal Builder** – Rapid website builder with integrated payments, CRM, and messaging tools.

### 🧰 Internal Products

- **Flying Fox Analytics & Billing Dashboard** – Internal performance, SMS usage, and revenue tracking.
- **Client Onboarding & Account Setup Portal** – Automated client onboarding with integration provisioning.
- **Automated SMS Marketing Workflow Builder** – No-code SMS campaign builder with scheduling and analytics.

### 🧪 Experiments & Proof-of-Concepts

- **Advanced Allergy Checker App** – Multi-API allergy and ingredient database with filtering and scoring.
- **Outdoor Program Micro-CRM** – Lightweight CRM for camps and experiential programs.
- **Custom Feedback & Survey Builder** – Flexible survey platform with SMS/email follow-ups and analytics.

### 🧱 Reusable Component Families

- **Auth & User Management:** Sign-up/login, multi-role access, OAuth, onboarding.
- **Dashboards & Portals:** Modular layouts, analytics widgets, settings pages, notifications.
- **Messaging Modules:** SMS composer, analytics, two-way chat, template editor.
- **Billing Components:** Pricing tables, checkout flows, auto-pay UI, invoice management.
- **Admin Tools:** Management tables, search/filter utilities, bulk actions, export features.
- **Forms & Data:** Dynamic builders, feedback forms, onboarding flows, file upload + OCR.
- **Integration Stubs:** SlickText, Square, Stripe, HubSpot, Xero, Zoho connectors.

---

## 💰 2. Priority & Revenue Potential

| Project Name                            | Type         | Priority | Revenue (1–5) | Notes                                          |
| --------------------------------------- | ------------ | -------- | ------------- | ---------------------------------------------- |
| Small Business POS System Starter       | Client       | 🟢       | 5             | Core revenue driver with integrations.         |
| Subscription Billing & Auto-Pay Portal  | Client       | 🟢       | 5             | Critical recurring revenue tool.               |
| Branded Website & Client Portal Builder | Client       | 🟢       | 4             | Scales client onboarding and service delivery. |
| Custom Dietary Restrictions Web App     | Client       | 🟡       | 3             | Expands into health/wellness markets.          |
| Connected Health Tracking Portal        | Client       | 🟡       | 3             | Adds new verticals (fitness, nutrition).       |
| Whirled Languages Platform              | Client       | 🧪       | 2             | Long-term potential; larger build.             |
| Analytics & Billing Dashboard           | Internal     | 🟡       | 4             | Increases visibility and strategic planning.   |
| Onboarding & Account Setup Portal       | Internal     | 🟡       | 4             | Speeds client setup and provisioning.          |
| Automated SMS Workflow Builder          | Internal     | 🟢       | 5             | Central to SMS reselling business.             |
| Advanced Allergy Checker                | Experimental | 🧪       | 2             | Potential SaaS product.                        |
| Outdoor Program Micro-CRM               | Experimental | 🧪       | 2             | Niche vertical opportunity.                    |
| Feedback & Survey Builder               | Experimental | 🟡       | 3             | Useful internal tool and client add-on.        |

---

## 🧰 3. Tech Stack Preferences – Recommended Setup

### ⚛️ Frontend

- **React** – UI framework for component reusability
- **Vite** – Fast dev server and bundler
- **Tailwind CSS** – Utility-first styling
- **Framer Motion** _(optional)_ – Animated, polished UX

### 🛠️ Backend

- **Next.js** _(recommended)_ – Full-stack framework with API routes
- **Node.js + Express** _(optional)_ – Lightweight standalone services
- **Supabase** – Database (Postgres), Auth, and Storage
- **Prisma** _(optional)_ – ORM for advanced database work

### 🗄️ Database & Auth

- **Supabase Postgres** – Primary database
- **Supabase Auth** – Built-in authentication
- **Row-Level Security (RLS)** – Multi-tenant isolation

### 🔌 Integrations

- **SlickText** – SMS messaging
- **Square** – POS & payments
- **Stripe** – Subscriptions & billing
- **HubSpot** – CRM integration
- **Xero / Zoho Books** – Accounting
- **DoorDash / UberEats** _(optional)_ – Delivery service integration

### 🔁 Automations

- **Zapier** – Quick MVP workflows
- **Make (Integromat)** – Complex automations
- **n8n** _(optional)_ – Self-hosted automation

### ☁️ Hosting

- **GitHub Pages / Netlify** – Static frontends
- **Vercel** – Full-stack deployments
- **Supabase** – Backend hosting
- **Railway / Render** _(optional)_ – API services

---

## 🧱 4. Template Style Strategy – Atomic → Blueprint → Archetype

**Recommended Approach: 🌀 Hybrid (All Three Levels)**

| Layer                     | Description                            | Examples                                        | Priority   |
| ------------------------- | -------------------------------------- | ----------------------------------------------- | ---------- |
| 🧩 **Atomic Components**  | Reusable UI and logic pieces           | Buttons, forms, auth flows, analytics cards     | 🔥 Highest |
| 🏗️ **Blueprint Starters** | Fully functional modules and mini-apps | Subscription portal, POS starter, SMS dashboard | 🔥 High    |
| 🏢 **Archetypes**         | Full SaaS-ready product templates      | POS SaaS, SMS SaaS, Branded Client Portal       | 🟡 Medium  |

📅 **Rollout Plan:**

- **Month 1–2:** Build core atomic components
- **Month 2–4:** Develop key blueprint starters
- **Month 4–8:** Assemble archetypes from blueprints
- **Month 8–24:** Expand with vertical-specific archetypes

---

## 🔄 5. Future-Proofing – Industries & Recurring Use Cases

### 🎯 Target Industries

| Industry                            | Why It Matters             | Templates to Prioritize           |
| ----------------------------------- | -------------------------- | --------------------------------- |
| 📱 Small Businesses & Retail        | Core client base           | POS, billing, SMS, portals        |
| 🎪 Event Management                 | Messaging & consulting fit | Check-in, feedback, messaging     |
| 🏫 Education & Outdoor Programs     | Strong repeat need         | Micro-CRM, scheduling, onboarding |
| 🩺 Health, Wellness & Nutrition     | Expanding niche            | Allergy apps, health tracking     |
| 📊 Professional Services & Agencies | Upsell potential           | Portals, billing, analytics       |

### 🔁 Recurring Use Cases

- 💳 Subscription & Payment Flows
- 📩 Messaging & Engagement Tools
- 🗂️ Client Portals & Dashboards
- 🧑‍💼 Onboarding & Intake Flows
- 📊 Analytics & Reporting Modules
- 🌐 Integration-Ready Templates

**Strategic Principles:**

- **Design once, deploy many** – Templates should work across multiple industries.
- **Abstract integrations** – Swap APIs without rewriting core logic.
- **Plan for multi-tenancy** – Use RLS and modular architecture early.
- **Template the essentials** – Auth, billing, messaging, dashboards first.

---

## ✅ Next Steps

1. **Seed the Library:** Begin with high-leverage atomic components (auth, dashboard cards, forms).
2. **Blueprint Core Starters:** Prioritize POS, subscription billing, and SMS dashboard starters.
3. **Build Archetypes:** Assemble SaaS-ready templates targeting your top industries.
4. **Document Everything:** Include README files, usage notes, and integration examples in each folder.
5. **Iterate & Automate:** Continuously improve components and automate generation workflows to reduce token usage.

---

## 📊 Expected Outcomes

- 🚀 **50–90% Cursor token reduction** through heavy reuse of components and scaffolding
- 💼 **Faster client delivery** — spin up projects in hours, not weeks
- 📈 **Higher margins & scalability** by building reusable SaaS foundations
- 🧰 **Reduced dependency on Lovable** by owning your scaffolding and starter code
- 🌍 **Platform for future SaaS products** with prebuilt billing, auth, and messaging systems

---
