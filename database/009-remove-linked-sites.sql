BEGIN;
SELECT pg_advisory_xact_lock(hashtext('nexora:remove-linked-sites'));
DELETE FROM websites WHERE domain IN ('solo.zen','freq.zen') AND owner_id IS NULL;
DELETE FROM reserved_domains WHERE domain IN ('solo.zen','freq.zen');
COMMIT;
