import RUBICK_DB from "@/rubick/db";
import type { ClipboardRecord } from "@/types/services";
import { matchText } from "@/utils/pinyin";
import { defineStore } from "pinia";

export type TabKey = "all" | "text" | "files" | "image";

export const useAppStore = defineStore("app-store", {
  state: () => ({
    records: [] as ClipboardRecord[],
    activeTab: "all" as TabKey,

    // 用户输入
    textSearch: "" as string,
  }),
  getters: {
    // 根据当前 tab 筛选记录
    filteredRecords(state): ClipboardRecord[] {
      let filteredRecords = state.records;

      // 根据 tab 筛选
      if (state.activeTab !== "all") {
        filteredRecords = filteredRecords.filter(
          (record) => record.type === state.activeTab
        );
      }

      // 根据搜索文本筛选（支持中文拼音和首字母匹配）
      if (state.textSearch) {
        const keyword = state.textSearch;
        filteredRecords = filteredRecords.filter((record) => {
          // 文本类型：搜索 value（支持拼音）
          if (record.type === "text" && typeof record.value === "string") {
            return matchText(record.value, keyword);
          }
          // 文件类型：搜索文件名和路径（支持拼音）
          if (record.type === "files" && Array.isArray(record.value)) {
            return record.value.some(
              (file) =>
                matchText(file.name, keyword) || matchText(file.path, keyword)
            );
          }
          // 图片类型：搜索路径（支持拼音）
          if (record.type === "image" && typeof record.value === "string") {
            return matchText(record.value, keyword);
          }
          return false;
        });
      }

      return filteredRecords;
    },
  },
  actions: {
    async fetchRecords() {
      this.records = await RUBICK_DB.getClipboardData();
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
      await RUBICK_DB.setClipboardData(this.records);
    },
  },
});

export default useAppStore;
