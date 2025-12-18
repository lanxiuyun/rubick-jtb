import RUBICK_DB from "@/rubick/db";
import type { ClipboardEntry, ClipboardRecord } from "@/types/services";
import {
  filterRecords,
  mergeRecords,
  saveImageIfNeeded,
} from "@/utils/clipboard";
import { defineStore } from "pinia";

export type TabKey = "all" | "text" | "files" | "image" | "favorite";

export const useAppStore = defineStore("app-store", {
  state: () => ({
    serviceRecords: [] as ClipboardRecord[], // 历史记录 (Service)
    favoritesRecords: [] as ClipboardEntry[], // 收藏记录 (DB)
    activeTab: "all" as TabKey,
    textSearch: "" as string,
  }),

  getters: {
    // 合并 Service 记录和收藏记录
    records(state): ClipboardEntry[] {
      return mergeRecords(state.serviceRecords, state.favoritesRecords);
    },

    // UI 使用的最终列表 (带筛选)
    filteredRecords(): ClipboardEntry[] {
      return filterRecords(this.records, this.activeTab, this.textSearch);
    },
  },

  actions: {
    async fetchRecords() {
      // 并行获取两个列表
      const [dbFavorites, serviceRecords] = await Promise.all([
        RUBICK_DB.getFavorites(),
        window.services?.readAllRecords().catch(() => []) || [],
      ]);

      this.favoritesRecords = dbFavorites;
      this.serviceRecords = serviceRecords;
    },

    // 保存收藏到 DB
    async saveFavorites() {
      await RUBICK_DB.saveFavorites(this.favoritesRecords);
    },

    // 接收新剪贴板事件
    async addRecord(record: ClipboardRecord) {
      // 1. Service Records 去重并添加到头部
      const existingIdx = this.serviceRecords.findIndex(
        (r) => r.hash === record.hash
      );
      if (existingIdx !== -1) {
        this.serviceRecords.splice(existingIdx, 1);
      }
      this.serviceRecords.unshift(record);

      // 限制大小
      if (this.serviceRecords.length > 2000) {
        this.serviceRecords = this.serviceRecords.slice(0, 2000);
      }
    },

    // 切换收藏状态
    async toggleFavorite(hash: string) {
      const favIndex = this.favoritesRecords.findIndex((r) => r.hash === hash);

      if (favIndex !== -1) {
        // 取消收藏
        this.favoritesRecords.splice(favIndex, 1);
      } else {
        // 添加收藏 (从合并列表中查找完整数据)
        const record = this.records.find((r) => r.hash === hash);
        if (record) {
          this.favoritesRecords.unshift({ ...record, favorite: true });
        }
      }
      await this.saveFavorites();
    },

    // 手动创建并收藏
    async createFavoriteRecord(data: {
      type: "text" | "image" | "files";
      value: any;
    }) {
      try {
        const timestamp = Date.now();
        let value = data.value;
        let hash: string;

        // 特殊处理图片
        if (data.type === "image") {
          value = await saveImageIfNeeded(value);
          hash = `manual_image_${timestamp}`;
        } else {
          const content = JSON.stringify(value);
          hash = `manual_${timestamp}_${content.substring(0, 20)}`;
        }

        const newRecord: ClipboardEntry = {
          type: data.type as any,
          value,
          timestamp,
          hash,
          favorite: true,
        };

        // 1. 添加到收藏
        this.favoritesRecords.unshift(newRecord);
        await this.saveFavorites();

        // 2. 添加到 Service 历史
        const { favorite, ...serviceItem } = newRecord;
        this.serviceRecords.unshift(serviceItem);
      } catch (error) {
        console.error("创建记录失败", error);
        throw error;
      }
    },
  },
});

export default useAppStore;
