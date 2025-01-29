// composables/useLoadingState.ts
export function useLoadingState() {
    const isLoading = ref(false);
    const error = ref<string | null>(null);
  
    const withLoading = async <T>(operation: () => Promise<T>): Promise<T> => {
      isLoading.value = true;
      error.value = null;
      try {
        const result = await operation();
        return result;
      } catch (e: any) {
        error.value = e.message;
        throw e;
      } finally {
        isLoading.value = false;
      }
    };
  
    return {
      isLoading,
      error,
      withLoading
    };
  }
  