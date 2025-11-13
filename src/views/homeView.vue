<template>
  <div class="home-view">
    <ClipboardTabs />
    <ClipboardList
      :records="appStore.filteredRecords"
      @item-click="handleItemClick"
    />
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/stores/app";
import { TEST_DATA } from "@/tests/data";
import { onMounted } from "vue";
import type { ClipboardRecord } from "@/types/services";
import ClipboardTabs from "@/components/ClipboardTabs.vue";
import ClipboardList from "@/components/ClipboardList.vue";

const appStore = useAppStore();
const is_dev = window.rubick ? false : true;

// 处理记录项点击 - 复制到剪贴板
const handleItemClick = (record: ClipboardRecord) => {
  if (record.type === "text") {
    navigator.clipboard.writeText(record.value as string);
  }
  console.log("点击记录:", record);
};

if (is_dev) {
  appStore.records = TEST_DATA.records;
} else {
  onMounted(async () => {
    await appStore.fetchRecords();

    // 监听新增记录
    window.services.listenAppendRecord((newRecord) => {
      appStore.addRecord(newRecord);
    });
  });
}
</script>

<style scoped lang="scss">
.home-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff;
}
</style>
