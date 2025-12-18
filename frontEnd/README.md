# Appointly Frontend

Appointly is a full-featured scheduling experience for customers, service providers, support analysts, and business owners. This React + Vite client implements every user story defined in the TAC technical report with a refined UI that follows the royal blue palette provided.

## ✨ Feature Highlights
- **Customer Portal** – Search, filter, and sort services; book appointments with real-time availability checks; confirm, reschedule, cancel, and review bookings.
- **Provider Workspace** – Manage availability, approve or decline booking requests, and analyse client history with feedback insights.
- **Support Desk** – Locate bookings instantly, open/track support tickets, and log follow-ups for audit requirements.
- **Owner Command Centre** – Maintain services and staffing, assign providers to offerings, review analytics dashboards, and export revenue reports.

## 🛠️ Tech Stack
- React 19 + Vite 7
- React Router 6 for routing
- Axios for API communication
- Recharts for analytics visualisations
- CSS (utility-driven with custom variables) for a premium interface

## 🔧 Local Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Provide API configuration (defaults to `http://localhost:5000/api`). If you need a different backend URL, create a `.env` file in this folder and set:
   ```bash
   VITE_API_URL=http://localhost:5000/api
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Lint the project:
   ```bash
   npm run lint
   ```

> **Note:** Some dev dependencies (ESLint/Vite) warn about Node engine requirements ≥ 18.18.0. If you are on Node 18.17 (as in the lab environment) you can ignore the warning; the tooling still runs successfully.

## 📁 Project Structure
```
src
├── api/                # Axios client plus REST helpers per domain
├── components/         # Layout primitives, reusable cards and inputs
├── contexts/           # Auth context with session lifecycle
├── hooks/              # Custom hooks (e.g., useAuth)
├── pages/              # Feature pages for each persona
│   ├── auth/           # Login & registration
│   ├── customer/       # Customer journeys (search, booking, confirmation)
│   ├── provider/       # Availability, requests, history
│   ├── support/        # Support desk toolkit
│   ├── owner/          # Data management, analytics, reporting
│   └── common/         # Shared route pages (404, unauthorized)
└── utils/              # Navigation mapping and helpers
```

## 🔐 Authentication Workflow
- Sessions rely on HTTP-only cookies set by the backend. The `AuthContext` automatically refreshes profiles, displays loading states, and gates routes by role.
- Route protection is handled inside `App.jsx` via `ProtectedRoute` and `RoleGate` components.

## 🎨 Design System
- Palette: Royal Blue (`#2563EB`), Light Gray (`#F3F4F6`), Warm Orange (`#F97316`), and Charcoal text (`#1F2937`).
- Components incorporate subtle gradients, glassmorphism panels, and consistent spacing for a polished enterprise feel.

## ✅ Test Checklist
- `npm run lint` – verifies syntax and best practices.
- Booking flow end-to-end: customer books → confirmation email triggered (mock) → provider approves → owner analytics updates.

For backend bootstrapping, refer to `../backEnd/README.md` (or create one) and ensure MongoDB + Node server are running before launching the frontend. The frontend expects the API endpoints defined in the Appointly Express server.

