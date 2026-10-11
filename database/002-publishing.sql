BEGIN;
SELECT pg_advisory_xact_lock(hashtext('nexora:publishing'));
CREATE TABLE IF NOT EXISTS users (
 id uuid PRIMARY KEY,
 username text NOT NULL UNIQUE,
 password_hash text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash text PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL
);
ALTER TABLE websites ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES users(id) ON DELETE CASCADE;
CREATE TABLE IF NOT EXISTS reports (
 id uuid PRIMARY KEY,
 domain text NOT NULL REFERENCES websites(domain) ON DELETE CASCADE,
 reporter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 reason text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS websites_owner_idx ON websites(owner_id);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
COMMIT;
