import type { ClipboardEntry, ClipboardRecord } from "@/types/services";
import { matchText } from "./pinyin";

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串，如 "1.2MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)}${sizes[i]}`;
}

/**
 * 截断文本
 * @param text 原始文本
 * @param maxLength 最大长度
 * @returns 截断后的文本
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
}

/**
 * 获取图片尺寸信息（异步）
 * @param imagePath 图片路径
 * @returns Promise<{width: number, height: number}>
 */
export function getImageDimensions(
  imagePath: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    img.src = imagePath;
  });
}

/**
 * 合并历史记录和收藏记录
 * @param serviceRecords 来自服务的历史记录
 * @param favoritesRecords 来自DB的收藏记录
 */
export function mergeRecords(
  serviceRecords: ClipboardRecord[],
  favoritesRecords: ClipboardEntry[]
): ClipboardEntry[] {
  const recordMap = new Map<string, ClipboardEntry>();

  // 1. 放入 Service 记录 (默认为非收藏)
  serviceRecords.forEach((r) => {
    recordMap.set(r.hash, { ...r, favorite: false });
  });

  // 2. 叠加收藏状态 & 补全已过期的收藏
  favoritesRecords.forEach((fav) => {
    const existing = recordMap.get(fav.hash);
    if (existing) {
      existing.favorite = true;
    } else {
      recordMap.set(fav.hash, { ...fav, favorite: true });
    }
  });

  // 3. 排序 (时间倒序)
  return Array.from(recordMap.values()).sort(
    (a, b) => b.timestamp - a.timestamp
  );
}

/**
 * 筛选和搜索记录
 */
export function filterRecords(
  records: ClipboardEntry[],
  activeTab: string,
  searchKeyword: string
): ClipboardEntry[] {
  let result = records;

  // 1. Tab 筛选
  if (activeTab === "favorite") {
    result = result.filter((r) => r.favorite);
  } else if (activeTab !== "all") {
    result = result.filter((r) => r.type === activeTab);
  }

  // 2. 关键词搜索
  if (searchKeyword) {
    result = result.filter((record) => {
      if (record.type === "text" && typeof record.value === "string") {
        return matchText(record.value, searchKeyword);
      }
      if (record.type === "files" && Array.isArray(record.value)) {
        return record.value.some(
          (file) =>
            matchText(file.name, searchKeyword) ||
            matchText(file.path, searchKeyword)
        );
      }
      if (record.type === "image" && typeof record.value === "string") {
        return matchText(record.value, searchKeyword);
      }
      return false;
    });
  }

  return result;
}

/**
 * 辅助：保存图片到本地（如果是 Rubick 环境）
 */
export async function saveImageIfNeeded(value: string): Promise<string> {
  if (window.rubick && window.services) {
    return await window.services.saveClipboardImage(value);
  }
  return value;
}
