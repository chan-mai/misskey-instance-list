import { onMounted, onUnmounted, watch, type Ref } from 'vue';

export function useInfiniteScroll(
  trigger: Ref<HTMLElement | null>,
  callback: () => void,
  options: {
    canLoad?: () => boolean;
    rootMargin?: string;
  } = {}
) {
  const { canLoad = () => true, rootMargin = '200px' } = options;
  let observer: IntersectionObserver | null = null;

  const cleanup = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  onMounted(() => {
    if (!import.meta.client) return;

    watch(
      trigger,
      (el) => {
        cleanup();
        if (!el) return;

        observer = new IntersectionObserver(
          ([entry]) => {
            if (entry?.isIntersecting && canLoad()) {
              callback();
            }
          },
          { rootMargin }
        );
        observer.observe(el);
      },
      { immediate: true }
    );
  });

  onUnmounted(cleanup);
}
