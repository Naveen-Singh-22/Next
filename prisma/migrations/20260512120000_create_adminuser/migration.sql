-- Non-destructive migration: create AdminUser table if it doesn't exist
CREATE TABLE IF NOT EXISTS "AdminUser" (
  "id" SERIAL NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "fullName" TEXT,
  "role" TEXT NOT NULL DEFAULT 'admin',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- Ensure unique index on email (no-op if already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'AdminUser_email_key'
  ) THEN
    CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
  END IF;
END$$;
