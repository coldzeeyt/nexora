BEGIN;
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
INSERT INTO websites(domain,title,description,html,published) VALUES
 ('welcome.zen','Community','A place to begin.','<h1>A place to begin.</h1><p>Welcome to the Nexora community network.</p>',true),
 ('makers.vnt','For builders','Ideas worth making.','<h1>Made by people.</h1><p>A quiet corner for curious builders.</p>',true),
 ('journal.kiv','Personal spaces','Small observations.','<h1>Small observations.</h1><p>Your own space can be a single HTML file.</p>',true)
 ON CONFLICT DO NOTHING;
COMMIT;
