import { describe, expect, test } from 'vitest';
import { isPubliclyResolvable, isValidPublicIp, resolvePublicAddresses, toIpStack } from '../src/net/ip.js';

describe('isValidPublicIp', () => {
	test.each(['8.8.8.8', '1.1.1.1', '2001:4860:4860::8888', '2606:4700:4700::1111', '::ffff:8.8.8.8'])('公開アドレス%sは許可', ip => {
		expect(isValidPublicIp(ip)).toBe(true);
	});

	test.each([
		['プライベート', '10.0.0.1'],
		['プライベート', '172.16.5.4'],
		['プライベート', '192.168.1.1'],
		['ループバック', '127.0.0.1'],
		['ループバック', '::1'],
		['リンクローカル(クラウドのメタデータ)', '169.254.169.254'],
		['リンクローカル', 'fe80::1'],
		['ユニークローカル', 'fd00::1'],
		['マルチキャスト', '224.0.0.1'],
		['ブロードキャスト', '255.255.255.255'],
		['キャリアグレードNAT', '100.64.0.1'],
		['ドキュメンテーション', '192.0.2.1'],
		['ドキュメンテーション', '2001:db8::1'],
		['未指定', '0.0.0.0'],
		['未指定', '::'],
		['IPv4射影のループバック', '::ffff:127.0.0.1'],
		['IPv4射影のプライベート', '::ffff:10.0.0.1'],
		['予約済み', '240.0.0.1'],
		['ベンチマーク', '198.18.0.1'],
		['NAT64のループバック', '64:ff9b::7f00:1'],
		['ローカルNAT64', '64:ff9b:1::a00:1'],
		['IPv4変換アドレス', '::ffff:0:7f00:1'],
		['IPv4互換のループバック', '::7f00:1'],
		['6to4のループバック', '2002:7f00:1::'],
		['Teredo', '2001:0:4136:e378:8000:63bf:3fff:fdd2'],
		['ベンチマーク', '2001:2::1'],
		['ORCHIDv2', '2001:20::1'],
		['破棄用', '100::1'],
		['サイトローカル', 'fec0::1'],
		['形式不正', '999.1.1.1'],
		['形式不正', 'example.com'],
		['形式不正', ''],
	])('%s %sは拒否', (_label, ip) => {
		expect(isValidPublicIp(ip)).toBe(false);
	});
});

describe('resolvePublicAddresses', () => {
	test('生IPは名前解決せず判定', async () => {
		expect(await resolvePublicAddresses('8.8.8.8')).toEqual({ v4: ['8.8.8.8'], v6: [] });
		expect(await resolvePublicAddresses('2001:4860:4860::8888')).toEqual({ v4: [], v6: ['2001:4860:4860::8888'] });
		expect(await resolvePublicAddresses('127.0.0.1')).toBeNull();
		expect(await isPubliclyResolvable('10.1.2.3')).toBe(false);
	});
});

describe('toIpStack', () => {
	test.each([
		[{ v4: ['1.1.1.1'], v6: ['2606:4700::1'] }, 'dual'],
		[{ v4: ['1.1.1.1'], v6: [] }, 'v4'],
		[{ v4: [], v6: ['2606:4700::1'] }, 'v6'],
	] as const)('%j -> %s', (addresses, stack) => {
		expect(toIpStack({ v4: [...addresses.v4], v6: [...addresses.v6] })).toBe(stack);
	});
});
