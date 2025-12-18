const clipboardWatcher = require('./clipborad-watcher');
const fs = require("original-fs");
const path = require("path");
const rimraf = require("rimraf");
const crypto = require("crypto");
const we = require("./png2ico");

// https://gitee.com/rubick-center/rubick-qjb/commit/b9ba41eacef401e92c5177100fc82c83c762e237
const key = crypto
  .createHash('sha512')
  .update('rubick')
  .digest('hex')
  .substring(0, 32)

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
        maxGroupRecordNum = 500; // 每个文件夹最多保存500条记录
    
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
            .slice(0, 4);
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
          const folderNames = this.getRecordFolderNames();
          if (!folderNames || folderNames.length === 0) return [];

          const recordsMap = {};
          let recordCount = 0;
          const MAX_RECORDS = 50000; // 最多读取50000条记录

          for (const folderName of folderNames) {
            const folderPath = path.join(this.clipboardData, folderName);
            const dataPath = path.join(folderPath, "data");

            // 如果数据文件不存在，清理文件夹并跳过
            if (!fs.existsSync(dataPath)) {
              rimraf(folderPath, () => {});
              continue;
            }

            let fileContent;
            try {
              fileContent = fs.readFileSync(dataPath, "utf-8");
            } catch (error) {
              continue;
            }

            // 倒序读取，最新的在后面
            const lines = fileContent.split("\n").reverse();

            for (const line of lines) {
              if (!line) continue;

              const decryptedContent = L(line);
              // 简单校验解密内容是否为 JSON 对象
              if (!decryptedContent || !decryptedContent.startsWith("{")) continue;

              try {
                const record = JSON.parse(decryptedContent);

                // 如果记录已存在，跳过（去重）
                if (record.hash in recordsMap) continue;

                // 如果是图片，构造完整的图片路径
                if (record.type === "image") {
                  record.value = path.join(folderPath, record.hash);
                }

                recordsMap[record.hash] = record;
                recordCount++;

                // 达到最大记录数，提前返回
                if (recordCount >= MAX_RECORDS) {
                  return Object.values(recordsMap);
                }
              } catch (e) {
                // 解析失败忽略
                continue;
              }
            }
          }

          return Object.values(recordsMap);
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
        
        // 保存用户手动添加的图片
        saveClipboardImage(event, imageDataUrl) {
          try {
            // 去掉 data:image/png;base64, 前缀
            const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            
            // 创建 hash
            const hash = crypto.createHash("md5").update(buffer).digest("hex");
            
            // 初始化当前记录文件状态
            !this.currentRecordFileStat && this.initCurrentRecordFileStat();
            
            // 创建记录对象
            const target = {
              type: "image",
              size: buffer.length,
              timestamp: Date.now(),
              buffer: buffer,
              hash: hash,
            };
            
            // 添加记录
            this.appendRecordItem(target);
            
            // 返回路径
            return path.join(this.currentRecordFileStat.folder, hash);
          } catch (error) {
            console.error('保存图片失败:', error);
            throw error;
          }
        }
      }
  
      const clipboardWatch = new ClipboardWatcher();
  
      ipcMain.handle("clipboard.services", (async (t, n, ...o) => {
        const r = clipboardWatch[n];
        if ("function" != typeof r) throw new Error("未知接口");
        return r.call(clipboardWatch, t, ...o);
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
