<template>
  <div v-for="record in appStore.records" :key="record.hash">
    <div>{{ record.value }}</div>
  </div>
</template>

<script setup lang="ts">
import { use_app_store } from "@/stores/app";
import { TEST_DATA } from "@/tests/data";
import { onMounted } from "vue";

const appStore = use_app_store();
const is_dev = window.rubick ? false : true;

if (is_dev) {
  appStore.records = TEST_DATA.records;
} else {
  onMounted(async () => {
    await appStore.fetchRecords();

    // 监听新增记录
    window.services.listenAppendRecord((newRecord) => {
      appStore.records = [newRecord, ...appStore.records];
    });
  });
}
</script>
