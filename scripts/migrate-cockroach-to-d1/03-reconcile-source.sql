-- 移行元(CockroachDB)側の照合値。03-reconcile-d1.sqlの結果と全て完全一致すること。
-- カウント一致だけではクォートバグを検出できないため, 別途目視確認も行う

SELECT 'instances'      AS k, count(*)::TEXT AS v FROM instances
UNION ALL SELECT 'repositories',   count(*)::TEXT FROM repositories
UNION ALL SELECT 'excluded_hosts', count(*)::TEXT FROM excluded_hosts
UNION ALL SELECT 'sum_users',      COALESCE(sum(users_count), 0)::TEXT FROM instances
UNION ALL SELECT 'sum_notes',      COALESCE(sum(notes_count), 0)::TEXT FROM instances
UNION ALL SELECT 'alive',          count(*)::TEXT FROM instances WHERE is_alive
UNION ALL SELECT 'distinct_repos', count(DISTINCT repository_url)::TEXT FROM instances
UNION ALL SELECT 'with_language',  count(*)::TEXT FROM instances WHERE language IS NOT NULL
UNION ALL SELECT 'min_created_at', (EXTRACT(EPOCH FROM min(created_at)) * 1000)::INT8::TEXT FROM instances
UNION ALL SELECT 'max_created_at', (EXTRACT(EPOCH FROM max(created_at)) * 1000)::INT8::TEXT FROM instances
UNION ALL SELECT 'state_' || suspension_state::TEXT, count(*)::TEXT FROM instances GROUP BY suspension_state
UNION ALL SELECT 'source_' || source::TEXT, count(*)::TEXT FROM excluded_hosts GROUP BY source
ORDER BY k;

-- クォート・エンコーディング確認用。D1側と目視で突き合わせる
SELECT url, length(description) AS len, md5(description) AS hash
FROM repositories WHERE description IS NOT NULL
ORDER BY length(description) DESC LIMIT 3;
