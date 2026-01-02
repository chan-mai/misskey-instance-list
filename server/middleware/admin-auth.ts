import { requireAdminAuth } from '~~/server/utils/admin-basic-auth';

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname.toLowerCase();
  if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
    requireAdminAuth(event);
  }
});
