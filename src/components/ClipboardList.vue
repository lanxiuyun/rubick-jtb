<template>
  <div class="clipboard-list">
    <ClipboardItem
      v-for="(record, index) in records"
      :key="record.hash"
      :record="record"
      :index="index + 1"
      @click="handleItemClick"
    />

    <div v-if="records.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <div class="empty-text">暂无剪贴板记录</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ClipboardRecord } from "@/types/services";
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
  padding: 16px;
  height: 100%;
  overflow-y: auto;

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #9ca3af;

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-text {
      font-size: 16px;
    }
  }
}
</style>

