import { computed, ref } from "vue";
import { defineStore } from "pinia";

/**
 * Pinia 示例：用于演示如何在模板中组织状态。
 * 可根据业务拆分为多个 store，或扩展为异步请求、Rubick API 调用等。
 */
export const useCounterStore = defineStore("counter", () => {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);

  function increment() {
    count.value += 1;
  }

  function reset() {
    count.value = 0;
  }

  return {
    count,
    doubleCount,
    increment,
    reset,
  };
});
