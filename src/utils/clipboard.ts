import type { ClipboardEntry, ClipboardRecord } from "@/types/services";
import { matchText } from "./pinyin";

const FILES_SEARCH_CACHE_MAX = 60000;
const filesSearchTextCache = new Map<string, string>();

function getCachedFilesHaystack(cacheKey: string): string | undefined {
  const cached = filesSearchTextCache.get(cacheKey);
  if (!cached) return undefined;
  // LRU：命中时移动到队尾
  filesSearchTextCache.delete(cacheKey);
  filesSearchTextCache.set(cacheKey, cached);
  return cached;
}

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
  // 大数据量时避免 Map + sort + 大量对象拷贝
  // 假设 serviceRecords 已经按 timestamp 倒序（fetchRecords/addRecord 会保证）
  const favoriteSet = new Set<string>();
  for (const fav of favoritesRecords) {
    favoriteSet.add(fav.hash);
    // 虚拟列表用：尽量只设置一次 key，避免 UI 层每次 map spread 产生大量新对象
    (fav as any).key ??= fav.hash;
    fav.favorite = true;
  }

  const merged: ClipboardEntry[] = [];
  const serviceHashSet = new Set<string>();

  for (const r of serviceRecords) {
    const entry = r as ClipboardEntry;
    entry.favorite = favoriteSet.has(r.hash);
    (entry as any).key ??= r.hash;
    merged.push(entry);
    serviceHashSet.add(r.hash);
  }

  // 补全已过期的收藏（不在 serviceRecords 中）
  // 通常数量不大；这里不做全量 sort，直接追加即可（一般也更符合“历史在前，过期收藏在后”）
  for (const fav of favoritesRecords) {
    if (!serviceHashSet.has(fav.hash)) {
      merged.push(fav);
    }
  }

  return merged;
}

/**
 * 筛选和搜索记录
 */
export function filterRecords(
  records: ClipboardEntry[],
  activeTab: string,
  searchKeyword: string
): ClipboardEntry[] {
  const keyword = searchKeyword.trim();
  // 没有任何筛选条件时直接返回，避免不必要的遍历
  if (activeTab === "all" && !keyword) return records;

  const start = performance.now();
  const hasKeyword = !!keyword;
  const needFavorite = activeTab === "favorite";
  const needType = activeTab !== "all" && !needFavorite;

  const result: ClipboardEntry[] = [];
  for (let i = 0; i < records.length; i++) {
    const record = records[i];

    // 1) Tab 筛选（尽早跳过）
    if (needFavorite && !record.favorite) continue;
    if (needType && record.type !== activeTab) continue;

    // 2) 关键词搜索
    if (hasKeyword) {
      if (record.type === "text" && typeof record.value === "string") {
        if (!matchText(record.value, keyword)) continue;
      } else if (record.type === "image" && typeof record.value === "string") {
        if (!matchText(record.value, keyword)) continue;
      } else if (record.type === "files" && Array.isArray(record.value)) {
        const cacheKey = record.hash || `${record.timestamp}`;
        let haystack = getCachedFilesHaystack(cacheKey);
        if (!haystack) {
          // 把文件名和路径合并成一个字符串，减少 matchText 调用次数
          // 绝大多数路径是英文/数字，matchText 会在“关键词含字母且文本含中文”才走拼音，因此不会额外放大成本
          const parts: string[] = [];
          for (let j = 0; j < record.value.length; j++) {
            const f = record.value[j];
            parts.push(f.name, f.path);
          }
          haystack = parts.join("\n");
          filesSearchTextCache.set(cacheKey, haystack);
          while (filesSearchTextCache.size > FILES_SEARCH_CACHE_MAX) {
            const oldestKey = filesSearchTextCache.keys().next()
              .value as string | undefined;
            if (!oldestKey) break;
            filesSearchTextCache.delete(oldestKey);
          }
        }
        if (!matchText(haystack, keyword)) continue;
      } else {
        continue;
      }
    }

    result.push(record);
  }

  const end = performance.now();

  // eslint-disable-next-line no-console
  console.debug(
    `[filterRecords] 过滤用时: ${(end - start).toFixed(2)} ms, 总数: ${
      records.length
    }, 结果: ${result.length}`
  );

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
