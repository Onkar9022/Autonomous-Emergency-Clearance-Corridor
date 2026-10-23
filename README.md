# Autonomous Emergency Corridor Creator System (AECC)

**Project Team:** Team Sanjivani  
**Project Category:** AI-Powered Intelligent Transportation System, Emergency Response Automation, Smart City, and Healthcare Infrastructure  
**Deployment Region:** Solapur, Maharashtra, India (17.6690° N, 75.9064° E)  
**Database:** Neon Cloud Serverless PostgreSQL (`ep-delicate-mode-b5p6z6jp`)

---

## 1. Executive Summary

The **Autonomous Emergency Corridor Creator System (AECC)** is an intelligent emergency mobility platform engineered to drastically decrease ambulance response and transit times. By integrating real-time telemetry from ambulances, automated multi-criteria hospital selection, neural road routing via OSRM, and dynamic traffic signal preemption, AECC creates synchronized priority green corridors through municipal intersections.

---

## 2. Platform Architecture

The platform provides two seamlessly connected experiences backed by an authoritative PostgreSQL server:

### A. Public Project Website (`/` or `/#hero`)
- **Branding & Visual Identity:** Warm ivory canvas (`#F5F7F2`), deep navy headings (`#102A43`), emergency coral accents (`#F05A47`), and corridor green indicators (`#22A06B`).
- **Three Core Units:** Ambulance Unit (Mobile Edge), Smart Roundabout Unit (Roadside Gateways), and Hospital Clinical Triage Unit.
- **Roundabout Geometry Spotlight:** Autonomous circulatory lane flushing and dynamic feeder holding with precision emergency trajectory.
- **Responsive CAD Model Viewer:** 6 authentic SolidWorks CAD perspectives (Perspective, Top, Front, Right, Back, Bottom).
- **10-Stage Life Corridor Workflow:** From driver hardware trigger to civilian traffic restoration.
- **Project Team:** Guide Prof. V.D. Gaikwad, Ritesh Kulkarni, Srushti Sakhare, Pratik Gundla, and Vaishnavi Pardeshi with infinite marquee carousel.

### B. AECC Operations Console (`/#console/...`)
A command-center operational platform featuring 13 dedicated sections aligned with the AECC visual identity:
1. **Overview Dashboard:** 8 real-time KPI cards derived from PostgreSQL state, central Leaflet operations map, and active emergency operations panel.
2. **Live Emergency Map:** Full-height municipal GIS map with CartoDB Voyager tiles and layer toggles (Ambulances, Hospitals, Incidents, Signals, Routes, Corridors).
3. **Create Emergency:** Full incident registration form with Solapur presets, patient triage, and dispatch confirmation modal.
4. **Route Optimization:** Multi-route comparison (Route 1, Route 2, Route 3) with transparent mathematical scoring breakdown (time, distance, congestion, signals).
5. **Nearby Hospitals:** Autonomous multi-criteria hospital ranking evaluating trauma readiness, ICU availability, road distance, and travel duration, strictly preserving unknown capacities as unknown.
6. **Green Corridor Control:** Signature feature displaying signal sequence timeline, live state lights, arrival countdown per intersection, and safety interlocks.
7. **Traffic Signal Network:** Searchable table of municipal signals with connectivity status and virtual state toggles (RBAC protected).
8. **Ambulance Fleet:** Telematics roster tracking vehicle equipment, battery/fuel, driver info, and dispatch availability.
9. **AI Traffic Intelligence:** Solapur arterial road segment analysis and 24-hour municipal traffic density curves.
10. **Incident History:** Searchable audit trail of emergency dispatches with CSV export functionality.
11. **Analytics and Reports:** Quantitative reports on transit time savings, response time improvements, and hospital distribution.
12. **System Health:** Live diagnostics and ping tests for PostgreSQL database, OSRM routing engine, map tiles, and memory metrics.
13. **Settings:** Operational mode switcher (`SIMULATION` vs `LIVE INTEGRATION`), role selector, and state reset controls.

---

## 3. Technology Stack

### Frontend
- **Framework:** React 19, Vite, Tailwind CSS v4, Lucide React
- **Geospatial & Mapping:** Leaflet 1.9.4 with CartoDB Voyager tiles (authenticated API key `cb1_4t4k_1_f757e6cf9484a7b7f74e78d5`) and vector fallback
- **Routing Engine:** Open Source Routing Machine (OSRM) Driving API + deterministic fallback geometry
- **Storage Adapter:** `PostgresBackendStorageAdapter` with live synchronization to Express API and graceful offline fallback

