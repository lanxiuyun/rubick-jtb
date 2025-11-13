<template>
  <div class="home-view">
    <ClipboardTabs />
    <ClipboardList />
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/stores/app";
import { TEST_DATA } from "@/tests/data";
import { onMounted } from "vue";
import ClipboardTabs from "@/components/ClipboardTabs.vue";
import ClipboardList from "@/components/ClipboardList.vue";

const appStore = useAppStore();
const is_dev = window.rubick ? false : true;

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
