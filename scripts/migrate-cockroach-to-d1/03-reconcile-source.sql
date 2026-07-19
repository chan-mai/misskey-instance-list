-- 移行元(CockroachDB)側の照合値。03-reconcile-d1.sqlの結果と全て完全一致すること。
-- 1指標1文, D1側と行の並びを揃える

SELECT 'instances' AS k, count(*)::TEXT AS v FROM instances;
SELECT 'repositories' AS k, count(*)::TEXT AS v FROM repositories;
SELECT 'excluded_hosts' AS k, count(*)::TEXT AS v FROM excluded_hosts;
SELECT 'sum_users' AS k, COALESCE(sum(users_count), 0)::TEXT AS v FROM instances;
SELECT 'sum_notes' AS k, COALESCE(sum(notes_count), 0)::TEXT AS v FROM instances;
SELECT 'alive' AS k, count(*)::TEXT AS v FROM instances WHERE is_alive;
SELECT 'distinct_repos' AS k, count(DISTINCT repository_url)::TEXT AS v FROM instances;
SELECT 'with_language' AS k, count(*)::TEXT AS v FROM instances WHERE language IS NOT NULL;
SELECT 'null_users_count' AS k, count(*)::TEXT AS v FROM instances WHERE users_count IS NULL;
SELECT 'empty_reason' AS k, count(*)::TEXT AS v FROM excluded_hosts WHERE reason = '';
SELECT 'null_reason' AS k, count(*)::TEXT AS v FROM excluded_hosts WHERE reason IS NULL;
SELECT 'min_created_at' AS k, (EXTRACT(EPOCH FROM min(created_at)) * 1000)::INT8::TEXT AS v FROM instances;
SELECT 'max_created_at' AS k, (EXTRACT(EPOCH FROM max(created_at)) * 1000)::INT8::TEXT AS v FROM instances;
SELECT 'state_' || suspension_state::TEXT AS k, count(*)::TEXT AS v FROM instances GROUP BY suspension_state;
SELECT 'source_' || source::TEXT AS k, count(*)::TEXT AS v FROM excluded_hosts GROUP BY source;

-- クォート・エンコーディング確認用。D1側と目視で突き合わせる
SELECT url AS k, length(description)::TEXT AS v
FROM repositories WHERE description IS NOT NULL
ORDER BY length(description) DESC, url LIMIT 3;
