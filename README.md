# BuildSure-AI: Sri Lankan Digital Site Supervisor & Quantity Surveyor

**BuildSure-AI** is an intelligent web application designed for Sri Lankan homeowners and contractors to design precise 2D/3D architectural floor plans, calculate exact material takeoffs (BoQ) following IQSSL standards, manage blueprints, and track real-time project costs to prevent budget creep.

**Status**: Active Development | **Version**: 1.0.0 | **Last Updated**: 2026-08-18

### Platform Showcase

![Screenshot 1](./frontend/src/assets/1.png)
![Screenshot 2](./frontend/src/assets/2.png)
![Screenshot 3](./frontend/src/assets/3.png)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Authentication & Authorization](#-authentication--authorization)
- [Database Schema](#-database-schema)
- [Payment Integration](#-payment-integration)
- [File Management](#-file-management)
- [AI Service](#-ai-service)
- [Development Workflow](#-development-workflow)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#contributing)
- [License](#-license)

---

## Overview

BuildSure-AI is a comprehensive full-stack platform connecting homeowners, contractors, and administrators in a unified ecosystem for construction project management. The platform leverages AI-powered features, real-time collaboration, and financial management tools to streamline the construction planning and execution process.

### Core Use Cases

1. **Homeowners** - Plan renovation projects, manage contractors, track budgets, and visualize designs
2. **Contractors** - Collaborate on projects, provide cost estimates, track progress, and submit invoices
3. **Administrators** - Monitor platform health, manage users, oversee financials, and access analytics

---

## 🚀 Key Features

### Design & Visualization
- **Precision 2D Drawing Canvas** - Draw walls, position rooms with surface area calculations ($m^2$), and place doors, windows, and furniture items with intelligent snapping.
- **Interactive 3D Spatial Visualizer** - Convert 2D floor plans into real-time 3D environments with lighting, wireframe modes, and camera controls.
- **Blueprint Management** - Interactive canvas for viewing, annotating, and managing architectural blueprints.
- **AI 2D/3D Rendering Studio** - Transform blueprints and sketches into clean architectural renders using integrated Stable Diffusion models.

### Project Management
- **Bill of Quantities (BoQ)** - Automated material takeoff calculations following IQSSL standards
- **Dynamic Cost Estimation** - Real-time material calculation (bricks, cement bags, sand cubes, floor tiles) decoupled from inflation with custom Sri Lankan LKR unit rate settings
- **Milestone & Schedule Tracking** - Track construction phases from excavation to handover with interactive checklists
- **Progress Monitoring** - Real-time project status updates and photo documentation

### Collaboration & Sharing
- **Workspace Sharing** - Generate public read-only links for stakeholders and contractors (PRO feature)
- **Real-Time Collaboration** - Multiple users editing projects simultaneously
- **Comment System** - Inline discussions on project elements
- **Contractor Management** - Invite and manage multiple contractors per project

### Security & Payments
- **Clerk Authentication** - Encrypted, session-persistent user authentication with automated profile syncing
- **Role-Based Access Control** - Homeowner, Contractor, and Admin roles with granular permissions
- **Secure Subscription & Billing** - Seamless workspace tier upgrades via Stripe Checkout integration
- **Webhook Security** - Secure Stripe and Clerk webhook processing

### Admin Features
- **User Management Dashboard** - Monitor user accounts, roles, and subscriptions
- **Financial Analytics** - Revenue tracking, subscription metrics, and financial reports
- **System Health Monitoring** - Real-time platform statistics and error logs
- **Content Management** - Manage project templates, materials library, and unit rates

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│          Frontend (React + TypeScript)                │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Pages:                                          │ │
│  │  - Home, Login, Register                         │ │
│  │  - Admin Dashboard (Health, Financials, Users)  │ │
│  │  - Homeowner Dashboard & Project Workspace      │ │
│  │  - Contractor Dashboard                         │ │
│  │  - AI Render Studio, Blueprint, BOQ Pages       │ │
│  └──────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Components & Services:                         │ │
│  │  - Redux Store, Auth Context                    │ │
│  │  - Three.js & Konva Canvas                      │ │
│  │  - Chart.js & Recharts Visualization            │ │
│  │  - Axios API Client with interceptors           │ │
│  └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
                       ↓ REST API
┌──────────────────────────────────────────────────────┐
│       Backend (Express.js + TypeScript)               │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Routes & Controllers:                          │ │
│  │  - /api/users (Profile, Subscription)           │ │
│  │  - /api/projects (CRUD, Collaboration)          │ │
│  │  - /api/admin (Dashboard, Analytics)            │ │
│  │  - /api/stripe (Payments, Webhooks)             │ │
│  └──────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Middleware:                                     │ │
│  │  - Clerk Authentication                         │ │
│  │  - Role-Based Authorization                     │ │
│  │  - Error Handling & Logging                      │ │
│  │  - Multer File Upload                           │ │
│  └──────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────┐ │
│  │  External Services:                             │ │
│  │  - Clerk Auth API                               │ │
│  │  - Stripe Payments                              │ │
│  │  - Cloudinary Media Management                  │ │
│  │  - AI Service (FastAPI)                         │ │
│  └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
         ↓ Database    ↓ Files      ↓ AI Models
┌──────────────────────────────────────────────────────┐
│     Data Layer & External Services                   │
│  • MongoDB (Users, Projects, Subscriptions)         │
│  • Cloudinary (Images, Blueprints, Documents)       │
│  • Python FastAPI (AI Rendering & Analysis)         │
└──────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | React | 19.2.7 |
| **Build Tool** | Vite | 8.1.1 |
| **Language** | TypeScript | 6.0.2 |
| **Styling** | Tailwind CSS | 4.3.3 |
| **UI Icons** | Lucide React | 1.30.0 |
| **Routing** | React Router DOM | 7.18.1 |
| **State Management** | Redux Toolkit | 2.12.0 |
| **HTTP Client** | Axios | 1.18.1 |
| **Form Validation** | React Hook Form + Zod | 7.81.0 + 4.4.3 |
| **3D Graphics** | Three.js + React Three Fiber | 0.185.1 + 9.7.0 |
| **Canvas Drawing** | Konva + React Konva | 10.3.0 + 19.2.5 |
| **Charts** | Chart.js + Recharts | 4.5.1 + 3.10.1 |
| **Animation** | Framer Motion | 12.42.2 |
| **Authentication** | Clerk React | 5.61.9 |

### Backend
| Category | Technology | Version |
|----------|-----------|---------|
| **Runtime** | Node.js | 18+ |
| **Framework** | Express.js | 5.2.1 |
| **Language** | TypeScript | 5.8.3 |
| **Database** | MongoDB + Mongoose | 9.7.4 |
| **Authentication** | Clerk Backend | 3.11.6 |
| **Payment Processing** | Stripe | 22.5.0 |
| **File Upload** | Multer | 2.2.0 |
| **Cloud Storage** | Cloudinary | 2.10.0 |
| **Security** | Helmet, CORS | 8.3.0 |
| **Logging** | Morgan | 1.11.0 |
| **Development** | ts-node-dev | 2.0.0 |

### AI Service
| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | FastAPI | 0.110.0 |
| **Server** | Uvicorn | 0.28.0 |
| **ML Framework** | PyTorch | 2.6.0+ |
| **Model Hub** | Hugging Face Transformers | 4.40.0+ |
| **Diffusion Models** | Diffusers | 0.27.2 |
| **Image Processing** | Pillow | 10.3.0+ |
| **Acceleration** | Accelerate | 0.28.0 |

---

## 📁 Project Structure

```
final code/
├── README.md                          # Project documentation (this file)
│
├── ai-service/                        # 🤖 Python AI/ML Service
│   ├── requirements.txt               # Python package dependencies
│   └── app/
│       └── ai-service.ipynb          # Jupyter notebook with AI models
│
├── backend/                           # 🔧 Express.js REST API
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app.ts                    # Express app initialization & middleware setup
│   │   ├── server.ts                 # Server entry point & port listener
│   │   ├── test-cloudinary.ts        # Cloudinary integration test
│   │   │
│   │   ├── config/                   # Configuration files
│   │   │   ├── clerk.ts              # Clerk authentication configuration
│   │   │   ├── cloudinary.ts         # Cloudinary SDK setup
│   │   │   ├── constants.ts          # Application constants & enums
│   │   │   └── database.ts           # MongoDB connection setup
│   │   │
│   │   ├── controllers/              # Business logic handlers
│   │   │   ├── admin.controller.ts   # Admin operations (users, analytics)
│   │   │   ├── project.controller.ts # Project CRUD & collaboration logic
│   │   │   ├── user.controller.ts    # User profile & subscription management
│   │   │   └── stripe.controller.ts  # Payment processing & webhook handling
│   │   │
│   │   ├── enums/                    # TypeScript enumerations
│   │   │   ├── subscription.enum.ts  # Subscription tier levels
│   │   │   └── user-role.enum.ts     # User role types
│   │   │
│   │   ├── middleware/               # Express middleware functions
│   │   │   ├── auth.middleware.ts    # Clerk token verification
│   │   │   ├── error.middleware.ts   # Error handling & logging
│   │   │   ├── role.middleware.ts    # Role-based access control
│   │   │   ├── subscription.middleware.ts  # Subscription validation
│   │   │   ├── upload.middleware.ts  # Multer file upload configuration
│   │   │   ├── notFound.middleware.ts # 404 error handling
│   │   │   └── requirePro.ts         # Pro feature access gate
│   │   │
│   │   ├── models/                   # Mongoose schema definitions
│   │   │   ├── user.model.ts         # User document schema & methods
│   │   │   └── project.model.ts      # Project document schema & methods
│   │   │
│   │   ├── routes/                   # API route definitions
│   │   │   ├── index.ts              # Route aggregator
│   │   │   ├── user.routes.ts        # User endpoints
│   │   │   ├── project.routes.ts     # Project endpoints
│   │   │   ├── admin.routes.ts       # Admin endpoints
│   │   │   └── stripe.router.ts      # Payment endpoints
│   │   │
│   │   ├── services/                 # Business logic services
│   │   │   └── user.service.ts       # User-related operations
│   │   │
│   │   ├── types/                    # TypeScript type definitions
│   │   │   └── express.d.ts          # Express request augmentation
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   └── apiResponse.ts        # Standardized API response formatter
│   │   │
│   │   └── validations/              # Input validation schemas
│   │       └── [validation files]    # Schema validators
│   │
│   └── dist/                         # Compiled JavaScript output
│
├── frontend/                          # ⚛️ React.js Application
│   ├── package.json
│   ├── index.html                    # HTML entry point
│   ├── vite.config.ts                # Vite build configuration
│   ├── tsconfig.json
│   ├── eslint.config.js
│   │
│   └── src/
│       ├── main.tsx                  # React DOM render entry
│       ├── App.tsx                   # Root component wrapper
│       │
│       ├── api/
│       │   └── axios.ts              # Axios instance with interceptors
│       │
│       ├── assets/                   # Static images, videos, fonts
│       │
│       ├── components/               # Reusable React components
│       │   ├── admin/
│       │   │   └── AdminRoute.tsx    # Admin-only route guard
│       │   ├── blueprint/
│       │   │   └── BlueprintCanvas.tsx  # Interactive blueprint viewer
│       │   └── project/
│       │       ├── ProjectHeader.tsx
│       │       ├── ProjectLayout.tsx
│       │       ├── ProjectSidebar.tsx
│       │       └── WorkspaceCard.tsx
│       │
│       ├── config/
│       │   └── clerk.ts              # Clerk provider configuration
│       │
│       ├── context/
│       │   └── AuthContext.tsx       # Authentication context & provider
│       │
│       ├── pages/                    # Page-level components
│       │   ├── Home.tsx              # Landing page
│       │   ├── Login.tsx             # Clerk login form
│       │   ├── Register.tsx          # Clerk registration form
│       │   │
│       │   ├── admin/                # Admin panel pages
│       │   │   ├── AdminDashboard.tsx      # Admin overview
│       │   │   ├── AdminHealthPage.tsx     # System health metrics
│       │   │   ├── AdminFinancialsPage.tsx # Revenue & subscription data
│       │   │   ├── AdminProjectsPage.tsx   # All projects listing
│       │   │   ├── AdminUsersPage.tsx      # User management
│       │   │   └── AdminNavbar.tsx         # Admin navigation
│       │   │
│       │   ├── contractor/           # Contractor pages
│       │   │   └── ContractorDashboard.tsx # Contractor projects view
│       │   │
│       │   ├── homeowner/            # Homeowner pages
│       │   │   ├── HomeownerDashboard.tsx  # Main homeowner dashboard
│       │   │   ├── ProjectDetails.tsx      # Project information page
│       │   │   ├── ProjectWorkspace.tsx    # Project editing workspace
│       │   │   └── SharedWorkspace.tsx     # Shared project access
│       │   │
│       │   └── project/              # Project-specific pages
│       │       ├── AiRenderStudio.tsx      # AI rendering tools
│       │       ├── BlueprintPage.tsx       # Blueprint viewer & editor
│       │       ├── BOQPage.tsx             # Bill of Quantities display
│       │       ├── CollaborationPage.tsx   # Team collaboration view
│       │       ├── CostPage.tsx            # Cost estimation & tracking
│       │       └── ... [other project pages]
│       │
│       ├── routes/                   # Route configuration
│       │   ├── AppRoutes.tsx         # Main route definitions
│       │   └── RoleRoute.tsx         # Role-based route wrapper
│       │
│       ├── services/                 # API service layer
│       │   ├── api.ts                # Axios configuration & setup
│       │   ├── user.service.ts       # User API calls
│       │   └── project.service.ts    # Project API calls
│       │
│       ├── store/                    # Redux store configuration
│       │   └── [Redux slices & store setup]
│       │
│       ├── styles/
│       │   └── index.css             # Global styles & Tailwind imports
│       │
│       ├── types/
│       │   └── user-role.ts          # TypeScript type definitions
│       │
│       └── utils/                    # Utility functions
│           ├── pricingEngine.ts      # Subscription & pricing calculations
│           └── volumetricEngine.ts   # Volume & area calculations
│
└── .env files (in each service directory)
```

---

## Prerequisites

### System Requirements
- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher (or yarn 4.0+)
- **Python** 3.9 or higher (for AI service)
- **Git** 2.0 or higher
- **MongoDB** 5.0+ (local installation or MongoDB Atlas cloud)

### Required API Keys & Services

Before starting development, you must set up accounts and obtain API keys for:

1. **Clerk** - User authentication
   - Website: https://clerk.com
   - Sign up for free account
   - Create application in dashboard
   - Obtain `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

2. **Stripe** - Payment processing
   - Website: https://stripe.com
   - Create account and verify business
   - Enable test mode
   - Obtain `STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`
   - Generate `STRIPE_WEBHOOK_SECRET`

3. **Cloudinary** - Media storage & optimization
   - Website: https://cloudinary.com
   - Create free account
   - Obtain `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

4. **MongoDB** - Database
   - Option A: Local installation
   - Option B: MongoDB Atlas (Cloud) - Free tier available
   - Obtain connection string: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

---

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/shxrox/buildsure-ai.git
cd final\ code
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (see Environment Setup section)
# Copy and fill in the template provided below

# Verify TypeScript compilation
npm run build
```

### Step 3: Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file (see Environment Setup section)
# Copy and fill in the template provided below

# Verify build setup
npm run build
```

### Step 4: AI Service Setup (Optional)

```bash
cd ../ai-service

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python packages
pip install -r requirements.txt

# Verify installation
python -c "import torch; print(torch.__version__)"
```

---

## Environment Setup

### Backend Configuration

Create a file named `.env` in the `backend/` directory:

```env
# =====================================
# Server Configuration
# =====================================
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# =====================================
# Database Configuration
# =====================================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/buildsure-ai

# =====================================
# Clerk Authentication
# =====================================
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# =====================================
# Stripe Payment Processing
# =====================================
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# =====================================
# Cloudinary Media Management
# =====================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=xxxxxxxxxxxxxxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# =====================================
# AI Service Configuration
# =====================================
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your_ai_service_key

# =====================================
# Logging & Debugging
# =====================================
LOG_LEVEL=debug
```

### Frontend Configuration

Create a file named `.env.local` in the `frontend/` directory:

```env
# =====================================
# Clerk Authentication
# =====================================
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# =====================================
# API Configuration
# =====================================
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT=30000

# =====================================
# Feature Flags
# =====================================
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_ADMIN_PANEL=true
VITE_ENABLE_COLLABORATION=true
```

---

## 🚀 Running the Application

### Development Mode (Recommended)

You'll need to run three servers in separate terminals:

**Terminal 1 - Backend API:**
```bash
cd backend
npm run dev
# Output: Server running on http://localhost:5000
```

**Terminal 2 - Frontend Application:**
```bash
cd frontend
npm run dev
# Output: Local: http://localhost:5173/
```

**Terminal 3 - AI Service (Optional):**
```bash
cd ai-service
source venv/bin/activate  # or venv\Scripts\activate on Windows
jupyter notebook app/ai-service.ipynb
# Or alternatively:
# pip install fastapi uvicorn
# uvicorn app.main:app --reload --port 8000
```

### Production Build

**Build Backend:**
```bash
cd backend
npm run build
npm start
# Runs compiled JavaScript from dist/
```

**Build Frontend:**
```bash
cd frontend
npm run build
npm run preview
# Creates optimized production bundle in dist/
```

---

## 📡 API Endpoints

### Authentication Endpoints (Clerk)
All endpoints require Clerk authentication via Bearer token in Authorization header.

```
Authorization: Bearer <clerk-token>
```

### User Endpoints (`/api/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/users/profile` | Get current user's profile | ✅ Required |
| `PUT` | `/api/users/profile` | Update user profile | ✅ Required |
| `GET` | `/api/users/:id` | Get specific user details | ✅ Required |
| `POST` | `/api/users/subscription` | Manage subscription tier | ✅ Required |
| `GET` | `/api/users/subscription/status` | Get subscription status | ✅ Required |

### Project Endpoints (`/api/projects`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/projects` | List user's projects | ✅ Required |
| `POST` | `/api/projects` | Create new project | ✅ Required |
| `GET` | `/api/projects/:id` | Get project details | ✅ Required |
| `PUT` | `/api/projects/:id` | Update project | ✅ Required (Owner) |
| `DELETE` | `/api/projects/:id` | Delete project | ✅ Required (Owner) |
| `POST` | `/api/projects/:id/collaborators` | Add collaborators | ✅ Required (Owner) |
| `GET` | `/api/projects/:id/boq` | Get Bill of Quantities | ✅ Required |
| `POST` | `/api/projects/:id/boq/calculate` | Calculate BOQ | ✅ Required |
| `POST` | `/api/projects/:id/cost-estimate` | Generate cost estimate | ✅ Required |
| `GET` | `/api/projects/:id/files` | List project files | ✅ Required |
| `POST` | `/api/projects/:id/upload` | Upload project files | ✅ Required |

### Admin Endpoints (`/api/admin`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/api/admin/dashboard` | Dashboard overview | ✅ Required | Admin |
| `GET` | `/api/admin/health` | System health status | ✅ Required | Admin |
| `GET` | `/api/admin/users` | List all users | ✅ Required | Admin |
| `GET` | `/api/admin/projects` | List all projects | ✅ Required | Admin |
| `GET` | `/api/admin/financials` | Financial reports | ✅ Required | Admin |
| `PUT` | `/api/admin/users/:id/role` | Update user role | ✅ Required | Admin |
| `PUT` | `/api/admin/users/:id/status` | Update user status | ✅ Required | Admin |

### Payment Endpoints (`/api/stripe`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/stripe/create-checkout` | Create checkout session | ✅ Required |
| `POST` | `/api/stripe/webhook` | Stripe webhook handler | ❌ Webhook Secret |
| `GET` | `/api/stripe/subscription/status` | Get subscription info | ✅ Required |
| `POST` | `/api/stripe/cancel-subscription` | Cancel subscription | ✅ Required |

### Response Format

All successful API responses follow this format:

```json
{
  "success": true,
  "statusCode": 200,
  "data": { /* endpoint-specific data */ },
  "message": "Operation successful"
}
```

Error responses:

```json
{
  "success": false,
  "statusCode": 400,
  "error": "Error message",
  "details": { /* additional error context */ }
}
```

---

## 🔐 Authentication & Authorization

### Clerk Authentication Flow

1. User visits application
2. Clerk React SDK redirects to Clerk sign-in page
3. User enters credentials or uses OAuth (Google, GitHub, etc.)
4. Clerk issues signed JWT token
5. Token stored in browser localStorage/sessionStorage
6. Token included in HTTP header for API requests
7. Backend verifies token via Clerk middleware
8. User context attached to request object

### User Roles

| Role | Permissions | Features |
|------|-------------|----------|
| **Homeowner** | Create projects, invite contractors, manage costs | Dashboard, Project creation, Team management |
| **Contractor** | View assigned projects, upload work, collaborate | Contractor dashboard, Project access, Comments |
| **Admin** | Full system access, user management, analytics | Admin panel, All features, User oversight |

### Subscription Tiers

| Tier | Cost | Duration | Features |
|------|------|----------|----------|
| **Trial Pass** | $5 | Per Day (24-hour access) | Full Workspace Access: 2D Drawing Canvas, Smart Area Calculator, IQSSL Material Takeoffs, Live Cost Estimation & BOQ, Team Collaboration, File Management, Milestone Tracking, Custom Unit Rates, Instant Checkout, Priority Support |
| **Extended Pro Plan** | $25 | Every 6 Months ⭐ Best Value | Full Workspace Access: 2D Drawing Canvas, Smart Area Calculator, IQSSL Material Takeoffs, Live Cost Estimation & BOQ, Team Collaboration, File Management, Milestone Tracking, Custom Unit Rates, Instant Checkout, Priority Support |
| **Annual Plan** | $50 | Per Year | Full Workspace Access: 2D Drawing Canvas, Smart Area Calculator, IQSSL Material Takeoffs, Live Cost Estimation & BOQ, Team Collaboration, File Management, Milestone Tracking, Custom Unit Rates, Instant Checkout, Priority Support |

**All plans include:**
- Precision 2D Drawing Canvas with intelligent snapping
- Smart Wall & Room Area Calculator
- IQSSL Standard Material Takeoffs
- Live Cost Estimation & BOQ
- Collaborative Team & Contractor Sharing
- Blueprint & Document File Management
- Milestone & Project Phase Tracking
- Customizable Unit Rate Settings (LKR)
- Instant Stripe Checkout Integration
- Priority Support & Updates

### Authorization Middleware

```typescript
// Backend middleware checks:
auth.middleware.ts        // Clerk token validation
role.middleware.ts        // Role-based access control
subscription.middleware.ts // Feature access by tier
requirePro.ts            // Pro feature gating
```

---

## 💳 Payment Integration

### Stripe Integration Architecture

1. **Subscription Creation**
   - User selects tier and clicks "Upgrade"
   - Frontend creates Stripe Checkout session via `/api/stripe/create-checkout`
   - Backend generates Stripe session with pricing tier
   - Redirects user to Stripe Checkout

2. **Payment Processing**
   - User enters payment card details on Stripe
   - Stripe processes payment securely
   - Sends confirmation webhook to backend

3. **Webhook Handling**
   - Stripe sends `checkout.session.completed` event
   - Backend validates webhook signature using `STRIPE_WEBHOOK_SECRET`
   - Updates user subscription status in MongoDB
   - Unlocks Pro features

4. **Subscription Management**
   - Users can view subscription status in settings
   - Cancel via Stripe portal or app
   - Automatic renewal on billing date

### Testing Stripe Locally

```bash
# Install Stripe CLI from: https://stripe.com/docs/stripe-cli

# Forward events to local server
stripe listen --forward-to localhost:5000/api/stripe/webhook

# Get the webhook signing secret (output by stripe listen)
# Add to .env: STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Test payment in test mode (use test card: 4242 4242 4242 4242)
# All charges will be simulated
```

---

## 📤 File Management

### Cloudinary Integration

Files uploaded in the application (blueprints, project images, BOQ documents) are processed through Cloudinary:

1. **Upload Flow**
   - User selects file via form
   - Multer middleware validates file size/type
   - File streamed to Cloudinary
   - Returns secure URL and public ID

2. **Supported File Types**
   - Images: JPG, PNG, WebP, GIF
   - Documents: PDF (blueprints)
   - Data: CSV (BOQ templates)

3. **File Organization**
   - Organized by project and upload type
   - Automatic transformation and optimization
   - Secure URLs with expiration options

### Upload Configuration

```typescript
// backend/src/middleware/upload.middleware.ts
multer({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: validateFileType,
  storage: storageEngine
})
```

---

## 🤖 AI Service

The AI service provides intelligent features for project visualization and analysis:

### Features

- **Image Generation** - Create architectural renderings from descriptions
- **Style Transfer** - Apply architectural styles to sketches
- **Object Detection** - Extract furniture and features from images
- **3D Model Generation** - Convert 2D plans to 3D models
- **Material Analysis** - Identify materials from photos

### Running AI Service

**Option 1: Jupyter Notebook**
```bash
cd ai-service
source venv/bin/activate
jupyter notebook app/ai-service.ipynb
# Access at http://localhost:8888
```

**Option 2: FastAPI Server**
```bash
cd ai-service
source venv/bin/activate

# Install FastAPI
pip install fastapi uvicorn

# Create app/main.py with your API routes
uvicorn app.main:app --reload --port 8000
```

### API Integration

Frontend calls AI service through backend proxy:

```typescript
// frontend/src/services/project.service.ts
const generateRender = async (projectId: string, prompt: string) => {
  const response = await api.post(`/projects/${projectId}/ai-render`, {
    prompt,
    style: 'architectural'
  });
  return response.data;
};
```

Backend relays to AI service:

```typescript
// backend/src/controllers/project.controller.ts
const response = await fetch(`${process.env.AI_SERVICE_URL}/render`, {
  method: 'POST',
  body: JSON.stringify({ ...request.body }),
  headers: { 'Content-Type': 'application/json' }
});
```

---

## 📊 Database Schema

### User Model

```javascript
{
  _id: ObjectId,
  clerkId: String (unique),          // Unique Clerk ID
  email: String (unique),             // User email
  firstName: String,                  // Given name
  lastName: String,                   // Family name
  profileImage: String,               // Avatar URL (Cloudinary)
  role: Enum ['HOMEOWNER', 'CONTRACTOR', 'ADMIN'],
  
  subscription: {
    tier: Enum ['trial', 'pro', 'annual'],
    status: Enum ['active', 'cancelled', 'expired'],
    startDate: Date,
    endDate: Date,
    renewalDate: Date,
    stripeCustomerId: String,
    stripePriceId: String,
    stripeSubscriptionId: String
  },
  
  projects: [ObjectId],               // Array of project IDs
  collaboratedProjects: [ObjectId],   // Projects user collaborates on
  
  preferences: {
    currency: String,                 // Default: 'LKR'
    language: String,                 // Default: 'en'
    theme: String                     // 'light' or 'dark'
  },
  
  metadata: {
    lastLogin: Date,
    loginCount: Number,
    phoneNumber: String
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### Project Model

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  owner: ObjectId (User reference),
  
  collaborators: [{
    userId: ObjectId,
    role: Enum ['viewer', 'editor', 'owner'],
    addedAt: Date
  }],
  
  location: {
    address: String,
    city: String,
    province: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  status: Enum ['planning', 'in-progress', 'completed', 'paused'],
  
  budget: {
    allocated: Number (LKR),
    spent: Number (LKR),
    estimated: Number (LKR)
  },
  
  timeline: {
    startDate: Date,
    expectedEndDate: Date,
    actualEndDate: Date
  },
  
  boq: [{                             // Bill of Quantities
    itemId: ObjectId,
    description: String,
    unit: String,                      // 'units', 'sqm', 'cum', 'bags', etc.
    quantity: Number,
    unitRate: Number,
    total: Number,
    category: String                   // 'materials', 'labor', etc.
  }],
  
  files: {
    blueprints: [String],             // Cloudinary URLs
    images: [String],
    documents: [String],              // PDFs, CSVs
    renders: [String]                 // AI-generated images
  },
  
  workspace: {
    canvas: Object,                   // 2D drawing data (Konva JSON)
    model3D: Object,                  // 3D model data (Three.js JSON)
    annotations: [Object]             // Comments and markup
  },
  
  metadata: {
    area: Number,                      // Total area in sqm
    volume: Number,                    // Total volume in cum
    views: Number,                     // Project view count
    likes: Number
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Development Workflow

### Code Style & Standards

```bash
# Run ESLint to check code quality
cd frontend
npm run lint

# Fix formatting issues automatically
npm run lint -- --fix
```

### Creating New Features

1. **Create Backend Endpoint**
   ```bash
   # Add controller method
   # Add route in routes/
   # Test with API client (Postman, Thunder Client)
   ```

2. **Add API Service Call**
   ```bash
   # Update frontend/src/services/
   # Create typed API call with error handling
   ```

3. **Build Frontend Component**
   ```bash
   # Create component in pages/ or components/
   # Use API service method
   # Add Redux state if needed
   ```

4. **Test Thoroughly**
   ```bash
   # Test all user roles
   # Test subscription tiers
   # Test error states
   ```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

---

## 🐛 Troubleshooting

### Common Issues

#### Frontend Won't Connect to Backend

**Problem**: `GET http://localhost:5000/api/... ERR_CONNECTION_REFUSED`

**Solutions**:
1. Verify backend is running: `npm run dev` in backend folder
2. Check backend is on port 5000: Look for "Server running on http://localhost:5000"
3. Verify CORS settings in `backend/src/app.ts`:
   ```typescript
   cors({
     origin: "http://localhost:5173",
     credentials: true,
   })
   ```
4. Verify frontend `.env.local`: `VITE_API_BASE_URL=http://localhost:5000/api`

#### Clerk Authentication Not Working

**Problem**: Redirected to login loop or "Authentication failed"

**Solutions**:
1. Verify Clerk keys in `backend/.env` and `frontend/.env.local`
2. Check Clerk dashboard > API Keys > Keys match your `.env`
3. Add localhost URLs to Clerk dashboard > Settings > Paths:
   - Development URL: `http://localhost:5173`
   - Allowed URLs: `http://localhost:5173, http://localhost:5000`
4. Restart both frontend and backend after changing env vars

#### MongoDB Connection Error

**Problem**: `MongoServerError: connect ECONNREFUSED` or timeout

**Solutions**:
1. **If using local MongoDB**:
   ```bash
   # Check if MongoDB is running
   mongosh  # Test connection
   ```

2. **If using MongoDB Atlas**:
   - Verify connection string format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`
   - Check IP whitelist: MongoDB Atlas > Security > Network Access
   - Add your current IP or `0.0.0.0/0` for development
   - Verify username/password are URL-encoded (especially special characters)

3. **Test connection string**:
   ```bash
   # In backend folder
   mongosh "mongodb+srv://username:password@cluster.mongodb.net/dbname"
   ```

#### Cloudinary Upload Fails

**Problem**: `Invalid Cloudinary configuration` or upload timeout

**Solutions**:
1. Verify Cloudinary credentials in `backend/.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=xxx
   CLOUDINARY_API_KEY=xxx
   CLOUDINARY_API_SECRET=xxx
   ```
2. Check file size limit (default 50MB in upload.middleware.ts)
3. Verify file type is allowed in `upload.middleware.ts`
4. Test upload separately:
   ```bash
   node backend/src/test-cloudinary.ts
   ```

#### Stripe Webhook Not Receiving Events

**Problem**: Subscription not updating after payment, webhook shows failed in Stripe dashboard

**Solutions**:
1. Verify webhook secret matches exactly:
   ```bash
   # Stripe CLI shows: whsec_xxxxx
   # .env must have: STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

2. Use Stripe CLI to test locally:
   ```bash
   stripe login  # Authenticate with Stripe account
   stripe listen --forward-to localhost:5000/api/stripe/webhook
   ```

3. Check webhook endpoint in Stripe dashboard:
   - Endpoint URL: `http://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`

4. View webhook logs:
   ```bash
   # Stripe CLI
   stripe logs tail
   
   # Or check Stripe dashboard > Webhooks > [endpoint] > Events
   ```

#### TypeScript/Build Errors

**Problem**: `Property does not exist` or `Type not assignable`

**Solutions**:
1. Restart TypeScript server in VS Code: `Ctrl+Shift+P` > "TypeScript: Restart TS Server"
2. Clear build cache:
   ```bash
   # Backend
   cd backend && rm -rf dist && npm run build
   
   # Frontend
   cd frontend && rm -rf dist && npm run build
   ```
3. Ensure all dependencies are installed: `npm install`

#### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions**:
```bash
# Find and kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :5000
kill -9 <PID>

# Or change port in backend .env:
PORT=5001
```

---

## Contributing

### How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Add types for all function parameters
- Write meaningful commit messages
- Test changes across all user roles
- Update this README if adding major features
- Ensure no console errors or warnings

---

## 📄 License

© 2026 BuildSure-AI. All rights reserved. ISC License

---

## 📞 Support & Contact

For technical support, feature requests, or bug reports:

1. **Check Troubleshooting Guide** - See section above
2. **Review Documentation** - This README covers most scenarios
3. **Create GitHub Issue** - With detailed description and error logs
4. **Contact Development Team** - For urgent issues

---

**Last Updated**: August 18, 2026  
**Project Status**: Active Development  
**Version**: 1.0.0-alpha  

