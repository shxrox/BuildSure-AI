# BuildSure-AI: Sri Lankan Digital Site Supervisor & Quantity Surveyor

**BuildSure-AI** is an intelligent web application designed for Sri Lankan homeowners and contractors to design precise 2D/3D architectural floor plans, calculate exact material takeoffs (BoQ) following IQSSL standards, manage blueprints, and track real-time project costs to prevent budget creep.

---

## 🚀 Key Features

- **Precision 2D Drawing Canvas**: Draw walls, position rooms with surface area calculations ($m^2$), and place doors, windows, and furniture items with intelligent snapping.
- **Interactive 3D Spatial Visualizer**: Convert 2D floor plans into real-time 3D environments with lighting, wireframe modes, and camera controls.
- **AI 2D/3D Rendering Studio**: Transform blueprints and sketches into clean architectural renders using integrated Stable Diffusion models.
- **Dynamic Bill of Quantities (BoQ) & Cost Estimation**: Real-time material calculation (bricks, cement bags, sand cubes, floor tiles) decoupled from inflation with custom Sri Lankan LKR unit rate settings.
- **Blueprint & Document Repository**: Secure upload and inline preview for PDF structural drawings, CSV quantity data, and CAD layouts.
- **Milestone & Schedule Management**: Track construction phases from excavation to handover with interactive checklists and custom task generation.
- **Workspace Sharing & Collaboration**: Generate public read-only links for stakeholders and contractors (PRO feature).
- **Secure Subscription & Billing**: Seamless workspace tier upgrades via Stripe Checkout integration.
- **Clerk Authentication**: Encrypted, session-persistent user authentication with automated profile syncing.

---

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons, React Router, Three.js / @react-three/fiber (@react-three/drei)
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Authentication**: Clerk React & Backend SDKs
- **Payments**: Stripe API & Webhooks

---

## 📦 Project Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/buildsure-ai.git
cd buildsure-ai
```

### 2. Environment Variables

Create a `.env` file in your backend and frontend directories with the appropriate credentials.

#### Backend `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

#### Frontend `.env`

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Install Dependencies & Run

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 💳 Stripe Webhook Testing

To test subscription events locally, make sure you have the Stripe CLI installed, then run:

```bash
stripe listen --forward-to localhost:5000/api/webhook
```

---

## 📄 License

© 2026 BuildSure-AI. All rights reserved.
