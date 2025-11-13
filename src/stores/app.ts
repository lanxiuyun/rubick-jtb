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
      const records = await window.services.readAllRecords();
      this.records = records;
    },
    setActiveTab(tab: TabKey) {
      this.activeTab = tab;
    },
    addRecord(record: ClipboardRecord) {
      this.records = [record, ...this.records];
    },
  },
});