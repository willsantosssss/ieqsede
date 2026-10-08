const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const fs = require("node:fs");
const path = require("node:path");

// NativeWind creates native placeholders before Metro crawls the tree, but
// omits web.css. A clean, non-watching export cannot hash that late-created file.
const cssCache = path.join(path.dirname(require.resolve("react-native-css-interop/package.json")), ".cache");
fs.mkdirSync(cssCache, { recursive: true });
fs.closeSync(fs.openSync(path.join(cssCache, "web.css"), "a"));

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules
  // This fixes iOS styling issues in development mode
  forceWriteFileSystem: true,
});
