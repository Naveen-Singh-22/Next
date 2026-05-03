# thecaninehelp NGO Frontend v2

thecaninehelp v2 is the current production-grade development branch of the project. It is a modern NGO web platform for animal rescue, adoption, volunteering, donations, and shelter administration.

## Deployment

Version 1 of the project was deployed on Netlify.

- v1: https://ngodemohelp.netlify.app

Version 2 of the project is deployed on Vercel.

- v2: https://thecaninehelp.vercel.app/

## Project Overview

This version is built as a multi-page Next.js App Router application. It combines public-facing NGO pages with an internal admin dashboard, supported by a responsive interface and route-level modules for shelter operations.

The current version includes:

- Public NGO pages for home, about, impact, adopt, donate, volunteer, rescue, profile, login, signup, privacy, and terms
- User authentication before sensitive actions such as adoption, donation, and volunteering
- Admin modules for rescue management, adoption pipeline, inquiry handling, user management, inventory, vaccinations, and animal detail views
- JSON/lowdb-backed data flows for selected operational screens and APIs
- Shared navigation, theme controls, and reusable UI components across the application

## Problem Statement

Animal rescue and shelter operations are commonly managed through disconnected forms, messages, spreadsheets, and manual follow-up. This reduces response speed, complicates adoption and volunteer tracking, and limits visibility for both the public and the internal team.

## Purpose

thecaninehelp v2 was developed to centralize NGO workflows into a single, structured platform. The objective is to streamline rescue reporting, animal record management, adoption and volunteer processing, and shelter administration while improving the experience for supporters, adopters, and staff.

For security and data integrity, users must authenticate before initiating sensitive actions such as adoption, donation, or volunteering.

## Tech Stack

- Next.js 16.2.1: used for the App Router, server rendering, route-based structure, and production-ready deployment workflow.
- React 19.2.4: used to build reusable UI components and interactive pages across the public site and admin modules.
- TypeScript 5: used to improve type safety, reduce runtime errors, and keep the codebase maintainable as the project grows.
- Tailwind CSS 4: used for fast, consistent styling and responsive UI development without maintaining large custom CSS files.
- ESLint 9 with eslint-config-next: used to enforce code quality and maintain a consistent coding standard.
- lowdb: used for lightweight JSON-backed data storage so local admin workflows and form data can persist without a full database.
- leaflet / react-leaflet: used for rescue and location-based map features, giving the platform geographic context for operations.

## Key Capabilities

### Public-Facing Experience

- Mission-led homepage with hero, statistics, programs, and call-to-action sections
- About page with organizational story, values, and supporting content
- Impact page for transparency and progress reporting
- Adopt page with adoptable animal cards and detail routes
- Donate page with support messaging, contribution prompts, and donation-focused UI
- Volunteer page with role showcase and application form UI
- Rescue page with emergency intake and location-driven reporting UI
- Shared authentication and policy pages for login, signup, profile, privacy, and terms

### Administrative Operations

- Admin overview dashboard for operational metrics and recent activity
- Rescue management screen for prioritizing and tracking rescue requests
- Adoption pipeline and review flow for applications and screening
- Inquiry management workspace for incoming messages and follow-up
- User management for roles, status, and profile review
- Animal inventory and animal profile pages for shelter records
- Vaccination management and calendar-style scheduling views

### Shared Experience

- Responsive navigation with desktop and mobile layouts
- Theme toggles for consistent light and dark mode support
- Reusable cards, maps, uploaders, and management panels across routes

## Route Map

### Public Routes

- /
- /about
- /impact
- /adopt
- /adopt/[slug]
- /donate
- /volunteer
- /rescue
- /login
- /signup
- /profile
- /privacy
- /terms

### Admin Routes

- /admin
- /admin/login
- /admin/rescue
- /admin/adoption
- /admin/adoption/review
- /admin/inventory
- /admin/inquiry-management
- /admin/users
- /admin/vaccinations
- /admin/animals/[id]

## Project Structure

Key folders and files:

- app/ - route groups for public pages, admin pages, API routes, and global layout/styling
- src/components/ - shared UI and route-specific client components
- src/lib/ - application helpers and data utilities
- data/ - JSON data files used by lowdb-backed features
- public/ - static assets and image files

## Run Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Build and Start Production

```bash
npm run build
npm run start
```

## Linting

```bash
npm run lint
```

## Current Status

Version 2 is the active development release. The UI and route structure are in place for the main public site and administrative workflows, and several operational areas already use local JSON/lowdb-backed APIs. Some flows remain frontend-first and can be connected to a fuller backend in future iterations.

## Roadmap

- Connect remaining forms to production backend services
- Add authentication and role-based access for admin modules
- Expand automated test coverage for critical workflows
- Improve accessibility checks, metadata, and SEO per route
- Add live operational data sync for rescue and shelter modules

## License

This project is currently private and intended for internal use unless a license file is added.
