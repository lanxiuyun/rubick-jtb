import type { Pinia } from "pinia";
import { defineStore } from "pinia";

export type DebugLogLevel = "debug" | "info" | "warn" | "error";

export interface DebugLogItem {
  id: string;
  level: DebugLogLevel;
  time: number;
  text: string;
  args: unknown[];
}

let idSeq = 0;

function safeStringify(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (value instanceof Error) return value.stack || value.message;
  try {
    return JSON.stringify(value);
  } catch {
    return Object.prototype.toString.call(value);
  }
}

function formatArgs(args: unknown[]): string {
  return args.map((a) => safeStringify(a)).join(" ");
}

export const useDebugStore = defineStore("debug-store", {
  state: () => ({
    enabled: true,
    visible: false,
    maxItems: 500 as number,
    items: [] as DebugLogItem[],
  }),

  getters: {
    size(state) {
      return state.items.length;
    },
  },

  actions: {
    push(level: DebugLogLevel, args: unknown[]) {
      const item: DebugLogItem = {
        id: `${Date.now()}_${idSeq++}`,
        level,
        time: Date.now(),
        text: formatArgs(args),
        args,
      };
      this.items.push(item);
      if (this.items.length > this.maxItems) {
        this.items.splice(0, this.items.length - this.maxItems);
      }
    },

    clear() {
      this.items = [];
    },

    setEnabled(enabled: boolean) {
      this.enabled = enabled;
      if (!enabled) this.visible = false;
    },

    setVisible(visible: boolean) {
      this.visible = visible;
    },
  },
});

const CONSOLE_PATCH_KEY = "__rubick_debug_console_patched__";

export function installConsoleCapture(pinia?: Pinia) {
  const w = window as unknown as Record<string, unknown>;
  if (w[CONSOLE_PATCH_KEY]) return;
  w[CONSOLE_PATCH_KEY] = true;

  const getStore = () => useDebugStore(pinia);

  const patchMethod = (
    method: keyof Console,
    level: DebugLogLevel,
    origin: (...args: unknown[]) => void
  ) => {
    // eslint-disable-next-line no-console
    console[method] = ((...args: unknown[]) => {
      try {
        const store = getStore();
        if (store.enabled) store.push(level, args);
      } catch {
        // ignore
      }
      origin(...args);
    }) as any;
  };

  // eslint-disable-next-line no-console
  patchMethod("debug", "debug", console.debug.bind(console));
  // eslint-disable-next-line no-console
  // 将 console.log 归为 info 级别
  patchMethod("log", "info", console.log.bind(console));
  // eslint-disable-next-line no-console
  patchMethod("info", "info", console.info.bind(console));
  // eslint-disable-next-line no-console
  patchMethod("warn", "warn", console.warn.bind(console));
  // eslint-disable-next-line no-console
  patchMethod("error", "error", console.error.bind(console));

  window.addEventListener(
    "error",
    (event) => {
      try {
        const store = getStore();
        if (!store.enabled) return;
        store.push("error", [
          "window.error",
          event.message,
          event.filename,
          `:${event.lineno}:${event.colno}`,
          event.error,
        ]);
      } catch {
        // ignore
      }
    },
    { capture: true }
  );

  window.addEventListener("unhandledrejection", (event) => {
    try {
      const store = getStore();
      if (!store.enabled) return;
      store.push("error", ["unhandledrejection", event.reason]);
    } catch {
      // ignore
    }
  });
}

export default useDebugStore;
