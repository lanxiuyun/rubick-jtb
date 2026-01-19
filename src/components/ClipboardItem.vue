<template>
  <div class="list-item" :class="{ selected: selected }" ref="itemRef">
    <div class="item-time">{{ timeLabel }}</div>

    <div class="item-content">
      <!-- 图片类型 -->
      <div v-if="record.type === 'image'" class="image-block">
        <div class="image-preview" @click.stop>
          <n-image
            :src="imageUrl"
            height="120"
            width="120"
            object-fit="cover"
          />
        </div>
        <div v-if="fileSize || imageDimensions" class="meta-info">
          <span v-if="fileSize">{{ fileSize }}</span>
          <span v-if="imageDimensions">{{ imageDimensions }}</span>
        </div>
      </div>

      <!-- 文本类型 -->
      <div v-else-if="record.type === 'text'" class="text-block">
        {{ displayText }}
      </div>

      <!-- 文件类型 -->
      <div v-else class="file-block">
        <!-- 单个图片文件额外显示预览 -->
        <div v-if="isSingleImageFile" class="image-block">
          <div class="image-preview" @click.stop>
            <n-image
              :src="singleImageUrl"
              height="120"
              width="120"
              object-fit="cover"
            />
          </div>
        </div>
        <!-- 文件列表 -->
        <div
          v-for="(file, idx) in displayedFiles"
          :key="`${file.path}-${idx}`"
          class="file-row"
        >
          <n-icon :color="file.color" size="16">
            <component :is="file.icon" />
          </n-icon>
          <span class="file-name">{{ file.name }}</span>
        </div>
        <div v-if="hasMoreFiles" class="show-more" @click.stop="toggleShowAll">
          {{ showAllFiles ? "收起" : `显示更多 ${remainingFilesCount} 条信息` }}
        </div>
      </div>
    </div>

    <div class="item-actions" :class="{ 'is-favorite': isFavorite }">
      <n-button
        text
        circle
        size="small"
        class="favorite-btn"
        @click.stop="handleToggleFavorite"
      >
        <template #icon>
          <n-icon :size="20" :color="isFavorite ? '#fadb14' : '#d9d9d9'">
            <StarOutline
              :theme="isFavorite ? 'filled' : 'outline'"
              :fill="isFavorite ? ['#fadb14'] : ['currentColor']"
            />
          </n-icon>
        </template>
      </n-button>
    </div>

    <div class="item-index">{{ index }}</div>
  </div>
</template>

<script setup lang="ts">
import useAppStore from "@/stores/app";
import type { ClipboardEntry, FileInfo } from "@/types/services";
import { formatFileSize, getImageDimensions, truncateText } from "@/utils/clipboard";
import {
  AppsOutline,
  DocumentAttachOutline,
  ImageOutline,
  StarOutline,
} from "@/utils/icons";
import { getRelativeTime } from "@/utils/time";
import { NButton, NIcon, NImage } from "naive-ui";
import type { Component } from "vue";
import { computed, ref, watch } from "vue";

interface FileItemInfo extends FileInfo {
  icon: Component;
  color: string;
}

const props = defineProps<{
  record: ClipboardEntry;
  index: number;
  selected?: boolean;
  scrollBehavior?: "nearest" | "center";
}>();

const appStore = useAppStore();
const itemRef = ref<HTMLElement | null>(null);

const timeLabel = computed(() => getRelativeTime(props.record.timestamp));

// ===== 收藏相关 =====
const isFavorite = computed(() => !!props.record.favorite);

const handleToggleFavorite = async () => {
  await appStore.toggleFavorite(props.record.hash);
};

// ===== 文本类型相关 =====
const displayText = computed(() =>
  props.record.type === "text"
    ? truncateText(props.record.value as string, 150)
    : ""
);

// ===== 图片类型相关 =====
const imageDimensions = ref("");

const imageUrl = computed(() =>
  props.record.type === "image" ? `file:///${props.record.value}` : ""
);

const fileSize = computed(() => {
  if (props.record.type === "image" && typeof props.record.size === "number") {
    return formatFileSize(props.record.size);
  }
  return "";
});

