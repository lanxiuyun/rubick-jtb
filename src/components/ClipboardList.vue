<template>
  <n-scrollbar class="list-scroll">
    <div class="list-container">
      <ClipboardItem
        v-for="(record, index) in records"
        :key="record.hash"
        :record="record"
        :index="index + 1"
        @click="handleClickItem(record)"
      />

      <n-empty
        v-if="!hasRecords"
        description="暂无剪贴板记录"
        size="small"
        class="empty-state"
      />
    </div>
  </n-scrollbar>

  <!-- 添加常用数据按钮（仅在收藏标签页显示） -->
  <n-button
    v-if="isFavoriteTab"
    circle
    size="large"
    type="primary"
    class="float-btn"
    @click="showAddModal = true"
  >
    <template #icon>
      <n-icon>
        <AddOutline />
      </n-icon>
    </template>
  </n-button>

  <!-- 添加常用数据弹窗 -->
  <AddFavoriteModal
    v-model:show="showAddModal"
    @submit="handleAddFavorite"
  />
</template>

<script setup lang="ts">
import useAppStore from "@/stores/app";
import type { ClipboardRecord } from "@/types/services";
import { AddOutline } from "@/utils/icons";
import { NButton, NEmpty, NIcon, NScrollbar } from "naive-ui";
import { computed, ref } from "vue";
import AddFavoriteModal from "./AddFavoriteModal.vue";
import ClipboardItem from "./ClipboardItem.vue";

const appStore = useAppStore();
const records = computed(() => appStore.filteredRecords);
const hasRecords = computed(() => records.value.length > 0);
const isFavoriteTab = computed(() => appStore.activeTab === "favorite");

const showAddModal = ref(false);

const handleClickItem = async (record: ClipboardRecord) => {
  if (window.rubick) {
    window.services.executeCopy([record]);
    return;
  }

  if (record.type === "text") {
    try {
      await navigator.clipboard.writeText(record.value as string);
    } catch (error) {
      console.error("复制文本失败", error);
    }
  }
};

const handleAddFavorite = async (data: {
  type: "text" | "image" | "files";
  value: string | any;
}) => {
  await appStore.createFavoriteRecord(data);
};
</script>

<style scoped lang="scss">
.clipboard-box {
  width: 100%;
  max-width: 800px;
  height: calc(100vh - 60px);
  margin: 0 auto;
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: v-sans, system-ui, -apple-system, sans-serif;
}

.header {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
}

.header-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.list-scroll {
  flex: 1;
  background-color: #fff;
}

.list-container {
  padding: 8px;
}

.float-btn {
  position: absolute;
  bottom: 24px;
  right: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.empty-state {
  padding: 40px 0;
}
</style>
