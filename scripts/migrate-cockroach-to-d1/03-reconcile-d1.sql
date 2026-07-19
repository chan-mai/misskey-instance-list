-- D1側の照合値。03-reconcile-source.sqlの結果と全て完全一致すること
-- D1はcompound SELECTの項数上限が低いためUNIONでまとめず1指標1文にする

SELECT 'instances' AS k, CAST(count(*) AS TEXT) AS v FROM instances;
SELECT 'repositories' AS k, CAST(count(*) AS TEXT) AS v FROM repositories;
SELECT 'excluded_hosts' AS k, CAST(count(*) AS TEXT) AS v FROM excluded_hosts;
SELECT 'sum_users' AS k, CAST(COALESCE(sum(users_count), 0) AS TEXT) AS v FROM instances;
SELECT 'sum_notes' AS k, CAST(COALESCE(sum(notes_count), 0) AS TEXT) AS v FROM instances;
SELECT 'alive' AS k, CAST(count(*) AS TEXT) AS v FROM instances WHERE is_alive = 1;
SELECT 'distinct_repos' AS k, CAST(count(DISTINCT repository_url) AS TEXT) AS v FROM instances;
SELECT 'with_language' AS k, CAST(count(*) AS TEXT) AS v FROM instances WHERE language IS NOT NULL;
SELECT 'null_users_count' AS k, CAST(count(*) AS TEXT) AS v FROM instances WHERE users_count IS NULL;
SELECT 'empty_reason' AS k, CAST(count(*) AS TEXT) AS v FROM excluded_hosts WHERE reason = '';
SELECT 'null_reason' AS k, CAST(count(*) AS TEXT) AS v FROM excluded_hosts WHERE reason IS NULL;
SELECT 'min_created_at' AS k, CAST(min(created_at) AS TEXT) AS v FROM instances;
SELECT 'max_created_at' AS k, CAST(max(created_at) AS TEXT) AS v FROM instances;
SELECT 'state_' || suspension_state AS k, CAST(count(*) AS TEXT) AS v FROM instances GROUP BY suspension_state;
SELECT 'source_' || source AS k, CAST(count(*) AS TEXT) AS v FROM excluded_hosts GROUP BY source;

-- クォート・エンコーディング確認用。移行元側と目視で突き合わせる
SELECT url AS k, CAST(length(description) AS TEXT) AS v
FROM repositories WHERE description IS NOT NULL
ORDER BY length(description) DESC, url LIMIT 3;
