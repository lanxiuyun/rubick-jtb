<template>
  <div class="clipboard-tabs">
    <n-tabs v-model:value="appStore.activeTab" type="line" size="small">
      <n-tab-pane
        v-for="tab in tabs"
        :key="tab.key"
        :name="tab.key"
        :tab="tab.label"
      />
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import type { TabKey } from "@/stores/app";
import { useAppStore } from "@/stores/app";
import { NTabs } from "naive-ui";

const tabs: { key: TabKey; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "text", label: "文本" },
  { key: "files", label: "文件" },
  { key: "image", label: "图片" },
];

const appStore = useAppStore();
</script>

<style scoped lang="scss">
.clipboard-tabs {
  padding: 8px 16px 0;
  background: #fff;
}
</style>
