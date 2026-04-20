# thecaninehelp NGO Frontend

A modern NGO website frontend for animal rescue, adoption, volunteer onboarding, and shelter administration.

## Live Demo

- Frontend deployed URL: https://ngodemohelp.netlify.app

## Project Overview

This project is built as a multi-page Next.js frontend experience using the App Router. It includes:

- Public NGO-facing pages (home, about, impact, adopt, volunteer, rescue report)
- Admin dashboard and operations modules for shelter teams
- Route-level pages for adoption pipeline, inquiry management, vaccinations, rescue operations, and care logs
- A polished responsive UI with custom styling and navigation

Note: This repository currently focuses on frontend UI/UX and page structure. Most forms and admin actions are UI-only and not connected to a backend API yet.

## Tech Stack

- Next.js 16.2.1 (App Router)
- React 19.2.4
- TypeScript 5
- Tailwind CSS 4 (configured in project dependencies)
- ESLint 9 with eslint-config-next

## Main Features

- Public Pages
	- Mission-led homepage with hero, stats, programs, and CTA sections
	- About page with NGO story, timeline, values, and team section
	- Impact page with metrics and transparency reporting sections
	- Adopt page with adoptable cards and UI filters
	- Volunteer page with role showcase and volunteer application form UI
	- Rescue report page with emergency intake form layout UI

- Admin & Operations Pages
	- Overview dashboard with operational metrics and rescue request table
	- Rescue management pipeline with priority/status handling UI
	- Adoption pipeline board and detailed review page
	- Inquiry management inbox and message detail interface
	- Vaccination registry and schedule interface
	- Shelter care logs with table, alerts, and timeline
	- Animal inventory page with cards, summaries, and ledger table

- Shared Experience
	- Responsive navigation with desktop and mobile drawer menu
	- Consistent branding and section-based layout structure

## Route Map

### Public Routes

- /
- /about
- /impact
- /adopt
- /volunteer
- /rescue
- /inventory

### Admin Routes

- /admin
- /admin/rescue
- /admin/adoption
- /admin/adoption/review
- /admin/inquiry-management
- /admin/shelter-care-logs
- /admin/vaccinations

## Project Structure

Key folders/files:

- app/
	- Public and admin route pages
	- components/SiteNav.tsx for shared top navigation
	- globals.css for global styling
- public/adopt/
	- Adoption card image assets

## Run Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Build & Start Production

```bash
npm run build
npm run start
```

## Linting

```bash
npm run lint
```

## Deployment

This frontend is deployed on Netlify:

- https://ngodemohelp.netlify.app

For future updates, redeploy from your connected Git branch or trigger a manual Netlify deploy after pushing changes.

## Roadmap Ideas

- Connect forms to backend services (rescue reports, volunteer applications, inquiries)
- Add authentication and role-based access for admin modules
- Integrate real-time data for rescue and shelter operations
- Add test coverage (unit + integration + e2e)
- Improve accessibility checks and SEO metadata per page

## License

This project is currently private/internal unless you add a license file.
