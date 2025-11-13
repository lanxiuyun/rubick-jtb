<template>
  <div class="clipboard-tabs">
    <div class="tabs-container">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="handleTabClick(tab.key)"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </div>
    </div>

    <button class="copy-button" @click="handleCopyClick">
      <span class="copy-icon">📋</span>
      <span class="copy-label">复制</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

type TabKey = "all" | "text" | "files" | "image";

interface Tab {
  key: TabKey;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { key: "all", label: "全部", icon: "📊" },
  { key: "text", label: "文本", icon: "📝" },
  { key: "files", label: "文件", icon: "📎" },
  { key: "image", label: "图片", icon: "🖼️" },
];

const activeTab = ref<TabKey>("all");

const emit = defineEmits<{
  tabChange: [tab: TabKey];
  copy: [];
}>();

const handleTabClick = (tab: TabKey) => {
  activeTab.value = tab;
  emit("tabChange", tab);
};

const handleCopyClick = () => {
  emit("copy");
};
</script>

<style scoped lang="scss">
.clipboard-tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: #eeeeee;
  border-bottom: 1px solid #e5e7eb;

  .tabs-container {
    display: flex;
    gap: 8px;
  }

  .tab-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: transparent;
    color: #6b7280;
    font-size: 14px;
    user-select: none;

    .tab-icon {
      font-size: 16px;
    }

    .tab-label {
      font-weight: 500;
    }

    &:hover {
      background: #f3f4f6;
      color: #374151;
    }

    &.active {
      background: #3b82f6;
      color: #fff;

      &:hover {
        background: #2563eb;
      }
    }
  }

  .copy-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: #3b82f6;
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    user-select: none;

    .copy-icon {
      font-size: 16px;
    }

    &:hover {
      background: #2563eb;
      transform: translateY(-1px);
      box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
    }

    &:active {
      transform: translateY(0);
    }
  }
}
</style>

