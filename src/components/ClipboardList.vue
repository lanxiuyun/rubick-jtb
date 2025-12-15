<template>
  <div v-if="hasRecords" class="list-wrapper">
    <n-virtual-list
      ref="virtualListRef"
      :items="records"
      :item-size="24"
      :item-resizable="true"
      class="virtual-list"
    >
      <template #default="{ item: record, index }">
        <ClipboardItem
          :record="record"
          :index="index + 1"
          :selected="index === selectedIndex"
          :scroll-behavior="scrollBehavior"
          @click="handleClickItem(record)"
          @mouseenter="handleMouseEnter(index)"
        />
      </template>
    </n-virtual-list>
  </div>

  <n-empty
    v-else
    description="暂无剪贴板记录"
    size="small"
    class="empty-state"
  />

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
  <AddFavoriteModal v-model:show="showAddModal" @submit="handleAddFavorite" />
</template>

<script setup lang="ts">
import useAppStore from "@/stores/app";
import type { ClipboardEntry } from "@/types/services";
import { AddOutline } from "@/utils/icons";
import { NButton, NEmpty, NIcon, NVirtualList } from "naive-ui";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import AddFavoriteModal from "./AddFavoriteModal.vue";
import ClipboardItem from "./ClipboardItem.vue";

const appStore = useAppStore();
const virtualListRef = ref<InstanceType<typeof NVirtualList> | null>(null);

// 虚拟列表数据需要 key 属性，key 属性是虚拟列表的唯一标识
const records = computed(() =>
  appStore.filteredRecords.map((record, index) => ({
    ...record,
    key: record.hash || `record-${index}`,
  }))
);

const hasRecords = computed(() => records.value.length > 0);
const isFavoriteTab = computed(() => appStore.activeTab === "favorite");

const showAddModal = ref(false);
const selectedIndex = ref(0);
const scrollBehavior = ref<"nearest" | "center">("nearest");

// 监听搜索词变化，滚动到顶部
watch(
  () => appStore.textSearch,
  () => {
    virtualListRef.value?.scrollTo({ top: 0 });
  }
);

// 监听记录变化，调整选中索引
watch(records, () => {
  if (records.value.length === 0) {
    selectedIndex.value = 0;
  } else if (selectedIndex.value >= records.value.length) {
    selectedIndex.value = records.value.length - 1;
  }
});

// 鼠标移入处理
const handleMouseEnter = (index: number) => {
  scrollBehavior.value = "nearest";
  selectedIndex.value = index;
};

// 键盘事件处理
const handleKeyDown = (event: KeyboardEvent) => {
  if (!hasRecords.value) return;

  const key = event.key.toLowerCase();

  // 上方向键 或 K 键
  if (key === "arrowup" || key === "k") {
    event.preventDefault();
    scrollBehavior.value = "center";
    if (selectedIndex.value > 0) {
      selectedIndex.value--;
    }
  }
  // 下方向键 或 J 键
  else if (key === "arrowdown" || key === "j") {
    event.preventDefault();
    scrollBehavior.value = "center";
    if (selectedIndex.value < records.value.length - 1) {
      selectedIndex.value++;
    }
  }
  // Enter 键
  else if (key === "enter") {
    event.preventDefault();
    const selectedRecord = records.value[selectedIndex.value];
    if (selectedRecord) {
      handleClickItem(selectedRecord);
    }
  }
};

// 组件挂载时添加键盘监听
onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

// 组件卸载时移除键盘监听
onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

const handleClickItem = async (record: ClipboardEntry) => {
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
.list-wrapper {
  flex: 1;
  /* 移除固定高度计算，使用 flex 自适应 */
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.virtual-list {
  flex: 1;
  height: 100% !important;
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
