import { excludedHosts } from '@mil/core/db';

export default defineCachedEventHandler(async(event): Promise<ExclusionResponse[]> => {
  // すべての除外ホストを返す
  const exclusions = await useDb(event)
    .select({
      domain: excludedHosts.domain,
      reason: excludedHosts.reason,
    })
    .from(excludedHosts);
  return exclusions;
}, {
  // sync:exclusionsタスクからの明示的なキャッシュ無効化がなくなったため短めにする
  maxAge: 10 * 60,
});
