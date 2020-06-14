import { WebWorkerEvent } from "packager";
import { TRANSPILE_STATUS } from "packager-pluginutils";
import transpileFile from "./utils/transpile-css-file";
import { Postcss } from "./types";

interface WebWorker extends Worker {
  postcss: Postcss;
  importScripts: (...urls: Array<string>) => void;
}
declare const self: WebWorker;

const loadPostcss = () => {
  if (!self.postcss) {
    self.importScripts(
      "https://cdn.jsdelivr.net/npm/@bloxy/iife-libs@latest/libs/postcss.js"
    );
  }
};

loadPostcss();

self.addEventListener("message", async ({ data }: WebWorkerEvent) => {
  const { type, context } = data;

  if (type === TRANSPILE_STATUS.START) {
    try {
      const transpiledFile = await transpileFile(context, self.postcss);

      self.postMessage({
        type: TRANSPILE_STATUS.END,
        context: transpiledFile,
      });
    } catch (error) {
      self.postMessage({
        type: TRANSPILE_STATUS.ERROR,
        error,
      });
    }
  }
});
