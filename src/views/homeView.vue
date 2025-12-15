<template>
  <div class="home-view">
    <ClipboardTabs />
    <ClipboardList />
  </div>
</template>

<script setup lang="ts">
import ClipboardList from "@/components/ClipboardList.vue";
import ClipboardTabs from "@/components/ClipboardTabs.vue";
import useAppStore from "@/stores/app";
import { TEST_DATA } from "@/tests/data";
import { onMounted } from "vue";

const appStore = useAppStore();

if (window.rubick) {
  onMounted(async () => {
    await appStore.fetchRecords();

    // 监听新增记录
    window.services.listenAppendRecord((newRecord) => {
      appStore.addRecord(newRecord);
    });
  });
} else {
  appStore.serviceRecords = TEST_DATA.records;
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
