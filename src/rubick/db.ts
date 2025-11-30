/**
 * 数据库操作示例
 * rubick db 是基于开源的 pouchdb 封装的
// 创建请求
window.rubick.db.put({
  _id: "demo",
  data: "demo"
})
// 返回 {id: "demo", ok: true, rev: "1-05c9b92e6f24287dc1f4ec79d9a34fa8"}

// 更新请求
window.rubick.db.put({
  _id: "demo",
  data: "demo",
  _rev: "1-05c9b92e6f24287dc1f4ec79d9a34fa8"
})

window.rubick.db.get("demo")
// 返回 {_id: "demo", _rev: "3-9836c5c68af5aef618e17d615882942a", data: "demo"}
*/

import type { ClipboardRecord } from "@/types/services";

const lanxiuyun_clipboard_key = "lanxiuyun_clipboard";

const getClipboardData = async (): Promise<ClipboardRecord[]> => {
  try {
    const data = await window.rubick.db.get(lanxiuyun_clipboard_key);
    return JSON.parse(data.data) as ClipboardRecord[];
  } catch (error) {
    return [];
  }
};

const setClipboardData = async (data: ClipboardRecord[]): Promise<void> => {
  try {
    // 先获取当前文档以获得 _rev
    const existingDoc = await window.rubick.db.get(lanxiuyun_clipboard_key);
    await window.rubick.db.put({
      _id: lanxiuyun_clipboard_key,
      _rev: existingDoc._rev, // 必须包含 _rev 字段
      data: JSON.stringify(data),
    });
  } catch (error: any) {
    // 如果文档不存在，创建新文档
    if (error.status === 404) {
      await window.rubick.db.put({
        _id: lanxiuyun_clipboard_key,
        data: JSON.stringify(data),
      });
    } else {
      throw error;
    }
  }
};

const RUBICK_DB = {
  getClipboardData,
  setClipboardData,
};

export default RUBICK_DB;
