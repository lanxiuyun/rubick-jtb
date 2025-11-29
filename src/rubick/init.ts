import type { App } from "vue";

export function onPluginReady(app: App) {
  window.rubick.onPluginReady(
    async ({
      code,
      type,
      payload,
    }: {
      code: string;
      type: string;
      payload: any;
    }) => {
      window.rubick.showNotification("Hello, Rubick!");
    }
  );
}
