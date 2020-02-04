import Transpiler from "../transpiler";
// @ts-ignore
import VueWorker from "web-worker:./vue-worker.ts";
import { PackagerContext } from "../../plugins";
import SassTranspiler from "../sass";
import StylusTranspiler from "../stylus";

export default class VueTranspiler extends Transpiler {
    public additionalTranspilers = {
        sass: SassTranspiler,
        scss: SassTranspiler,
        styl: StylusTranspiler
    };

    constructor(context: PackagerContext) {
        super("vue-transpiler", new VueWorker(), context);
    }

    transpile(file: any) {
        return this.doTranspile(file);
    }
}
