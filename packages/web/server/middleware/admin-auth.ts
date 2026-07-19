import { requireAdminAuth } from '~~/server/utils/admin-auth';

export default defineEventHandler(async(event) => {
  const path = getRequestURL(event).pathname.toLowerCase();
  if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
    await requireAdminAuth(event);
  }
});
