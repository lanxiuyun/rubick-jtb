import { pinyin } from "pinyin-pro";

type CachedTextInfo = {
  lower?: string;
  pinyinFull?: string;
  pinyinFullNoSpace?: string;
  pinyinFirst?: string;
  pinyinFirstNoSpace?: string;
};

// 缓存：同一段文本会在用户输入搜索词的每个 key stroke 上被重复匹配
// 这里缓存 lower/pinyin 结果，避免重复计算导致卡顿
// 5.5w 级别数据下，连续搜索会频繁重复匹配同一批文本；用 LRU 保留“最近用过的”更稳
// 注意：缓存会占用内存，数值越大命中率越高但内存越大
const TEXT_CACHE_MAX = 10000;
const textInfoCache = new Map<string, CachedTextInfo>();

const SPACE_RE = /\s+/g;
const CJK_RE = /[\u4e00-\u9fff]/;
const HAS_LATIN_RE = /[a-z]/i;

function getOrCreateTextInfo(text: string): CachedTextInfo {
  const cached = textInfoCache.get(text);
  if (cached) {
    // LRU：命中时移动到队尾
    textInfoCache.delete(text);
    textInfoCache.set(text, cached);
    return cached;
  }

  const info: CachedTextInfo = {};
  textInfoCache.set(text, info);

  // LRU 淘汰最老的 key，避免超过上限时清空导致命中率抖动
  while (textInfoCache.size > TEXT_CACHE_MAX) {
    const oldestKey = textInfoCache.keys().next().value as string | undefined;
    if (!oldestKey) break;
    textInfoCache.delete(oldestKey);
  }

  return info;
}

function getLower(text: string, info: CachedTextInfo): string {
  if (info.lower) return info.lower;
  const lower = text.toLowerCase();
  // 大文本缓存 lower 可能导致较大内存占用，这里只缓存一定长度以内的
  if (text.length <= 2048) {
    info.lower = lower;
  }
  return lower;
}

function ensurePinyinFull(text: string, info: CachedTextInfo) {
  if (info.pinyinFull && info.pinyinFullNoSpace) return;
  const full = pinyin(text, { toneType: "none" }).toLowerCase();
  info.pinyinFull = full;
  info.pinyinFullNoSpace = full.replace(SPACE_RE, "");
}

function ensurePinyinFirst(text: string, info: CachedTextInfo) {
  if (info.pinyinFirst && info.pinyinFirstNoSpace) return;
  const first = pinyin(text, {
    pattern: "first",
    toneType: "none",
  }).toLowerCase();
  info.pinyinFirst = first;
  info.pinyinFirstNoSpace = first.replace(SPACE_RE, "");
}

/**
 * 判断文本是否匹配搜索关键词（支持中文拼音和首字母匹配）
 * @param text 要搜索的文本
 * @param keyword 搜索关键词
 * @returns 是否匹配
 */
export function matchText(text: string, keyword: string): boolean {
  if (!text || !keyword) return false;

  const keywordLower = keyword.trim().toLowerCase();
  if (!keywordLower) return false;

  const info = getOrCreateTextInfo(text);
  const textLower = getLower(text, info);

  // 1. 直接文本匹配
  if (textLower.includes(keywordLower)) {
    return true;
  }

  // 拼音匹配只在“关键词包含英文字母且文本包含中文”时才有意义
  // - 关键词是中文：直接 includes 就够了，算拼音纯浪费
  // - 文本不含中文：拼音转换也帮不上忙
  if (!HAS_LATIN_RE.test(keywordLower) || !CJK_RE.test(text)) {
    return false;
  }

  // 2. 拼音全拼匹配（不带音调）
  ensurePinyinFull(text, info);
  if (
    info.pinyinFull!.includes(keywordLower) ||
    info.pinyinFullNoSpace!.includes(keywordLower)
  ) {
    return true;
  }

  // 3. 拼音首字母匹配（延迟计算，只有全拼未命中才算）
  ensurePinyinFirst(text, info);
  if (
    info.pinyinFirst!.includes(keywordLower) ||
    info.pinyinFirstNoSpace!.includes(keywordLower)
  ) {
    return true;
  }

  return false;
}
