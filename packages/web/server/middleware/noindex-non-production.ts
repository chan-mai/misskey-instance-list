// 本番
const PRODUCTION_HOST = 'servers.misskey.ink';

// 本番外をnoindex
export default defineEventHandler((event) => {
  if (getRequestHost(event) !== PRODUCTION_HOST) {
    setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow');
  }
});
