<template>
  <n-scrollbar class="clipboard-list">
    <div style="padding: 12px">
      <ClipboardItem
        v-for="(record, index) in appStore.filteredRecords"
        :key="record.hash"
        :record="record"
        :index="index + 1"
        @click="handleItemClick"
      />

      <n-empty
        v-if="appStore.filteredRecords.length === 0"
        description="暂无剪贴板记录"
        size="small"
        style="padding: 40px 0"
      />
    </div>
  </n-scrollbar>
</template>

<script setup lang="ts">
import type { ClipboardRecord } from "@/types/services";
import { useAppStore } from "@/stores/app";
import { NScrollbar, NEmpty } from "naive-ui";
import ClipboardItem from "./ClipboardItem.vue";

const appStore = useAppStore();

const handleItemClick = (record: ClipboardRecord) => {
  if (record.type === "text") {
    navigator.clipboard.writeText(record.value as string);
  }
  console.log("点击记录:", record);
};
</script>

<style scoped lang="scss">
.clipboard-list {
  flex: 1;
  height: 100%;
}
</style>
