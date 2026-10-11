BEGIN;
SELECT pg_advisory_xact_lock(hashtext('nexora:solo'));
INSERT INTO reserved_domains(domain) VALUES('solo.zen') ON CONFLICT DO NOTHING;
INSERT INTO websites(domain,title,description,html,published) VALUES('solo.zen','Solo Live','Watch the live stream and hang out in chat.','<h1>Solo Live</h1><p>Open solo.zen in an updated Nexora desktop app for the live viewer and chat.</p>',true) ON CONFLICT DO NOTHING;
COMMIT;
