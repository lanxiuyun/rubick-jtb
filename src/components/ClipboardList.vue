<template>
  <n-scrollbar class="clipboard-list">
    <div style="padding: 12px">
      <ClipboardItem
        v-for="(record, index) in appStore.filteredRecords"
        :key="record.hash"
        :record="record"
        :index="index + 1"
        @click="handleClick(record)"
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
import { useAppStore } from "@/stores/app";
import type { ClipboardRecord } from "@/types/services";
import { NEmpty, NScrollbar } from "naive-ui";
import ClipboardItem from "./ClipboardItem.vue";

const appStore = useAppStore();

const handleClick = (record: ClipboardRecord) => {
  if (appStore.isRubick) {
    window.services.executeCopy([record]);
  } else {
    if (record.type === "text") {
      navigator.clipboard.writeText(record.value as string);
    }
  }
};
</script>

<style scoped lang="scss">
.clipboard-list {
  flex: 1;
  height: 100%;
}
</style>
