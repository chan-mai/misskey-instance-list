-- 移行前の件数把握とFK孤児の検出。
-- D1はFK強制がデフォルトONのため, 孤児が1件でもあるとインポートが失敗する

SELECT 'instances' AS table_name, count(*) AS rows FROM instances
UNION ALL SELECT 'repositories', count(*) FROM repositories
UNION ALL SELECT 'excluded_hosts', count(*) FROM excluded_hosts;

-- 0でなければ先に解消すること
SELECT count(*) AS orphan_repository_urls
FROM instances i
LEFT JOIN repositories r ON i.repository_url = r.url
WHERE i.repository_url IS NOT NULL AND r.url IS NULL;
