import ipaddr from 'ipaddr.js';
import dns from 'node:dns/promises';


/**
 * 指定されたIPアドレスが有効なパブリックIPかどうかを確認します
 * 以下を拒否します:
 * - 無効な形式
 * - プライベート範囲 (IPv4/IPv6)
 * - ループバック
 * - リンクローカル
 * - ユニークローカル
 * - マルチキャスト
 * - 予約済み
 * - ブロードキャスト
 * - キャリアグレードNAT
 * - ドキュメンテーション
 * - 未指定
 */
export function isValidPublicIp(ip: string): boolean {
  if (!ipaddr.isValid(ip)) return false;

  try {
    const addr = ipaddr.parse(ip);
    const range = addr.range();

    // ブロックする範囲のリスト
    const blockedRanges = [
      'private',
      'loopback',
      'linkLocal',
      'uniqueLocal',
      'multicast',
      'reserved',
      'broadcast',
      'carrierGradeNat', // 100.64.0.0/10
      'documentation',   // 192.0.2.0/24, etc.
      'unspecified',
    ];

    if (blockedRanges.includes(range)) {
      return false;
    }

    // ipaddr.js の range() でカバーされない特定のチェック
    // 例えば、ipaddr.js の 'reserved' は多くをカバーしますが、必要に応じて明示的にします
    // ipaddr.js では、IPv4射影アドレス (::ffff:127.0.0.1) はIPv6として扱われますが、
    // 射影されている場合は基となるIPv4を確認する必要があります
    if (addr.kind() === 'ipv6') {
      const ipv6 = addr as ipaddr.IPv6;
      if (ipv6.isIPv4MappedAddress()) {
        const ipv4 = ipv6.toIPv4Address();
        return isValidPublicIp(ipv4.toString());
      }
    }

    return true;
  } catch {
    return false;
  }
}


/**
 * ホスト名を解決し、全てのIPがパブリックかを確認します (SSRF対策)
 *
 * validateDomainの正規表現は生IPやmetadata.google.internalのような内部名も通すため、
 * 利用者入力のホストへ接続する前にこの検査を通します
 *
 * @param host 検査対象のホスト名
 * @returns 解決できて全てパブリックならtrue
 */
export async function isPubliclyResolvable(host: string): Promise<boolean> {
  // 生IPはDNSレコードを持たない, dns.lookup時代と同じく直接検証する
  if (ipaddr.isValid(host)) return isValidPublicIp(host);

  // Workersにdns.lookupは無いためresolve4/6を使う。
  // ファミリ不在でENODATAをthrowするので個別catch必須, まとめるとIPv4のみのホストが全て落ちる
  const [v4, v6] = await Promise.all([
    dns.resolve4(host).catch(() => [] as string[]),
    dns.resolve6(host).catch(() => [] as string[]),
  ]);

  const addresses = [...v4, ...v6];
  if (addresses.length === 0) return false;

  return addresses.every(isValidPublicIp);
}
