<template>
  <div class="clipboard-item">
    <!-- 时间标签 -->
    <div class="item-time">{{ timeLabel }}</div>

    <!-- 内容区域 -->
    <div class="item-content">
      <!-- 文本类型 -->
      <div v-if="record.type === 'text'" class="text-content">
        {{ displayText }}
      </div>

      <!-- 图片类型 -->
      <div v-else-if="record.type === 'image'" class="image-content">
        <n-image
          :src="imageUrl"
          width="80"
          height="60"
          object-fit="cover"
          class="thumbnail"
        />
        <div class="image-info">
          <div v-if="fileSize">{{ fileSize }}</div>
          <div v-if="imageDimensions">{{ imageDimensions }}</div>
        </div>
      </div>

      <!-- 文件类型 -->
      <div v-else-if="record.type === 'files'" class="files-content">
        <!-- 单个文件 -->
        <div v-if="filesInfo.length === 1" class="single-file">
          <span class="file-icon">{{ filesInfo[0].icon }}</span>
          <div>
            <div class="file-name">{{ filesInfo[0].name }}</div>
            <div class="file-path">{{ filesInfo[0].path }}</div>
          </div>
        </div>

        <!-- 多个文件 -->
        <div v-else>
          <div class="files-header">
            <span class="file-icon">📦</span>
            <span>{{ filesInfo.length }} 个项目</span>
          </div>
          <div class="files-list">
            <div v-for="(file, idx) in filesInfo" :key="idx" class="file-item">
              <span class="file-icon-small">{{ file.icon }}</span>
              <span>{{ file.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 序号 -->
    <div class="item-index">{{ index }}</div>
  </div>
</template>

<script setup lang="ts">
import type { ClipboardRecord } from "@/types/services";
import { formatFileSize, truncateText } from "@/utils/clipboard";
import { getRelativeTime } from "@/utils/time";
import { NImage } from "naive-ui";
import { computed, onMounted, ref } from "vue";

interface Props {
  record: ClipboardRecord;
  index: number;
}

const props = defineProps<Props>();

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
</script>

<style scoped lang="scss">
.clipboard-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  background: #fafafa;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f0f0f0;
  }

  .item-time {
    flex-shrink: 0;
    width: 70px;
    font-size: 12px;
    color: #999;
  }

  .item-content {
    flex: 1;
    min-width: 0;
    font-size: 13px;

    .text-content {
      line-height: 1.5;
      color: #333;
      word-break: break-word;
    }

    .image-content {
      display: flex;
      gap: 10px;

      .thumbnail {
        border-radius: 4px;
      }

      .image-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 12px;
        color: #666;
      }
    }

    .files-content {
      .single-file {
        display: flex;
        gap: 8px;

        .file-icon {
          font-size: 20px;
        }

        .file-name {
          color: #333;
          margin-bottom: 2px;
        }

        .file-path {
          font-size: 11px;
          color: #999;
          word-break: break-all;
        }
      }

      .files-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;

        .file-icon {
          font-size: 20px;
        }
      }

      .files-list {
        padding-left: 28px;

        .file-item {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
          font-size: 12px;
          color: #666;

          .file-icon-small {
            font-size: 14px;
          }
        }
      }
    }
  }

  .item-index {
    flex-shrink: 0;
    font-size: 14px;
    color: #999;
    min-width: 20px;
    text-align: right;
  }
}
</style>
