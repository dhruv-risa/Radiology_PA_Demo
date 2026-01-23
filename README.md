# MedOnc Prior Authorization System

React application replicating the Medical Oncology Prior Authorization UI.

## Setup

```bash
npm install
npm run dev
```

## Routes

- `/patient/:id/overview` - Patient Overview
- `/patient/:id/pa-orders` - PA Orders List
- `/patient/:id/dynamics` - Patient Dynamics
  - `/dynamics/drugs` - Drugs Tab
  - `/dynamics/business-office` - Business Office Tab
  - `/dynamics/visit-data` - Visit Data Chart Tab
  - `/dynamics/documents` - Documents Tab
  - `/dynamics/auth-letters` - Auth Letters Tab

## Tech Stack

- React 18
- React Router v6
- TypeScript
- Tailwind CSS
- Vite
