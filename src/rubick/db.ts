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


_id 代表这个文档在数据库中唯一值，如果值不存在，则会创建一个新的文档，如果值已经存在，则会进行更新。
你可能已经注意到，返回对象中包含一个 rev 属性，这是代表此文档的版本，每次对文档进行更新时，都要带上最新的版本号，否则更新将失败，版本化的意义在于解决同步时数据冲突。
另外需要注意，每次更新时都要传入完整的文档数据，无法对单个字段进行更新。

_rev 的意义在于：
✅ 防止数据丢失：检测到并发冲突，而不是默默覆盖
✅ 轻量级方案：不需要复杂的锁机制
✅ 支持离线同步：可以检测不同设备间的数据冲突
❌ 代价：需要多一次 get 操作获取最新 _rev
虽然增加了一点复杂度，但换来的是数据的安全性和一致性
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
    // 更新现有文档
    await window.rubick.db.put({
      _id: lanxiuyun_clipboard_key,
      _rev: existingDoc._rev, // 必须包含 _rev 字段
      data: JSON.stringify(data),
    });
  } catch (getError: any) {
    await window.rubick.db.put({
      _id: lanxiuyun_clipboard_key,
      data: JSON.stringify(data),
    });
  }
};

const RUBICK_DB = {
  getClipboardData,
  setClipboardData,
};

export default RUBICK_DB;
