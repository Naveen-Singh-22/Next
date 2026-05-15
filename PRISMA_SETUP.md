Prisma setup notes

1) Install packages

   From the `Next` folder run:

   ```bash
   npm install @prisma/client
   npm install -D prisma
   ```

2) Configure environment

   - Copy `.env.example` to `.env` and replace the `DATABASE_URL` placeholder with your actual PostgreSQL connection string.
   - Example connection string:

     ```text
     DATABASE_URL="postgresql://username:password@localhost:5432/thecaninehelp?schema=public"
     ```

3) Generate client and migrate

   - Generate the Prisma client:

     ```bash
     npx prisma generate
     ```

   - Create your first migration and apply it (development):

     ```bash
     npx prisma migrate dev --name init
     ```

4) Open Prisma Studio (web UI to browse data):

   ```bash
   npx prisma studio
   ```

Notes
- I added a minimal `prisma/schema.prisma` with `User` and `Animal` models — edit to fit your data model.
- We updated `package.json` scripts: `prisma:generate`, `prisma:migrate`, `prisma:studio`.
