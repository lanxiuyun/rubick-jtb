import HomeView from "@/views/homeView.vue";
import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: {
      title: "首页",
      description: "首页",
    },
  },
];
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL), // 使用 hash 模式, 适配 rubick 的 file:// 协议;
  routes,
});

export default router;
