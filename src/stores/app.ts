import RUBICK_DB from "@/rubick/db";
import type { ClipboardEntry, ClipboardRecord } from "@/types/services";
import { filterRecords, saveImageIfNeeded } from "@/utils/clipboard";
import { defineStore } from "pinia";

export type TabKey = "all" | "text" | "files" | "image" | "favorite";

const MAX_SERVICE_RECORDS = 55000;

export const useAppStore = defineStore("app-store", {
  state: () => ({
    serviceRecords: [] as ClipboardEntry[], // 历史记录 (Service) + 过期收藏（用于 UI 展示）
    favoritesRecords: [] as ClipboardEntry[], // 收藏记录 (DB)
    activeTab: "all" as TabKey,
    textSearch: "" as string,
  }),

  getters: {
    // UI 使用的最终列表 (带筛选)
    filteredRecords(): ClipboardEntry[] {
      return filterRecords(this.serviceRecords, this.activeTab, this.textSearch);
    },
  },

  actions: {
    async fetchRecords() {
      // 并行获取两个列表
      const [dbFavorites, serviceRecords] = await Promise.all([
        RUBICK_DB.getFavorites(),
        window.services?.readAllRecords().catch(() => []) || [],
      ]);

      // 1) 收藏列表
      this.favoritesRecords = dbFavorites;
      const favoriteSet = new Set<string>(dbFavorites.map((r) => r.hash));

      // 2) Service 列表：保证倒序
      serviceRecords.sort((a, b) => b.timestamp - a.timestamp);
      const serviceList = serviceRecords as ClipboardEntry[];
      const serviceHashSet = new Set<string>();
      for (const r of serviceList) {
        r.favorite = favoriteSet.has(r.hash);
        serviceHashSet.add(r.hash);
      }

      // 3) 追加“过期收藏”（不在 serviceRecords 中）
      const expiredFavorites: ClipboardEntry[] = []; 
      for (const fav of dbFavorites) {
        if (!serviceHashSet.has(fav.hash)) {
          fav.favorite = true;
          expiredFavorites.push(fav);
        }
      }

      // 4) 限制大小：优先保留过期收藏，其余从 service 头部截断
      const keepServiceCount = Math.max(
        0,
        MAX_SERVICE_RECORDS - expiredFavorites.length
      );
      this.serviceRecords = serviceList
        .slice(0, keepServiceCount)
        .concat(expiredFavorites);
    },

    // 保存收藏到 DB
    async saveFavorites() {
      await RUBICK_DB.saveFavorites(this.favoritesRecords);
    },

    // 接收新剪贴板事件
    async addRecord(record: ClipboardRecord) {
      // 1) 转成 UI 用的 Entry（补齐 favorite）
      const entry = record as ClipboardEntry;
      entry.favorite = this.favoritesRecords.some((r) => r.hash === record.hash);

      // 2) 去重并添加到头部
      const existingIdx = this.serviceRecords.findIndex(
        (r) => r.hash === entry.hash
      );
      if (existingIdx !== -1) {
        this.serviceRecords.splice(existingIdx, 1);
      }
      this.serviceRecords.unshift(entry);

      // 限制大小
      if (this.serviceRecords.length > MAX_SERVICE_RECORDS) {
        // 用 splice 原地截断，避免 slice 分配新数组
        this.serviceRecords.splice(MAX_SERVICE_RECORDS);
      }
    },

    // 切换收藏状态
    async toggleFavorite(hash: string) {
      const favIndex = this.favoritesRecords.findIndex((r) => r.hash === hash);

      if (favIndex !== -1) {
        // 取消收藏
        this.favoritesRecords.splice(favIndex, 1);
        const inList = this.serviceRecords.find((r) => r.hash === hash);
        if (inList) inList.favorite = false;
      } else {
        // 添加收藏（从当前列表中查找完整数据）
        const record = this.serviceRecords.find((r) => r.hash === hash);
        if (record) {
          this.favoritesRecords.unshift({ ...record, favorite: true });
          record.favorite = true;
        } else {
          // 如果列表里没有（极少见），也允许仅存 hash（但 UI 无法展示内容）
          // 这里保持兼容：不做任何处理
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

        // 2. 添加到 Service 历史（UI 列表）
        this.serviceRecords.unshift(newRecord);
        if (this.serviceRecords.length > MAX_SERVICE_RECORDS) {
          this.serviceRecords.splice(MAX_SERVICE_RECORDS);
        }
      } catch (error) {
        console.error("创建记录失败", error);
        throw error;
      }
    },
  },
});

export default useAppStore;
