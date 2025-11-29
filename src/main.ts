import { createPinia } from "pinia";
import { createApp } from "vue";
import naive from "naive-ui";

import App from "@/App.vue";
import router from "@/router";
// import { onPluginReady } from "@/rubick/init";

import "@/assets/main.css";

const app = createApp(App);

// 添加 if 可以兼容浏览器环境
// 如果当前环境是 Rubick，则初始化 Rubick 相关功能
if (window?.rubick) {
  // onPluginReady(app);
}

app.use(createPinia());
app.use(router);
app.use(naive);
app.mount("#app");
