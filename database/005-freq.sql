BEGIN;
SELECT pg_advisory_xact_lock(hashtext('nexora:freq'));
INSERT INTO reserved_domains(domain) VALUES('freq.zen') ON CONFLICT DO NOTHING;
INSERT INTO websites(domain,title,description,html,published) VALUES('freq.zen','Freq','Tune between stations. Discover short videos.','<h1>Freq</h1><p>Open freq.zen in the latest Nexora desktop app to tune into the video feed.</p>',true) ON CONFLICT DO NOTHING;
COMMIT;
