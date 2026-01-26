import useAppStore from "@/stores/app";

// function onPluginReady() {
//   window.rubick.onPluginReady(
//     async ({
//       code,
//       type,
//       payload,
//     }: {
//       code: string;
//       type: string;
//       payload: any;
//     }) => {
//       window.rubick.showNotification("Hello, Rubick!");
//     }
//   );
// }

function onShow() {
  window.rubick.hooks.onShow = () => {
    const appStore = useAppStore();
    window.rubick.setSubInputValue(appStore.textSearch);
  };
}

const onSearchTextChange = () => {
  window.rubick.setSubInput(({ text }: { text: string }) => {
    const appStore = useAppStore();
    appStore.textSearch = text;
  }, "搜索~ 支持拼音/首字母");
};

const RUBICK_INIT = {
  // onPluginReady: onPluginReady,
  onSearchTextChange: onSearchTextChange,
  onShow: onShow,
};

export default RUBICK_INIT;
