const fs = require("original-fs");
const path = require("path");
const {ipcRenderer} = require("electron");
const rimraf = require('rimraf');

waitTime = e => new window.Promise((t => {
  setTimeout((() => {
    t()
  }), e)
})), ipcInvoke = async (e, t) => {
  try {
    return await ipcRenderer.invoke("clipboard.services", e, t)
  } catch (e) {
    throw new Error(e.message.replace(/^.*?Error:/, "").trim())
  }
}, convertDragFiles = e => {
  const t = path.join(window.rubick.getPath("temp"), "rubick-clipboard");
  fs.existsSync(t) || fs.mkdirSync(t);
  const o = [];
  for (const i of e) if (i) if ("image" !== i.type) if ("files" !== i.type) if ("text" !== i.type) ; else try {
    const e = path.join(t, i.timestamp + ".txt");
    console.log(e)
    fs.existsSync(e) || fs.writeFileSync(e, i.value, "utf-8"), o.push(e)
  } catch {
  } else {
    const e = i.value.filter((e => fs.existsSync(e.path))).map((e => e.path));
    o.push(...e)
  } else try {
    const e = path.join(t, i.timestamp + ".png");
    fs.existsSync(e) || fs.copyFileSync(i.value, e), o.push(e)
  } catch {
  }
  console.log(o)
  return o
};

window.services = {
  readAllRecords: async () => {
    const result = await ipcInvoke("readAllRecords")
    return result;
  },
  clearAllRecords: async () => {
    await ipcInvoke("clearAllRecords")
  },
  removeRecords: async e => {
    await ipcInvoke("removeRecords", e)
  },
  listenAppendRecord: e => {
    ipcRenderer.listenerCount("append") > 0 || ipcRenderer.on("append", ((t, o) => {
      e(o)
    }))
  },
  filesExists: e => e.map((e => fs.existsSync(e))),
  executeCopy: e => {
    const t = new Set(e.map((e => e.type)));
    if (window.rubick.hideMainWindow(), 1 === t.size) {
      if ("text" === e[0].type) return window.rubick.copyText(e.map((e => e.value)).join("\n"));
      if ("files" === e[0].type) {
        const t = [];
        return e.forEach((e => {
          e.value.forEach((e => {
            fs.existsSync(e.path) && t.push(e.path)
          }))
        })), t.length > 0 ? window.rubick.copyFile(t) : void 0
      }
      if ("image" === e[0].type && 1 === e.length) return window.rubick.copyImage(e[0].value)
    }
    const o = convertDragFiles(e);
    0 !== o.length && window.rubick.copyFile(o) && window.rubick.showNotification("合并为「" + o.length + " 个文件」复制")
  },
  dragToFiles: e => {
    const t = convertDragFiles(e);
    0 !== t.length && ipcInvoke("startDrag", t)
  },
};

