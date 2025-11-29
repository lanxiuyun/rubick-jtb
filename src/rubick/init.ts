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

const onSearchTextChange = () => {
  window.rubick.setSubInput(({ text }: { text: string }) => {
    const appStore = useAppStore();
    appStore.textSearch = text;
  });
};

const RUBICK_INIT = {
  // onPluginReady: onPluginReady,
  onSearchTextChange: onSearchTextChange,
};

export default RUBICK_INIT;