watch(
  imageUrl,
  async (url) => {
    if (!url) {
      imageDimensions.value = "";
      return;
    }

    const currentUrl = url;
    try {
      const { width, height } = await getImageDimensions(url);
      if (imageUrl.value !== currentUrl) return;
      imageDimensions.value = `${width} x ${height}`;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("图片尺寸获取失败", error);
      if (imageUrl.value === currentUrl) {
        imageDimensions.value = "";
      }
    }
  },
  { immediate: true }
);

// ===== 选中状态自动滚动 =====
watch(
  () => props.selected,
  (isSelected) => {
    if (isSelected && itemRef.value) {
      itemRef.value.scrollIntoView({
        behavior: "auto",
        block: props.scrollBehavior || "nearest",
      });
    }
  }
);

// ===== 文件类型相关 =====
const IMAGE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "bmp",
  "svg",
  "webp",
]);

const showAllFiles = ref(false);

const getFileItemInfo = (file: FileInfo): FileItemInfo => {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const isImage = IMAGE_EXTENSIONS.has(ext);

  if (file.isDirectory) {
    return { ...file, icon: AppsOutline, color: "#3b82f6" };
  }

  if (isImage) {
    return { ...file, icon: ImageOutline, color: "#10b981" };
  }

  return { ...file, icon: DocumentAttachOutline, color: "#2563eb" };
};

const filesInfo = computed<FileItemInfo[]>(() => {
  if (props.record.type !== "files") return [];

  const files = props.record.value as FileInfo[];
  return files.map(getFileItemInfo);
});

const hasMoreFiles = computed(() => filesInfo.value.length > 5);

const remainingFilesCount = computed(() =>
  Math.max(0, filesInfo.value.length - 5)
);

const displayedFiles = computed(() => {
  if (showAllFiles.value) {
    return filesInfo.value;
  }
  return filesInfo.value.slice(0, 5);
});

const toggleShowAll = () => {
  showAllFiles.value = !showAllFiles.value;
};

// ===== 单个图片文件预览相关 =====
const isSingleImageFile = computed(() => {
  if (props.record.type !== "files") return false;

  const files = props.record.value as FileInfo[];
  if (files.length !== 1) return false;

  const file = files[0];
  if (!file.isFile) return false;

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  return IMAGE_EXTENSIONS.has(ext);
});

const singleImageUrl = computed(() => {
  if (!isSingleImageFile.value) return "";

  const files = props.record.value as FileInfo[];
  return `file:///${files[0].path}`;
});
</script>

<style scoped lang="scss">
.list-item {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  border-radius: 4px;
  position: relative;
  border-left: 3px solid transparent;

  &:hover,
  &.selected {
    background-color: #f5f5f5;
    border-left-color: var(--n-color, #18a058);

    .item-time {
      color: var(--n-color, #18a058);
      font-weight: 500;
    }

    .item-index {
      color: var(--n-color, #18a058);
      font-weight: 600;
    }

    .item-actions {
      opacity: 1;
    }
  }
}

.item-time {
  width: 80px;
  font-size: 13px;
  padding-top: 4px;
  flex-shrink: 0;
  color: #666;
  transition: all 0.3s ease;
}

.item-content {
  flex: 1;
  padding-right: 16px;
  min-width: 0;
}

.item-actions {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin-right: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;

  // 已收藏的项目始终显示星星
  &.is-favorite {
    opacity: 1;
  }

  .favorite-btn {
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.2);
    }

    &:active {
      transform: scale(0.9);
    }
  }
}

.item-index {
  width: 30px;
  text-align: right;
  color: #999;
  transition: all 0.3s ease;
}

.text-block {
  word-break: break-word;
}

.image-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-preview {
  width: fit-content;
  cursor: pointer;
}

.meta-info {
  font-size: 12px;
  color: #999;
  display: flex;
  gap: 12px;
}

.file-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #555;
}

.file-name {
  color: #333;
}

.show-more {
  font-size: 12px;
  color: var(--n-color, #18a058);
  cursor: pointer;
  padding: 6px 0;
  transition: all 0.3s ease;
  user-select: none;

  &:hover {
    color: var(--n-color-hover, #36ad6a);
    font-weight: 500;
  }
}
</style>
