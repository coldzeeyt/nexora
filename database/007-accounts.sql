BEGIN;
SELECT pg_advisory_xact_lock(hashtext('nexora:accounts'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name text NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_hash text;
COMMIT;
