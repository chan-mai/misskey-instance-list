#!/bin/sh
# テスト用CAとサーバ証明書の発行, 両方期限内時再利用
set -eu

OUT=/certs

apk add --no-cache openssl >/dev/null

if openssl x509 -checkend 0 -noout -in "$OUT/ca.crt" 2>/dev/null && openssl x509 -checkend 0 -noout -in "$OUT/server.crt" 2>/dev/null; then
	exit 0
fi

openssl req -x509 -newkey rsa:2048 -nodes -days 30 \
	-subj '/CN=mil-e2e test CA' \
	-addext 'basicConstraints=critical,CA:TRUE' \
	-addext 'keyUsage=critical,keyCertSign,cRLSign' \
	-keyout "$OUT/ca.key" -out "$OUT/ca.crt"

openssl req -newkey rsa:2048 -nodes -subj '/CN=mil-e2e.test' \
	-keyout "$OUT/server.key" -out "$OUT/server.csr"

cat >"$OUT/server.ext" <<'EOF'
basicConstraints=CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
subjectAltName=DNS:mil-e2e.test,DNS:*.mil-e2e.test,DNS:cloudflare-dns.com
EOF

openssl x509 -req -in "$OUT/server.csr" -CA "$OUT/ca.crt" -CAkey "$OUT/ca.key" -CAcreateserial \
	-days 30 -extfile "$OUT/server.ext" -out "$OUT/server.crt"

chmod 644 "$OUT"/*
