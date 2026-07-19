-- JSONLでエクスポート。SQLite側の表現に合わせて型変換まで済ませる
--   bool      -> 1/0
--   TIMESTAMP -> epoch ms (Prismaが保存したのはUTC, EXTRACT(EPOCH)はUTC扱いで一致する)
--   enum      -> text
SELECT row_to_json(t) FROM (
  SELECT
    id,
    node_name,
    users_count,
    notes_count,
    version,
    CASE WHEN is_alive THEN 1 ELSE 0 END AS is_alive,
    (EXTRACT(EPOCH FROM created_at)    * 1000)::INT8 AS created_at,
    (EXTRACT(EPOCH FROM last_updated)  * 1000)::INT8 AS last_updated,
    (EXTRACT(EPOCH FROM last_check_at) * 1000)::INT8 AS last_check_at,
    banner_url,
    icon_url,
    suspension_state::TEXT AS suspension_state,
    recommendation_score,
    CASE WHEN open_registrations IS NULL THEN NULL WHEN open_registrations THEN 1 ELSE 0 END AS open_registrations,
    CASE WHEN email_required     IS NULL THEN NULL WHEN email_required     THEN 1 ELSE 0 END AS email_required,
    repository_url,
    language
  FROM instances
) t;
