import * as yaml from 'js-yaml';

const DATA_BASE_URL = 'https://raw.githubusercontent.com/joinmisskey/api/main/data';

async function fetchYamlList(file: string): Promise<unknown[]> {
  const res = await fetch(`${DATA_BASE_URL}/${file}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${file}: ${res.status}`);
  }

  const data = yaml.load(await res.text());
  if (!Array.isArray(data)) {
    throw new Error(`${file} is not an array`);
  }
  return data;
}

// 重複除去済み
export async function fetchListedHosts(): Promise<string[]> {
  const data = await fetchYamlList('instances.yml');
  return [...new Set(
    (data as { url?: string }[]).map((d) => d.url).filter((u): u is string => !!u),
  )];
}

export async function fetchIgnoredHosts(): Promise<string[]> {
  const data = await fetchYamlList('ignorehosts.yml');
  return data.filter((d): d is string => typeof d === 'string' && d.length > 0);
}
