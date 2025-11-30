import RUBICK_DB from "@/rubick/db";
import type { ClipboardRecord } from "@/types/services";
import { matchText } from "@/utils/pinyin";
import { defineStore } from "pinia";

export type TabKey = "all" | "text" | "files" | "image" | "favorite";

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

      // 收藏 tab：只显示收藏的记录
      if (state.activeTab === "favorite") {
        filteredRecords = filteredRecords.filter((record) => record.favorite);
      }
      // 根据 tab 筛选
      else if (state.activeTab !== "all") {
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
        // 如果已存在，保留收藏状态并移除旧的记录
        record.favorite = this.records[existingIndex].favorite;
        this.records.splice(existingIndex, 1);
      }

      this.records = [record, ...this.records];

      // 限制记录数量，但保留所有收藏的记录
      if (this.records.length > 2000) {
        // 将记录分为收藏和非收藏两部分
        const favoriteRecords = this.records.filter((r) => r.favorite);
        const nonFavoriteRecords = this.records.filter((r) => !r.favorite);
        
        // 非收藏记录只保留最新的2000条
        const trimmedNonFavorites = nonFavoriteRecords.slice(0, 2000);
        
        // 合并：保持原有时间顺序
        this.records = [...favoriteRecords, ...trimmedNonFavorites].sort(
          (a, b) => b.timestamp - a.timestamp
        );
      }

      // 更新数据库（添加 await 确保数据同步完成）
      await RUBICK_DB.setClipboardData(this.records);
    },

    // 切换收藏状态
    async toggleFavorite(hash: string) {
      const record = this.records.find((r) => r.hash === hash);
      if (record) {
        record.favorite = !record.favorite;
        // 持久化到数据库
        await RUBICK_DB.setClipboardData(this.records);
      }
    },

    // 手动创建并收藏记录
    async createFavoriteRecord(data: {
      type: "text" | "image" | "files";
      value: string | any;
    }) {
      let hash: string;
      let recordData: ClipboardRecord;

      if (data.type === "image") {
        // 如果是图片类型,需要调用主进程保存图片并获取路径
        if (window.rubick && window.services) {
          try {
            const imagePath = await window.services.saveClipboardImage(data.value);
            hash = `manual_image_${Date.now()}`;
            recordData = {
              type: "image",
              value: imagePath,
              timestamp: Date.now(),
              hash,
              favorite: true,
            };
          } catch (error) {
            console.error("保存图片失败", error);
            throw error;
          }
        } else {
          // 浏览器环境，直接使用 data URL
          hash = `manual_image_${Date.now()}`;
          recordData = {
            type: "image",
            value: data.value,
            timestamp: Date.now(),
            hash,
            favorite: true,
          };
        }
      } else {
        // 文本或文件类型
        const content = JSON.stringify(data.value);
        hash = `manual_${Date.now()}_${content.substring(0, 20)}`;
        recordData = {
          type: data.type as "text" | "files",
          value: data.value,
          timestamp: Date.now(),
          hash,
          favorite: true,
        };
      }

      // 添加到记录列表头部
      this.records = [recordData, ...this.records];

      // 持久化到数据库
      await RUBICK_DB.setClipboardData(this.records);
    },
  },
});

export default useAppStore;
