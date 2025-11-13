import type { ClipboardRecord } from "@/types/services";

const records: ClipboardRecord[] = [
  // 【图片类型】
  { type: "image", size: 130771, timestamp: 1762936289285, hash: "cc7682a59441991976227413e2cc1113", value: "C:\\Users\\cyf\\AppData\\Roaming\\rubick\\clipboard-data\\1762935915639\\cc7682a59441991976227413e2cc1113" },
  { type: "image", size: 10296, timestamp: 1762935421370, hash: "aab398c1064500f1fdbb00bfc2f0670d", value: "C:\\Users\\cyf\\AppData\\Roaming\\rubick\\clipboard-data\\1762934802151\\aab398c1064500f1fdbb00bfc2f0670d" },

  // 【文件类型 - 混合文件和文件夹】
  { type: "files", value: [{ isFile: true, isDirectory: false, name: ".gitignore", path: "C:\\Users\\cyf\\Pictures\\.gitignore" }, { isFile: false, isDirectory: true, name: "Screenshots", path: "C:\\Users\\cyf\\Pictures\\Screenshots" }], timestamp: 1763011472062, hash: "cc0717c20de72119f3c6a2e35e400b47" },

  // 【文件类型 - 多个图片文件】
  { type: "files", value: [{ isFile: true, isDirectory: false, name: "lazyeat.png", path: "C:\\Users\\cyf\\Pictures\\lazyeat.png" }, { isFile: true, isDirectory: false, name: "images.jpg", path: "C:\\Users\\cyf\\Pictures\\images.jpg" }], timestamp: 1763011455970, hash: "c5ea0a41e4b25bbad7e13b63beaef6ef" },

  // 【文件类型 - 单个图片文件】
  { type: "files", value: [{ isFile: true, isDirectory: false, name: "images.jpg", path: "C:\\Users\\cyf\\Pictures\\images.jpg" }], timestamp: 1763011433834, hash: "9390e121af9127ba1ae5aceb63a3cf68" },

  // 【文件类型 - 多个普通文件】
  { type: "files", value: [{ isFile: true, isDirectory: false, name: "package.json", path: "C:\\work_sapce\\rubick-jtb\\package.json" }, { isFile: true, isDirectory: false, name: "index.html", path: "C:\\work_sapce\\rubick-jtb\\index.html" }, { isFile: true, isDirectory: false, name: "LICENSE", path: "C:\\work_sapce\\rubick-jtb\\LICENSE" }], timestamp: 1763011405664, hash: "6a74bb1ed217aa08ceee847f8b436cad" },

  // 【文件类型 - 单个普通文件】
  { type: "files", value: [{ isFile: true, isDirectory: false, name: "index.html", path: "C:\\work_sapce\\rubick-jtb\\index.html" }], timestamp: 1763011397602, hash: "3a64d00c7a34268a56e1145523d655c0" },

  // 【文本类型 - 多行文本】
  { type: "text", value: "这是多行文本\r\n这是多行文本\r\n这是多行文本", timestamp: 1763011326163, hash: "67103e6d8bd77f2f764015d1a923c51b" },

  // 【文本类型 - 单行文本】
  { type: "text", value: "关于mask输出功能，免费接口暂不提供，而我们的DLL版本则包含此特性。或许您可以考虑使用DLL版本来满足这一需求。", timestamp: 1763011323158, hash: "9af8eff2903b4d787499d4f361462058" },
];

export const TEST_DATA = {
  records,
};
