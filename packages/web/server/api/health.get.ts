export default defineEventHandler(async(_event) => {
  return {
    status: 'ok',
    time: new Date().toISOString(),
  };
});
