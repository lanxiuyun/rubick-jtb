<template>
  <div class="clipboard-tabs">
    <n-tabs 
      v-model:value="activeTab" 
      type="line" 
      size="small"
      @update:value="handleTabChange"
    >
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
import { useAppStore } from "@/stores/app";
import type { TabKey } from "@/stores/app";
import { computed } from "vue";
import { NTabs, NTabPane } from "naive-ui";

interface Tab {
  key: TabKey;
  label: string;
}

const tabs: Tab[] = [
  { key: "all", label: "全部" },
  { key: "text", label: "文本" },
  { key: "files", label: "文件" },
  { key: "image", label: "图片" },
];

const appStore = useAppStore();
const activeTab = computed({
  get: () => appStore.activeTab,
  set: (value: TabKey) => appStore.setActiveTab(value),
});

const handleTabChange = (value: TabKey) => {
  appStore.setActiveTab(value);
};
</script>

<style scoped lang="scss">
.clipboard-tabs {
  padding: 8px 16px 0;
  background: #fff;
}
</style>
