SELECT row_to_json(t) FROM (
  SELECT
    domain,
    reason,
    source::TEXT AS source,
    (EXTRACT(EPOCH FROM created_at) * 1000)::INT8 AS created_at
  FROM excluded_hosts
) t;
