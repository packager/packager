import {
  createPlugin,
  styleHelpers,
  verifyExtensions,
} from "packager-pluginutils";
// @ts-ignore
import Worker from "web-worker:./worker";
import transpileCssFile from "./utils/transpile-css-file";

const isValid = verifyExtensions([".css"]);

const cssPlugin = createPlugin({
  name: "css",
  transpiler: {
    gateway(moduleId: string) {
      return isValid(moduleId);
    },
    worker: Worker,
    beforeBundle(moduleId: string, code: string) {
      return styleHelpers.generateExport({ path: moduleId, code });
    },
  },
});

export { transpileCssFile };

export default cssPlugin;
