<template>
  <n-scrollbar class="clipboard-list">
    <div style="padding: 12px">
      <ClipboardItem
        v-for="(record, index) in records"
        :key="record.hash"
        :record="record"
        :index="index + 1"
        @click="handleItemClick"
      />

      <n-empty
        v-if="records.length === 0"
        description="暂无剪贴板记录"
        size="small"
        style="padding: 40px 0"
      />
    </div>
  </n-scrollbar>
</template>

<script setup lang="ts">
import type { ClipboardRecord } from "@/types/services";
import { NScrollbar, NEmpty } from "naive-ui";
import ClipboardItem from "./ClipboardItem.vue";

interface Props {
  records: ClipboardRecord[];
}

defineProps<Props>();
const emit = defineEmits<{
  itemClick: [record: ClipboardRecord];
}>();

const handleItemClick = (record: ClipboardRecord) => {
  emit("itemClick", record);
};
</script>

<style scoped lang="scss">
.clipboard-list {
  flex: 1;
  height: 100%;
}
</style>
