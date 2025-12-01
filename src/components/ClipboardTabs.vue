<template>
  <div class="clipboard-tabs">
    <n-space :size="8" wrap>
      <n-button
        size="small"
        strong
        v-for="tab in tabs"
        :key="tab.key"
        :type="isActive(tab.key) ? 'primary' : 'default'"
        @click="handleTabClick(tab.key)"
      >
        <template #icon>
          <n-icon>
            <component :is="tab.icon" />
          </n-icon>
        </template>
        {{ tab.label }}
      </n-button>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import type { TabKey } from "@/stores/app";
import useAppStore from "@/stores/app";
import {
  AppsOutline,
  DocumentAttachOutline,
  ImageOutline,
  StarOutline,
  TextOutline,
} from "@/utils/icons";
import { NButton, NIcon, NSpace } from "naive-ui";
import { onMounted, onUnmounted, type Component } from "vue";

const tabs: { key: TabKey; label: string; icon: Component }[] = [
  { key: "all", label: "全部", icon: AppsOutline },
  { key: "favorite", label: "收藏", icon: StarOutline },
  { key: "text", label: "文本", icon: TextOutline },
  { key: "files", label: "文件", icon: DocumentAttachOutline },
  { key: "image", label: "图片", icon: ImageOutline },
];

const appStore = useAppStore();

const isActive = (key: TabKey) => appStore.activeTab === key;

const handleTabClick = (key: TabKey) => {
  appStore.activeTab = key;
};

// 键盘事件处理
const handleKeyDown = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase();
  
  // 获取当前 tab 的索引
  const currentIndex = tabs.findIndex((tab) => tab.key === appStore.activeTab);
  
  // 左方向键
  if (key === "arrowleft") {
    event.preventDefault();
    if (currentIndex > 0) {
      appStore.activeTab = tabs[currentIndex - 1].key;
    }
  }
  // 右方向键
  else if (key === "arrowright") {
    event.preventDefault();
    if (currentIndex < tabs.length - 1) {
      appStore.activeTab = tabs[currentIndex + 1].key;
    }
  }
};

// 组件挂载时添加键盘监听
onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

// 组件卸载时移除键盘监听
onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped lang="scss">
.clipboard-tabs {
  padding: 6px;
  background-color: #f0f3f7;
}
</style>
