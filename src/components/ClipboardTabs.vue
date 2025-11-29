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
import { useAppStore } from "@/stores/app";
import {
  AppsOutline,
  DocumentAttachOutline,
  ImageOutline,
  TextOutline,
} from "@/utils/icons";
import { NButton, NIcon, NSpace } from "naive-ui";
import type { Component } from "vue";

const tabs: { key: TabKey; label: string; icon: Component }[] = [
  { key: "all", label: "全部", icon: AppsOutline },
  { key: "text", label: "文本", icon: TextOutline },
  { key: "files", label: "文件", icon: DocumentAttachOutline },
  { key: "image", label: "图片", icon: ImageOutline },
];

const appStore = useAppStore();

const isActive = (key: TabKey) => appStore.activeTab === key;

const handleTabClick = (key: TabKey) => {
  appStore.activeTab = key;
};
</script>

<style scoped lang="scss">
.clipboard-tabs {
  padding: 6px;
  background-color: #f0f3f7;
}
</style>
