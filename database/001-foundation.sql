BEGIN;
SELECT pg_advisory_xact_lock(hashtext('nexora:foundation'));
CREATE TABLE IF NOT EXISTS websites (
 domain text PRIMARY KEY CHECK (domain ~ '^[a-z0-9][a-z0-9-]*\.(nex|vnt|zen|orb|kiv)$'),
 title text NOT NULL,
 description text NOT NULL DEFAULT '',
 html text NOT NULL,
 published boolean NOT NULL DEFAULT false,
 suspended boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS reserved_domains(domain text PRIMARY KEY);
INSERT INTO reserved_domains(domain) VALUES ('home.nex'),('search.nex'),('studio.nex'),('domains.nex'),('explore.nex'),('account.nex'),('help.nex'),('status.nex'),('settings.nex') ON CONFLICT DO NOTHING;
COMMIT;
