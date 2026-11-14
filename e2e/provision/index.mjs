// Misskey, ZITADELの初期データ投入, 結果を/sharedへ書き出し
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const SHARED = '/shared';
const PASSWORD = 'mil-e2e-Passw0rd!';

const waitFor = async (label, probe, timeoutMs = 600_000) => {
	const deadline = Date.now() + timeoutMs;
	for (;;) {
		try {
			if (await probe()) return;
		} catch {
			// 起動待ち
		}
		if (Date.now() > deadline) throw new Error(`timeout waiting for ${label}`);
		await sleep(2_000);
	}
};

const post = async (url, body, headers = {}) => {
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'content-type': 'application/json', ...headers },
		body: JSON.stringify(body),
	});
	const text = await res.text();
	if (!res.ok) throw new Error(`POST ${url} failed: ${res.status} ${text}`);
	return text ? JSON.parse(text) : null;
};

// Misskey

const MISSKEY = {
	alpha: {
		meta: {
			name: 'Alpha E2E',
			description: 'E2Eテスト用のMisskeyサーバです。日本語で運営しています。',
			disableRegistration: false,
			emailRequiredForSignup: false,
		},
		extraUsers: ['alice', 'bob'],
		notes: [
			'こんにちは、今日はとても良い天気ですね。散歩に出かけようと思います。',
			'新しいカフェを見つけました。コーヒーがとても美味しかったです。',
			'週末は友達と映画を見に行く予定です。楽しみにしています。',
			'最近は読書にはまっています。おすすめの本があれば教えてください。',
			'今日の夕飯はカレーライスにしました。家族みんなが喜んでくれました。',
		],
	},
	beta: {
		meta: {
			name: 'Beta E2E',
			description: 'An English speaking Misskey server for end to end tests.',
			disableRegistration: true,
			emailRequiredForSignup: true,
		},
		extraUsers: [],
		notes: [
			'Good morning everyone, the weather is lovely today and I am going for a walk.',
			'I found a new coffee shop downtown and the espresso there was excellent.',
			'This weekend I am planning to watch a movie with some of my friends.',
			'Lately I have been reading a lot of books, please recommend your favourites.',
			'We cooked a large pot of vegetable soup for dinner and everyone loved it.',
		],
	},
	cherrypick: {
		meta: {
			name: 'CherryPick E2E',
			description: 'CherryPickで動いているサーバです。',
		},
		extraUsers: [],
		notes: [],
	},
	tempura: {
		meta: {
			name: 'Tempura E2E',
			description: 'misskey-tempuraで動いているサーバです。',
			disableRegistration: false,
			emailRequiredForSignup: false,
		},
		extraUsers: ['carol'],
		notes: [
			'天ぷらを揚げるのは難しいですが、うまくできると嬉しいです。(ほんまか？)',
			'今日は図書館で静かに勉強をしてから帰りました。',
			'夜は少し冷えるので温かいお茶を飲んでいます。',
		],
	},
};

const provisionMisskey = async (name, spec) => {
	const base = `https://${name}.mil-e2e.test`;
	await waitFor(
		`misskey ${name}`,
		async () => (await fetch(`${base}/api/meta`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })).ok,
	);

	const admin = await post(`${base}/api/admin/accounts/create`, { username: 'admin', password: PASSWORD });
	const i = admin.token;

	await post(`${base}/api/admin/update-meta`, { i, federation: 'all', ...spec.meta });

	for (const username of spec.extraUsers) {
		await post(`${base}/api/admin/accounts/create`, { i, username, password: PASSWORD });
	}
	for (const text of spec.notes) {
		await post(`${base}/api/notes/create`, { i, text, visibility: 'public' });
	}

	console.log(`misskey ${name} provisioned`);
	return i;
};

// ZITADEL

const ZITADEL = 'https://zitadel.mil-e2e.test';

const provisionZitadel = async () => {
	const patPath = '/zitadel-bootstrap/admin.pat';
	await waitFor('zitadel pat', () => existsSync(patPath));
	const pat = readFileSync(patPath, 'utf8').trim();
	const auth = { authorization: `Bearer ${pat}` };
	await waitFor('zitadel api', async () => (await fetch(`${ZITADEL}/debug/ready`)).ok);
	await waitFor('zitadel login', async () => (await fetch(`${ZITADEL}/ui/v2/login/healthy`)).ok);

	const project = await post(`${ZITADEL}/management/v1/projects`, { name: 'misskey-instance-list', projectRoleAssertion: true }, auth);
	await post(`${ZITADEL}/management/v1/projects/${project.id}/roles`, { roleKey: 'Admin', displayName: 'Admin' }, auth);

	const app = await post(
		`${ZITADEL}/management/v1/projects/${project.id}/apps/oidc`,
		{
			name: 'web',
			redirectUris: ['https://web.mil-e2e.test/auth/zitadel/callback'],
			postLogoutRedirectUris: ['https://web.mil-e2e.test/'],
			responseTypes: ['OIDC_RESPONSE_TYPE_CODE'],
			grantTypes: ['OIDC_GRANT_TYPE_AUTHORIZATION_CODE'],
			appType: 'OIDC_APP_TYPE_WEB',
			authMethodType: 'OIDC_AUTH_METHOD_TYPE_BASIC',
			idTokenRoleAssertion: true,
			idTokenUserinfoAssertion: true,
			accessTokenRoleAssertion: true,
		},
		auth,
	);

	const createUser = async username => {
		const user = await post(
			`${ZITADEL}/v2/users/human`,
			{
				username,
				profile: { givenName: username, familyName: 'E2E' },
				email: { email: `${username}@mil-e2e.test`, isVerified: true },
				password: { password: PASSWORD, changeRequired: false },
			},
			auth,
		);
		return user.userId;
	};

	const adminId = await createUser('mil-admin');
	await post(`${ZITADEL}/management/v1/users/${adminId}/grants`, { projectId: project.id, roleKeys: ['Admin'] }, auth);
	await createUser('mil-viewer');

	writeFileSync(`${SHARED}/oidc.env`, `OIDC_CLIENT_ID='${app.clientId}'\nOIDC_CLIENT_SECRET='${app.clientSecret}'\n`);
	console.log('zitadel provisioned');
};

if (existsSync(`${SHARED}/done`)) {
	console.log('already provisioned');
	process.exit(0);
}

const tokens = {};
await Promise.all([
	provisionZitadel(),
	...Object.entries(MISSKEY).map(async ([name, spec]) => {
		tokens[name] = await provisionMisskey(name, spec);
	}),
]);

// alphaから他サーバのユーザーを参照し連合先として記録
for (const host of ['beta', 'cherrypick', 'tempura']) {
	await post(`https://alpha.mil-e2e.test/api/ap/show`, { i: tokens.alpha, uri: `https://${host}.mil-e2e.test/@admin` });
}

writeFileSync(`${SHARED}/accounts.json`, JSON.stringify({ password: PASSWORD, misskeyTokens: tokens }, null, '\t'));
writeFileSync(`${SHARED}/done`, '');
console.log('provision completed');
