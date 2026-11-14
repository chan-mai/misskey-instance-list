// cloudflare-dns.comのJSON API互換, Docker内部DNSで実解決
import { promises as dns } from 'node:dns';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:https';

const TYPES = { A: 1, AAAA: 28 };
const RESOLVERS = { A: name => dns.resolve4(name, { ttl: true }), AAAA: name => dns.resolve6(name, { ttl: true }) };

// NOERROR / NXDOMAIN / SERVFAIL
const rcodeOf = error => {
	if (error.code === 'ENODATA') return 0;
	if (error.code === 'ENOTFOUND') return 3;
	return 2;
};

const answer = async (name, type) => {
	const question = [{ name, type: TYPES[type] }];
	try {
		const records = await RESOLVERS[type](name);
		return {
			Status: 0,
			Question: question,
			Answer: records.map(r => ({ name, type: TYPES[type], TTL: r.ttl, data: r.address })),
		};
	} catch (error) {
		return { Status: rcodeOf(error), Question: question };
	}
};

const server = createServer({ cert: readFileSync('/certs/server.crt'), key: readFileSync('/certs/server.key') }, async (req, res) => {
	const url = new URL(req.url, 'https://cloudflare-dns.com');
	const name = url.searchParams.get('name');
	const type = url.searchParams.get('type')?.toUpperCase();

	if (url.pathname !== '/dns-query' || !name || !(type in TYPES)) {
		res.writeHead(400, { 'content-type': 'application/json' }).end(JSON.stringify({ error: 'unsupported query' }));
		return;
	}

	const body = await answer(name.replace(/\.$/, ''), type);
	console.log(`${type} ${name} -> ${body.Answer?.map(a => a.data).join(',') ?? `rcode ${body.Status}`}`);
	res.writeHead(200, { 'content-type': 'application/dns-json' }).end(JSON.stringify(body));
});

server.listen(443, () => console.log('doh listening on 443'));
