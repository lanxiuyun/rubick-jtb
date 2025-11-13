<template>
  <div class="home-view">
    <ClipboardTabs @tab-change="handleTabChange" @copy="handleCopy" />
    <ClipboardList :records="filteredRecords" @item-click="handleItemClick" />

    <!-- debug 用 -->
    <!-- <div v-for="record in appStore.records" :key="record.hash">
        <div>{{ record }}</div>
      </div> -->
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/stores/app";
import { TEST_DATA } from "@/tests/data";
import { computed, onMounted, ref } from "vue";
import type { ClipboardRecord } from "@/types/services";
import ClipboardTabs from "@/components/ClipboardTabs.vue";
import ClipboardList from "@/components/ClipboardList.vue";

type TabKey = "all" | "text" | "files" | "image";

const appStore = useAppStore();
const is_dev = window.rubick ? false : true;
const activeTab = ref<TabKey>("all");

// 根据当前 tab 筛选记录
const filteredRecords = computed(() => {
  if (activeTab.value === "all") {
    return appStore.records;
  }
  return appStore.records.filter((record) => record.type === activeTab.value);
});

// 处理 tab 切换
const handleTabChange = (tab: TabKey) => {
  activeTab.value = tab;
};

// 处理复制按钮点击
const handleCopy = () => {
  // TODO: 实现复制功能
  console.log("复制功能待实现");
};

// 处理记录项点击
const handleItemClick = (record: ClipboardRecord) => {
  // TODO: 实现点击记录项的功能（如复制到剪贴板）
  console.log("点击记录:", record);
};

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

<style scoped lang="scss">
.home-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f9fafb;
}
</style>
