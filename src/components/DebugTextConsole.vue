<template>
  <teleport to="body">
    <div v-if="store.enabled" class="debug-console">
      <div v-if="!store.visible" class="debug-console__fab">
        <n-button size="small" secondary @click="store.setVisible(true)">
          Logs ({{ store.size }})
        </n-button>
      </div>

      <div v-else class="debug-console__panel">
        <div class="debug-console__header">
          <div class="left">
            <span class="title">Debug Console</span>
            <n-tag size="small" :bordered="false" type="info">
              {{ store.size }}
            </n-tag>
          </div>

          <div class="right">
            <span class="label">自动滚动</span>
            <n-switch v-model:value="autoScroll" size="small" />

            <n-button size="small" quaternary @click="store.clear()">
              清空
            </n-button>
            <n-button size="small" quaternary @click="store.setVisible(false)">
              收起
            </n-button>
          </div>
        </div>

        <div class="debug-console__controls">
          <n-input
            v-model:value="keyword"
            size="small"
            clearable
            placeholder="过滤关键字（支持 level:info 这种简单匹配）"
          />

          <div class="levels">
            <n-button
              size="tiny"
              :type="activeLevel === 'all' ? 'primary' : 'default'"
              @click="activeLevel = 'all'"
            >
              全部
            </n-button>
            <n-button
              size="tiny"
              :type="activeLevel === 'debug' ? 'primary' : 'default'"
              @click="activeLevel = 'debug'"
            >
              debug
            </n-button>
            <n-button
              size="tiny"
              :type="activeLevel === 'info' ? 'primary' : 'default'"
              @click="activeLevel = 'info'"
            >
              info
            </n-button>
            <n-button
              size="tiny"
              :type="activeLevel === 'warn' ? 'primary' : 'default'"
              @click="activeLevel = 'warn'"
            >
              warn
            </n-button>
            <n-button
              size="tiny"
              :type="activeLevel === 'error' ? 'primary' : 'default'"
              @click="activeLevel = 'error'"
            >
              error
            </n-button>
          </div>
        </div>

        <div ref="listRef" class="debug-console__list">
          <div
            v-for="item in filteredItems"
            :key="item.id"
            class="debug-console__item"
          >
            <n-tag
              size="small"
              :bordered="false"
              :type="levelTagType(item.level)"
              class="level"
            >
              {{ item.level }}
            </n-tag>
            <span class="time">{{ formatTime(item.time) }}</span>
            <span class="text">{{ item.text }}</span>
          </div>

          <div v-if="filteredItems.length === 0" class="debug-console__empty">
            暂无日志
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import useDebugStore, {
  type DebugLogLevel
} from "@/stores/debug";
import { NButton, NInput, NSwitch, NTag } from "naive-ui";
import { computed, nextTick, ref, watch } from "vue";

type LevelFilter = "all" | DebugLogLevel;

const store = useDebugStore();

const activeLevel = ref<LevelFilter>("all");
const keyword = ref("");
const autoScroll = ref(true);
const listRef = ref<HTMLDivElement | null>(null);

const filteredItems = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  return store.items.filter((item) => {
    if (activeLevel.value !== "all" && item.level !== activeLevel.value) {
      return false;
    }
    if (!kw) return true;
    return (
      item.level.toLowerCase().includes(kw) ||
      item.text.toLowerCase().includes(kw)
    );
  });
});

const formatTime = (time: number) => {
  const d = new Date(time);
  return d.toLocaleTimeString();
};

const levelTagType = (level: DebugLogLevel) => {
  if (level === "error") return "error";
  if (level === "warn") return "warning";
  if (level === "info") return "info";
  return "default";
};

const scrollToBottom = async () => {
  await nextTick();
  const el = listRef.value;
  if (!el) return;
  el.scrollTop = el.scrollHeight;
};

watch(
  () => store.items.length,
  async () => {
    if (!store.visible || !autoScroll.value) return;
    await scrollToBottom();
  }
);

watch(
  () => store.visible,
  async (v) => {
    if (!v || !autoScroll.value) return;
    await scrollToBottom();
  }
);
</script>

<style lang="scss" scoped>
.debug-console {
  position: fixed;
  right: 12px;
  bottom: 12px;
  z-index: 9999;

  &__fab {
    pointer-events: auto;
  }

  &__panel {
    width: 560px;
    height: 300px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
    pointer-events: auto;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    .left {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-width: 180px;

      .title {
        font-size: 13px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.9);
      }
    }

    .right {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;

      .label {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.65);
      }
    }
  }

  &__controls {
    display: flex;
    gap: 10px;
    align-items: center;

    .levels {
      display: inline-flex;
      gap: 6px;
      flex-shrink: 0;
    }
  }

  &__list {
    flex: 1;
    overflow: auto;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    padding: 8px;
    background: rgba(0, 0, 0, 0.02);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      "Liberation Mono", "Courier New", monospace;
    font-size: 12px;
    line-height: 18px;
  }

  &__item {
    display: flex;
    gap: 8px;
    padding: 4px 2px;
    border-bottom: 1px dashed rgba(0, 0, 0, 0.06);

    .level {
      flex-shrink: 0;
    }
    .time {
      flex-shrink: 0;
      color: rgba(0, 0, 0, 0.55);
    }
    .text {
      color: rgba(0, 0, 0, 0.85);
      white-space: pre-wrap;
      word-break: break-word;
    }
  }

  &__empty {
    padding: 12px;
    color: rgba(0, 0, 0, 0.5);
    text-align: center;
  }
}
</style>
