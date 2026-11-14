import dns from 'node:dns/promises';
import ipaddr from 'ipaddr.js';

import type { IpStack } from '../entity/schema.js';

export type ResolvedAddresses = { v4: string[]; v6: string[] };

const IPV4_COMPATIBLE = ipaddr.parseCIDR('::/96');

// unicast以外拒否
export function isValidPublicIp(ip: string): boolean {
	if (!ipaddr.isValid(ip)) return false;

	try {
		const addr = ipaddr.parse(ip);
		if (addr.kind() === 'ipv6') {
			const ipv6 = addr as ipaddr.IPv6;
			if (ipv6.isIPv4MappedAddress()) return isValidPublicIp(ipv6.toIPv4Address().toString());
			// range() IPv4互換をunicast判定
			if (ipv6.match(IPV4_COMPATIBLE)) return false;
		}
		return addr.range() === 'unicast';
	} catch {
		return false;
	}
}

// A/AAAAを解決し全てパブリックなら一覧を返す, 解決不能や非パブリック混在はnull
// validateDomainは生IPや内部名(metadata.google.internal等)にも一致, 接続前の検査が必須(SSRF対策)
export async function resolvePublicAddresses(host: string): Promise<ResolvedAddresses | null> {
	// 生IPはDNSレコードを持たない, dns.lookup時代と同じく直接検証する
	if (ipaddr.isValid(host)) {
		if (!isValidPublicIp(host)) return null;
		return ipaddr.parse(host).kind() === 'ipv6' ? { v4: [], v6: [host] } : { v4: [host], v6: [] };
	}

	// Workersにdns.lookupは無いためresolve4/6を使う。
	// ファミリ不在でENODATAをthrowするので個別catch必須, まとめるとIPv4のみのホストが全て落ちる
	const [v4, v6] = await Promise.all([dns.resolve4(host).catch(() => [] as string[]), dns.resolve6(host).catch(() => [] as string[])]);

	const addresses = [...v4, ...v6];
	if (addresses.length === 0) return null;

	return addresses.every(isValidPublicIp) ? { v4, v6 } : null;
}

// 解決できて全てパブリックならtrue
export async function isPubliclyResolvable(host: string): Promise<boolean> {
	return (await resolvePublicAddresses(host)) !== null;
}

// 解決結果からIPスタック種別を判定
export function toIpStack({ v4, v6 }: ResolvedAddresses): IpStack {
	if (v4.length > 0 && v6.length > 0) return 'dual';
	return v6.length > 0 ? 'v6' : 'v4';
}
