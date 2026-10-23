import * as yaml from 'js-yaml';

const DATA_BASE_URL = 'https://raw.githubusercontent.com/joinmisskey/api/main/data';

// instances.ymlのホスト, 重複除去済み
export async function fetchListedHosts(): Promise<string[]> {
  const res = await fetch(`${DATA_BASE_URL}/instances.yml`);
  if (!res.ok) {
    throw new Error(`Failed to fetch seed data: ${res.status}`);
  }

  const data = yaml.load(await res.text());
  if (!Array.isArray(data)) {
    throw new Error('Seed data is not an array');
  }

  return [...new Set(
    (data as { url?: string }[]).map((d) => d.url).filter((u): u is string => !!u),
  )];
}

export async function fetchIgnoredHosts(): Promise<string[]> {
  const res = await fetch(`${DATA_BASE_URL}/ignorehosts.yml`);
  if (!res.ok) {
    throw new Error(`Failed to fetch ignorehosts.yml: ${res.status}`);
  }

  const parsed = yaml.load(await res.text());
  if (!Array.isArray(parsed)) {
    throw new Error('ignorehosts.yml is not an array');
  }

  return parsed.filter((d): d is string => typeof d === 'string' && d.length > 0);
}
