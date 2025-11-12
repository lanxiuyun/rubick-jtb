<template>
  <div v-for="record in records" :key="record.hash">
    <div>{{ record.type }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

interface ClipboardRecord {
  hash: string;
  type: "text" | "files" | "image";
  value: any;
  timestamp: string;
}

const records = ref<ClipboardRecord[]>([]);

onMounted(async () => {
  try {
    records.value = await window.services.readAllRecords();

    // 监听新增记录
    window.services.listenAppendRecord((newRecord) => {
      records.value = [newRecord, ...records.value];
    });
  } catch (err) {
    console.error("读取剪贴板历史记录失败", err);
  }
});
</script>
