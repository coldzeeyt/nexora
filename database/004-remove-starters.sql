BEGIN;
SELECT pg_advisory_xact_lock(hashtext('nexora:remove-starters'));
DELETE FROM websites WHERE domain IN ('welcome.zen','makers.vnt','journal.kiv') AND owner_id IS NULL;
COMMIT;
