import type { ClipboardRecord } from "@/types/services";
import { defineStore } from "pinia";

export const useAppStore = defineStore("app-store", {
  state: () => ({
    records: [] as ClipboardRecord[],
  }),
  actions: {
    async fetchRecords() {
      const records = await window.services.readAllRecords();
      this.records = records;
    },
  },
});
  