const clipboardWatcher = require('./clipborad-watcher');
const fs = require("original-fs");
const path = require("path");
const rimraf = require("rimraf");
const crypto = require("crypto");
const we = require("./png2ico");

const key = crypto.randomBytes(32);

const commonConst = {
  linux() {
    return process.platform === "linux";
  },
  macOS() {
    return process.platform === "darwin";
  },
  windows() {
    return process.platform === "win32";
  },
}


function O(e) {
  const t = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), "rubick0123456789");
  return t.update(e, "utf8", "hex") + t.final("hex")
}

function L(e) {
  if (!e) return "";
  try {
    const t = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), "rubick0123456789");
    return t.update(e, "hex", "utf8") + t.final("utf8")
  } catch (e) {
    return ""
  }
}

module.exports = () => {
  return {
    async onReady(ctx) {
      const {clipboard, mainWindow, ipcMain, app, API, nativeImage } = ctx;
  
      class ClipboardWatcher {
        currentRecordFileStat = null;
        clipboardData = path.join(app.getPath('userData'), 'clipboard-data');
        maxGroupRecordNum = 6;
    
        constructor() {
      
        }
        emitChange(target) {
          !this.currentRecordFileStat && this.initCurrentRecordFileStat();
          this.appendRecordItem(target);
        }
        
        appendRecordItem(e) {
          if (!e || !this.currentRecordFileStat) return;
          if (this._prevRecordItemHash && this._prevRecordItemHash === e.hash) return;
          if (this._prevRecordItemHash = e.hash, this.currentRecordFileStat.number % this.maxGroupRecordNum == 0) {
            this.currentRecordFileStat.number === this.maxGroupRecordNum && this.getRecordFolderNames(), this.currentRecordFileStat.folder = path.join(this.clipboardData, Date.now().toString());
            try {
              fs.mkdirSync(this.currentRecordFileStat.folder, {recursive: true})
            } catch (e) {
              return
            }
            this.currentRecordFileStat.number = 0
          }
          if ("image" === e.type) {
            const t = path.join(this.currentRecordFileStat.folder, e.hash);
            try {
              fs.existsSync(t) || fs.writeFileSync(t, e.buffer)
            } catch (e) {
            }
            delete e.buffer
          }
          try {
            const t = O(JSON.stringify(e));
            fs.appendFileSync(path.join(this.currentRecordFileStat.folder, "data"), t + "\n", "utf-8")
          } catch(e) {
            console.log(e);
            return
          }
          this.currentRecordFileStat.number++;
          
          let i = mainWindow.getBrowserView();
          i && ("image" === e.type && (e.value = path.join(this.currentRecordFileStat.folder, e.hash)), i.webContents.send("append", e))
        }
    
        getRecordFolderNames() {
          if (!fs.existsSync(this.clipboardData)) return [];
          let clipboardDirs;
          try {
            clipboardDirs = fs.readdirSync(this.clipboardData);
          } catch (e) {
            return null;
          }
          if (0 === clipboardDirs.length) return [];
          const target = clipboardDirs
            .filter((e) => /^\d{13}$/.test(e))
            .sort()
            .reverse()
            .slice(0, 6);
          if (clipboardDirs.length > target.length) {
            clipboardDirs
              .filter((e) => !target.includes(e))
              .forEach((e) => {
                rimraf(path.join(this.clipboardData, e), () => {});
              });
          }
          return target;
        }
    
        initCurrentRecordFileStat() {
          do {
            try {
              const e = this.getRecordFolderNames();
              if (!e || 0 === e.length) break;
              const t = path.join(this.clipboardData, e[0]);
              const i = path.join(t, "data");
              if (!fs.existsSync(i)) break;
              let n = fs.readFileSync(i, "utf-8").split("\n").length;
              (0 === n || n > this.maxGroupRecordNum + 1) && (n = this.maxGroupRecordNum + 1);
              this.currentRecordFileStat = {
                folder: t,
                number: n - 1
              }
            } catch (e) {
            }
          } while (0);
          this.currentRecordFileStat || (this.currentRecordFileStat = {number: 0})
        }
        
        readAllRecords() {
          const i = clipboardWatch.getRecordFolderNames();
          if (!i) return;
          if (0 === i.length) return [];
          const n = {};
          let o = 0;
          for (const t of i) {
            const i = path.join(clipboardWatch.clipboardData, t, "data");
            if (!fs.existsSync(i)) {
              rimraf(path.join(clipboardWatch.clipboardData, t), (() => {
              }));
              continue
            }
            let s;
            try {
              s = fs.readFileSync(i, "utf-8")
            } catch (e) {
              continue
            }
            const r = s.split("\n").reverse();
            for (const i of r) {
              if (!i) continue;
              const s = L(i);
              if (!s || !s.startsWith("{")) continue;
              const r = JSON.parse(s);
              if (!(r.hash in n) && ("image" === r.type && (r.value = path.join(clipboardWatch.clipboardData, t, r.hash)), n[r.hash] = r, ++o >= 500)) return e(Object.values(n))
            }
          }
          return Object.values(n)
        }
        
        startDrag (e, i) {
          if (!i) return;
          const n = {};
          if ("string" == typeof i) {
            if (!fs.existsSync(i)) return;
            n.file = i
          } else {
            if (!(Array.isArray(i) && i.length > 0)) return;
            {
              const e = i.filter((e => fs.existsSync(e)));
              if (0 === e.length) return;
              n.files = e
            }
          }
          const o = n.file ? 1 : n.files.length, s = path.join(__dirname, "dragfile.png");
          (0, we.png2DragIcon)(s, o).then((i => {
            n.icon = nativeImage.createFromBuffer(i), e.sender.startDrag(n)
          }))
        }
      }
  
      const clipboardWatch = new ClipboardWatcher();
  
      ipcMain.handle("clipboard.services", (async (t, n, ...o) => {
        const r = clipboardWatch[n];
        if ("function" != typeof r) throw new Error("未知接口");
        return r(t, ...o);
      }))
      const watcher = clipboardWatcher(clipboard, {
        // (optional) delay in ms between polls
        watchDelay: 1000,
        getCopyFiles: API.getCopyFiles,
        // handler for when image data is copied into the clipboard
        onImageChange: function (nativeImage) {
          const imgBuffer = nativeImage.toPNG();
          const target = {
            type: "image",
            size: imgBuffer.length,
            timestamp: new Date().getTime(),
            buffer: imgBuffer,
            hash: crypto.createHash("md5").update(imgBuffer).digest("hex"),
          }
          clipboardWatch.emitChange(target);
        },
        // handler for when text data is copied into the clipboard
        onTextChange: function (text) {
          const target = {
            type: "text",
            value: text,
            timestamp: new Date().getTime(),
            hash: crypto.createHash("md5").update(text).digest("hex"),
          }
          clipboardWatch.emitChange(target);
        },
  
        onFileChange: function (files) {
          const t = crypto.createHash("md5").update(JSON.stringify(files)).digest("hex");
          clipboardWatch.emitChange({type: "files", value: files, timestamp: new Date().getTime(), hash: t});
        }
      });
      watcher.start();
    }
  }
}
