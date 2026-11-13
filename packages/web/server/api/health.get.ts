export default defineEventHandler(async _event => {
	return {
		status: 'ok',
		time: Temporal.Now.instant().toString({ fractionalSecondDigits: 3 }),
	};
});
