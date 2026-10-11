BEGIN;
INSERT INTO reserved_domains(domain) VALUES('apps.nex'),('velora.nex'),('downloads.nex'),('admin.nex'),('ai.nex'),('report.nex'),('history.nex'),('bookmarks.nex') ON CONFLICT DO NOTHING;
COMMIT;
