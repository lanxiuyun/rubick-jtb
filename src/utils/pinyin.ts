import { pinyin } from "pinyin-pro";

/**
 * 判断文本是否匹配搜索关键词（支持中文拼音和首字母匹配）
 * @param text 要搜索的文本
 * @param keyword 搜索关键词
 * @returns 是否匹配
 */
export function matchText(text: string, keyword: string): boolean {
  if (!text || !keyword) return false;

  const textLower = text.toLowerCase();
  const keywordLower = keyword.toLowerCase();

  // 1. 直接文本匹配
  if (textLower.includes(keywordLower)) {
    return true;
  }

  // 2. 拼音全拼匹配（不带音调）
  const pinyinFull = pinyin(text, {
    toneType: "none", // 不带音调
  }).toLowerCase();

  if (pinyinFull.includes(keywordLower)) {
    return true;
  }

  // 3. 拼音首字母匹配
  const pinyinFirst = pinyin(text, {
    pattern: "first", // 只返回首字母
    toneType: "none",
  }).toLowerCase();

  if (pinyinFirst.includes(keywordLower)) {
    return true;
  }

  // 4. 去除空格的拼音匹配（处理连续拼音输入）
  const pinyinFullNoSpace = pinyinFull.replace(/\s+/g, "");
  if (pinyinFullNoSpace.includes(keywordLower)) {
    return true;
  }

  const pinyinFirstNoSpace = pinyinFirst.replace(/\s+/g, "");
  if (pinyinFirstNoSpace.includes(keywordLower)) {
    return true;
  }

  return false;
}

