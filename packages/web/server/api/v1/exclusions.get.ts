import { listExclusionReasons } from '@mil/core/repository';

export default defineCachedEventHandler(async(event): Promise<ExclusionResponse[]> => {
  // すべての除外ホストを返す
  return listExclusionReasons(useDb(event));
}, {
  // sync:exclusionsタスクからの明示的なキャッシュ無効化がなくなったため短めにする
  maxAge: 10 * 60,
});
