import naive from "naive-ui";
import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "@/App.vue";
import router from "@/router";
import RUBICK_INIT from "@/rubick/init";
import { installConsoleCapture } from "@/stores/debug";

import "@/assets/main.css";

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

// 添加 if 可以兼容浏览器环境
// 如果当前环境是 Rubick，则初始化 Rubick 相关功能
if (window?.rubick) {
  RUBICK_INIT.onShow();
  RUBICK_INIT.onSearchTextChange();
}

// 在 Rubick 或本地开发环境捕获 console.* 日志到前端面板
if (window?.rubick || import.meta.env.DEV) {
  installConsoleCapture(pinia);
}
app.use(router);
app.use(naive);
app.mount("#app");
