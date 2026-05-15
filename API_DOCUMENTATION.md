# Backend API Documentation

Complete list of working API endpoints for The Canine Help project with Prisma + Neon PostgreSQL.

## Base URL
```
/api
```

---

## Animals

### GET /api/animals
Fetch all animals with optional filters and pagination.

**Query Params:**
- `species` (optional): Filter by species (dog, cat, bird)
- `status` (optional): Filter by status (adopted, available)
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "name": "Buddy",
      "species": "dog",
      "age": 3,
      "adopted": false,
      "createdAt": "2026-05-10T16:49:33.473Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 6,
    "pages": 1
  }
}
```

### POST /api/animals
Create a new animal record.

**Body:**
```json
{
  "name": "Buddy",
  "species": "dog",
  "age": 3,
  "adopted": false
}
```

### PUT /api/animals/[id]
Update an animal record.

**Body:**
```json
{
  "name": "Buddy",
  "species": "dog",
  "age": 4,
  "adopted": true
}
```

### DELETE /api/animals/[id]
Delete an animal record.

---

## Rescues

### GET /api/rescues
Fetch all rescue requests with optional filters and pagination.

**Query Params:**
- `status` (optional): Filter by status (new, in_progress, resolved)
- `priority` (optional): Filter by priority (low, medium, high)
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reportId": "RES-1715427000000",
      "location": "Central Market",
      "description": "Dog hiding behind a cart and limping",
      "status": "new",
      "priority": "high",
      "reporterName": "John Doe",
      "reporterPhone": "9876543210",
      "createdAt": "2026-05-08T20:11:58.956Z",
      "updatedAt": null
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
}
```

### POST /api/rescues
Create a new rescue request.

**Body:**
```json
{
  "location": "Central Market",
  "description": "Dog hiding behind a cart and limping",
  "priority": "high",
  "reporterName": "John Doe",
  "reporterPhone": "9876543210"
}
```

### PUT /api/rescues/[id]
Update a rescue request.

**Body:**
```json
{
  "status": "in_progress",
  "priority": "high",
  "description": "Updated: Dog has been located"
}
```

### DELETE /api/rescues/[id]
Delete a rescue request.

---

## Adoptions

### GET /api/adoptions
Fetch all adoption applications.

### POST /api/adoptions
Create a new adoption application.

### GET /api/adoptions/[id]
Fetch an adoption application by ID.

### PUT /api/adoptions/[id]
Update an adoption application status.

**Body:**
```json
{
  "status": "shortlisted",
  "adminNotes": "Candidate shortlisted for home visit"
}
```

### DELETE /api/adoptions/[id]
Delete an adoption application.

---

## Donations

### GET /api/donations
Fetch all donations.

### POST /api/donations
Create a new donation record.

### GET /api/donations/[id]
Fetch a donation by ID.

### PUT /api/donations/[id]
Update a donation record.

**Body:**
```json
{
  "amount": 5000,
  "coverFees": true
}
```

### DELETE /api/donations/[id]
Delete a donation record.

---

## Vaccinations

### GET /api/vaccinations
Fetch all vaccinations.

### POST /api/vaccinations
Create a new vaccination record.

### GET /api/vaccinations/[id]
Fetch a vaccination by ID.

### PUT /api/vaccinations/[id]
Update a vaccination record.

### DELETE /api/vaccinations/[id]
Delete a vaccination record.

---

## Dashboard

### GET /api/dashboard/stats
Fetch comprehensive dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalAnimals": 6,
      "totalRescues": 2,
      "totalAdoptions": 3,
      "totalVaccinations": 5,
      "totalDonations": 2,
      "totalVolunteers": 2,
      "totalInquiries": 3,
      "totalDonationAmount": 7500
    },
    "rescueStats": {
      "new": 1,
      "in_progress": 0,
      "resolved": 0
    },
    "adoptionStats": {
      "applied": 1,
      "shortlisted": 1,
      "home_visit": 1
    },
    "volunteerStats": {
      "reviewing": 1,
      "approved": 1
    },
    "animalStats": {
      "dog": 4,
      "cat": 1,
      "bird": 1
    }
  }
}
```

---

## Database

**Connected to:** Neon PostgreSQL

**Models:**
- `User`
- `Animal`
- `Donation`
- `Vaccination`
- `AdoptionApplication`
- `VolunteerApplication`
- `Inquiry`
- `RescueRequest`

---

## Setup

1. Prisma ORM is configured in `prisma/schema.prisma`
2. Database migrations are in `prisma/migrations/`
3. Seed data is in `prisma/seed.js`

Run migrations:
```bash
npx prisma migrate dev
```

Seed data:
```bash
npx prisma db seed
```

View data with Prisma Studio:
```bash
npx prisma studio
```

---

## Notes

- All endpoints return JSON with `{ success: boolean, data?: any, error?: string }`
- All dates are ISO 8601 format
- IDs for new records are auto-generated (CUID for strings, auto-increment for integers)
- Pagination defaults to page 1, limit 20
