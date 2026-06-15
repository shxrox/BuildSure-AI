# BuildSure-AI

Fix Your Budget Before You Build. A SaaS-Based Digital Architect & Live Quantity Surveyor Platform.

## Architecture Overview

BuildSure-AI is engineered using a Decoupled Microservices Architecture to ensure high-intensity tasks do not interfere with the smooth operation of the drafting canvas.

### 1. Frontend (`/frontend`)
A React-based Single Page Application (SPA) using TypeScript. It manages the interactive 2D canvas logic locally on the user's browser for maximum responsiveness using React-Konva.

### 2. Backend Server (`/backend`)
A Node.js and Express API. It handles the heavy mathematical lifting for volumetric calculations, manages data flow, and interacts with MongoDB Atlas.

### 3. AI Microservice (`/ai-engine`)
A local Python-based FastAPI service dedicated to processing visual styles using quantized models (Stable Diffusion v1.5 and ControlNet).

## Technology Stack
* **Frontend:** React, TypeScript, Konva.js, Clerk (Auth)
* **Backend:** Node.js, Express, MongoDB Atlas, Stripe API
* **AI Engine:** Python, FastAPI, PyTorch, Hugging Face Diffusers
* **DevOps:** GitHub, Vercel/Render CI/CD

## Git Workflow
This repository follows standard feature-branching and semantic commit messages (e.g., `feat:`, `fix:`, `chore:`, `docs:`).