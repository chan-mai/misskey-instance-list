SELECT row_to_json(t) FROM (
  SELECT
    url,
    name,
    description,
    (EXTRACT(EPOCH FROM updated_at) * 1000)::INT8 AS updated_at,
    (EXTRACT(EPOCH FROM created_at) * 1000)::INT8 AS created_at
  FROM repositories
) t;