### Backend (`server/`)
- **Runtime:** Node.js, Express, TypeScript (TSX)
- **Database:** Neon PostgreSQL (AWS us-east-2) with Prisma ORM 5.22
- **Validation:** Zod schemas for all request payloads
- **Security & Auth:** JSON Web Tokens (JWT), bcrypt password hashing, and role-based access control (RBAC)

---

## 4. Database Schema & Models

The PostgreSQL database contains normalized models with foreign keys, indexes, and audit logging:
- `User`: Roles (`ADMINISTRATOR`, `EMERGENCY_OPERATOR`, `READ_ONLY_OBSERVER`), bcrypt hashes, departments.
- `Hospital`: 5 Solapur hospitals with trauma levels, bed capacities, and unverified feed provenance (`isVerifiedSource`).
- `Ambulance`: 4 emergency fleet vehicles with clinical equipment, telematics, and mutual-exclusion assignment locking.
- `Incident`: Emergency incident records with geographic coordinates, triage tiers, timestamps, and relations.
- `RouteAlternative`: Multi-route evaluation records with geometry polylines and transparent score breakdowns.
- `GreenCorridor`: Dynamic corridor coordination records with ordered signal sequences.
- `TrafficSignal`: 6 Solapur smart intersections with states (`RED`, `AMBER`, `GREEN`, `PRIORITY_ACTIVE`).
- `IncidentAuditLog`: Chronological immutable event logs for every dispatch, state change, and handover.
- `SystemSetting`: Key-value operational configuration.

---

## 5. Pre-Configured Test Accounts (RBAC)

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@aecc.gov` | `Admin@AECC2026!` | Full system management, settings, reset, dispatches |
| **Emergency Operator** | `operator@aecc.gov` | `Operator@AECC2026!` | Dispatch emergencies, assign ambulances, override signals |
| **Read-Only Observer** | `observer@aecc.gov` | `Observer@AECC2026!` | View dashboards, logs, and telemetry; writes rejected (403) |

---

## 6. Installation & Execution

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Backend Setup
```bash
cd server
npm install
# Run Prisma migrations against Neon PostgreSQL
npx prisma migrate deploy
# Seed authoritative Solapur demo data
npm run seed
# Start the backend server (runs on http://localhost:5000)
npm run dev
```

### 2. Frontend Setup
```bash
# In the project root (AECC)
npm install
# Start the Vite development server (runs on http://localhost:5173)
npm run dev
```

### 3. Automated Backend & Workflow Verification Suite
To run the automated 27-point verification suite:
```bash
cd server
node test-comprehensive-workflow.js
```
The suite verifies:
1. PostgreSQL connectivity and schema integrity
2. Real authentication, password hashing, and JWT token issuance
3. Observer RBAC rejection on signal overrides and incident creation (HTTP 403)
4. Persistent incident registration in PostgreSQL
5. Hospital ranking with unknown capacity preservation
6. Concurrency-safe ambulance assignment with double-dispatch conflict rejection (HTTP 409)
7. Green corridor traffic signal coordination
8. Hospital handover, incident resolution, and ambulance release back to available
9. Refresh persistence and database audit logging
10. CSV export functionality

---

## 7. Responsive Design Verification

Both the public website and all 13 Operations Console pages have been audited and verified across viewport widths:
- `320px` (Ultra-compact mobile)
- `375px` (Standard iPhone)
- `390px` / `414px` (Modern mobile devices)
- `768px` (iPad / Tablet portrait)
- `1024px` (Tablet landscape / small desktop)
- `1280px` / `1440px` (Full desktop / Command Center display)

Features:
- Mobile drawer navigation with hamburger toggle
- Horizontally scrollable tables inside containers (`overflow-x-auto`)
- Vertically stacking forms on narrow screens
- Responsive CAD viewer with aspect ratio preservation
- Touch-friendly team carousel and roundabout visualizer

---

## 8. Real vs. Simulated Integrations

| Subsystem | Real / Persisted | Simulated | Notes |
| :--- | :--- | :--- | :--- |
| **Database Storage** | **Real** | - | Authoritative Neon PostgreSQL with Prisma ORM migrations |
| **Authentication & RBAC** | **Real** | - | Real bcrypt hashes, signed JWTs, and middleware verification |
| **Road Routing** | **Real** | Fallback | Live OSRM driving engine API with deterministic Solapur GIS fallback |
| **Cartography Tiles** | **Real** | Fallback | Live CartoDB Voyager tiles with authenticated API key |
| **Hospital Capacity Feeds**| - | **Simulated** | Explicitly labeled as unverified; capacities kept unknown per specification |
| **Traffic Light Hardware** | - | **Simulated** | NTCIP commands strictly loopback/virtual; physical actuators disabled |
