import clipboardDb from "@/rubick/db";
import type { ClipboardRecord } from "@/types/services";
import { defineStore } from "pinia";

export type TabKey = "all" | "text" | "files" | "image";

export const useAppStore = defineStore("app-store", {
  state: () => ({
    records: [] as ClipboardRecord[],
    activeTab: "all" as TabKey,
  }),
  getters: {
    // 根据当前 tab 筛选记录
    filteredRecords(state): ClipboardRecord[] {
      if (state.activeTab === "all") {
        return state.records;
      }
      return state.records.filter((record) => record.type === state.activeTab);
    },
  },
  actions: {
    async fetchRecords() {
      this.records = await clipboardDb.getClipboardData();
    },

    async addRecord(record: ClipboardRecord) {
      // 去重：检查是否已存在相同 hash 的记录
      const existingIndex = this.records.findIndex(
        (r) => r.hash === record.hash
      );
      if (existingIndex !== -1) {
        // 如果已存在，移除旧的记录
        this.records.splice(existingIndex, 1);
      }

      this.records = [record, ...this.records];

      // 限制最多2000条记录，只保留最新的2000条
      this.records = this.records.slice(0, 2000);

      // 更新数据库（添加 await 确保数据同步完成）
      await clipboardDb.setClipboardData(this.records);
    },
  },
});

export default useAppStore;
