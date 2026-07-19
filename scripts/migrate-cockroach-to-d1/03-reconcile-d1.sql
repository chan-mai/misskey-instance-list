-- D1側の照合値。03-reconcile-source.sqlの結果と全て完全一致すること

SELECT 'instances'      AS k, CAST(count(*) AS TEXT) AS v FROM instances
UNION ALL SELECT 'repositories',   CAST(count(*) AS TEXT) FROM repositories
UNION ALL SELECT 'excluded_hosts', CAST(count(*) AS TEXT) FROM excluded_hosts
UNION ALL SELECT 'sum_users',      CAST(COALESCE(sum(users_count), 0) AS TEXT) FROM instances
UNION ALL SELECT 'sum_notes',      CAST(COALESCE(sum(notes_count), 0) AS TEXT) FROM instances
UNION ALL SELECT 'alive',          CAST(count(*) AS TEXT) FROM instances WHERE is_alive = 1
UNION ALL SELECT 'distinct_repos', CAST(count(DISTINCT repository_url) AS TEXT) FROM instances
UNION ALL SELECT 'with_language',  CAST(count(*) AS TEXT) FROM instances WHERE language IS NOT NULL
UNION ALL SELECT 'min_created_at', CAST(min(created_at) AS TEXT) FROM instances
UNION ALL SELECT 'max_created_at', CAST(max(created_at) AS TEXT) FROM instances
UNION ALL SELECT 'state_' || suspension_state, CAST(count(*) AS TEXT) FROM instances GROUP BY suspension_state
UNION ALL SELECT 'source_' || source, CAST(count(*) AS TEXT) FROM excluded_hosts GROUP BY source
ORDER BY k;

-- クォート・エンコーディング確認用。移行元側と目視で突き合わせる
-- (SQLiteにmd5()は無いのでlengthのみ, 内容は目で見る)
SELECT url, length(description) AS len
FROM repositories WHERE description IS NOT NULL
ORDER BY length(description) DESC LIMIT 3;
