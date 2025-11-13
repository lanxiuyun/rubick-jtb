<template>
  <div class="clipboard-item" @click="handleClick">
    <div class="item-time">{{ timeLabel }}</div>
    <div class="item-content">
      <!-- 文本类型 -->
      <div v-if="record.type === 'text'" class="text-content">
        {{ displayText }}
      </div>

      <!-- 图片类型 -->
      <div v-else-if="record.type === 'image'" class="image-content">
        <img :src="imageUrl" class="thumbnail" alt="clipboard image" />
        <div class="image-info">
          <div v-if="fileSize" class="file-size">{{ fileSize }}</div>
          <div v-if="imageDimensions" class="dimensions">
            {{ imageDimensions }}
          </div>
        </div>
      </div>

      <!-- 文件类型 -->
      <div v-else-if="record.type === 'files'" class="files-content">
        <div v-if="filesInfo.length === 1" class="single-file">
          <div class="file-icon">{{ filesInfo[0].icon }}</div>
          <div class="file-details">
            <div class="file-name">{{ filesInfo[0].name }}</div>
            <div class="file-path">{{ filesInfo[0].path }}</div>
          </div>
        </div>
        <div v-else class="multiple-files">
          <div class="files-header">
            <div class="file-icon">📦</div>
            <div class="files-count">{{ filesInfo.length }} 个项目</div>
          </div>
          <div class="files-list">
            <div v-for="(file, idx) in filesInfo" :key="idx" class="file-item">
              <span class="file-icon-small">{{ file.icon }}</span>
              <span class="file-name-small">{{ file.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="item-index">{{ index }}</div>
  </div>
</template>

<script setup lang="ts">
import type { ClipboardRecord } from "@/types/services";
import { truncateText, formatFileSize } from "@/utils/clipboard";
import { getRelativeTime } from "@/utils/time";
import { computed, ref, onMounted } from "vue";

interface Props {
  record: ClipboardRecord;
  index: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  click: [record: ClipboardRecord];
}>();

const imageDimensions = ref<string>("");

// 时间标签
const timeLabel = computed(() => {
  return getRelativeTime(props.record.timestamp);
});

// 显示的文本内容（截断）
const displayText = computed(() => {
  if (props.record.type === "text") {
    return truncateText(props.record.value as string, 150);
  }
  return "";
});

// 图片URL
const imageUrl = computed(() => {
  if (props.record.type === "image") {
    return `file:///${props.record.value}`;
  }
  return "";
});

// 文件大小
const fileSize = computed(() => {
  if (props.record.type === "image" && "size" in props.record) {
    return formatFileSize((props.record as any).size);
  }
  return "";
});

// 文件信息列表
interface FileInfo {
  name: string;
  path: string;
  icon: string;
  isDirectory: boolean;
}

const filesInfo = computed<FileInfo[]>(() => {
  if (props.record.type === "files") {
    const files = props.record.value as {
      isFile: boolean;
      isDirectory: boolean;
      name: string;
      path: string;
    }[];

    return files.map((file) => ({
      name: file.name,
      path: file.path,
      icon: file.isDirectory ? "📁" : getFileIcon(file.name),
      isDirectory: file.isDirectory,
    }));
  }
  return [];
});

// 根据文件扩展名获取图标
const getFileIcon = (fileName: string): string => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const iconMap: Record<string, string> = {
    // 图片
    png: "🖼️",
    jpg: "🖼️",
    jpeg: "🖼️",
    gif: "🖼️",
    bmp: "🖼️",
    svg: "🖼️",
    webp: "🖼️",
    // 文档
    txt: "📄",
    doc: "📝",
    docx: "📝",
    pdf: "📕",
    md: "📝",
    // 代码
    js: "📜",
    ts: "📜",
    vue: "📜",
    html: "📜",
    css: "📜",
    scss: "📜",
    json: "📜",
    xml: "📜",
    // 压缩文件
    zip: "📦",
    rar: "📦",
    "7z": "📦",
    tar: "📦",
    gz: "📦",
    // 视频
    mp4: "🎬",
    avi: "🎬",
    mkv: "🎬",
    mov: "🎬",
    // 音频
    mp3: "🎵",
    wav: "🎵",
    flac: "🎵",
    // 其他
    exe: "⚙️",
    apk: "📱",
    ipa: "📱",
  };
  return iconMap[ext || ""] || "📄";
};

// 加载图片尺寸
onMounted(async () => {
  if (props.record.type === "image") {
    try {
      const img = new Image();
      img.onload = () => {
        imageDimensions.value = `${img.width} x ${img.height}`;
      };
      img.src = imageUrl.value;
    } catch (error) {
      console.error("Failed to load image dimensions:", error);
    }
  }
});

const handleClick = () => {
  emit("click", props.record);
};
</script>

<style scoped lang="scss">
.clipboard-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .item-time {
    flex-shrink: 0;
    width: 80px;
    font-size: 13px;
    color: #9ca3af;
    line-height: 1.4;
  }

  .item-content {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .text-content {
    font-size: 14px;
    line-height: 1.6;
    color: #374151;
    word-break: break-word;
    white-space: pre-wrap;
  }

  .image-content {
    display: flex;
    gap: 12px;
    align-items: flex-start;

    .thumbnail {
      width: 120px;
      height: 80px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      flex-shrink: 0;
    }

    .image-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 13px;
      color: #6b7280;

      .file-size,
      .dimensions {
        line-height: 1.4;
      }
    }
  }

  .files-content {
    width: 100%;

    .single-file {
      display: flex;
      align-items: flex-start;
      gap: 8px;

      .file-icon {
        font-size: 24px;
        flex-shrink: 0;
      }

      .file-details {
        flex: 1;
        min-width: 0;

        .file-name {
          font-size: 14px;
          color: #374151;
          word-break: break-word;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .file-path {
          font-size: 12px;
          color: #9ca3af;
          word-break: break-all;
        }
      }
    }

    .multiple-files {
      .files-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        .file-icon {
          font-size: 24px;
        }

        .files-count {
          font-size: 14px;
          color: #374151;
          font-weight: 500;
        }
      }

      .files-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding-left: 32px;

        .file-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6b7280;

          .file-icon-small {
            font-size: 16px;
            flex-shrink: 0;
          }

          .file-name-small {
            word-break: break-word;
          }
        }
      }
    }
  }

  .item-index {
    flex-shrink: 0;
    margin-left: 16px;
    font-size: 16px;
    font-weight: 500;
    color: #9ca3af;
    min-width: 24px;
    text-align: right;
  }
}
</style>
