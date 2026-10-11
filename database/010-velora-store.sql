BEGIN;
CREATE TABLE IF NOT EXISTS velora_apps (
 id text PRIMARY KEY CHECK(id ~ '^[a-z0-9][a-z0-9-]{2,47}$'),
 title text NOT NULL,
 description text NOT NULL DEFAULT '',
 version text NOT NULL DEFAULT '0.1.0',
 revision integer NOT NULL DEFAULT 1,
 manifest jsonb NOT NULL DEFAULT '{}',
 published boolean NOT NULL DEFAULT true,
 updated_at timestamptz NOT NULL DEFAULT now()
);
COMMIT;
