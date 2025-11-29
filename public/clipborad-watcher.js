module.exports = function (clipboard, opts) {
  opts = opts || {}
  const watchDelay = opts.watchDelay || 1000

  let lastText = clipboard.readText()
  let lastImage = clipboard.readImage()
  let lastFilePath = opts.getCopyFiles() && JSON.stringify(opts.getCopyFiles());

  let intervalId = null;

  const start = () => {
    if (intervalId) return;
    intervalId = setInterval(() => {
      const text = clipboard.readText()
      const image = clipboard.readImage()
      const filePath = opts.getCopyFiles() && JSON.stringify(opts.getCopyFiles());
      
      if (opts.onImageChange && imageHasDiff(image, lastImage)) {
        lastImage = image
        return opts.onImageChange(image)
      }

      if (opts.onTextChange && textHasDiff(text, lastText) && !filePath) {
        lastText = text
        return opts.onTextChange(text)
      }
      
      if (opts.onFileChange && textHasDiff(filePath, lastFilePath) && !image.toPNG().length) {
        lastFilePath = filePath
        return opts.onFileChange(JSON.parse(filePath));
      }
    }, watchDelay)
  }

  const stop = () => {
    clearInterval(intervalId);
    intervalId = null;
  }

  return {
    start,
    stop,
  }
}

/*
Tell if there is any difference between 2 images
*/
function imageHasDiff (a, b) {
  return !a.isEmpty() && b.toDataURL() !== a.toDataURL()
}

/*
Tell if there is any difference between 2 strings
*/
function textHasDiff (a, b) {
  return a && b !== a
}
