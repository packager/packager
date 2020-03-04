import { PluginAPI, PackagerContext } from "../../../types";

export default (plugin: PluginAPI, context: PackagerContext) => {
    const checkIfFileIsAlreadyTranspiled = (path: string) =>
        context.workerQueue.complete.find(f => f.path === path);

    const beforeBundleFunction = async (code: string, moduleId: string) => {
        const file = checkIfFileIsAlreadyTranspiled(moduleId);

        if (file) {
            return {
                code: file.code,
                map: file.map || { mappings: "" },
                moduleId
            };
        }

        return { code, map: { mappings: "" }, moduleId };
    };

    return new Proxy(beforeBundleFunction, {
        async apply(target, thisArg, argumentsList) {
            context = { ...context, acornParser: thisArg.parse };
            const handledTransformFunction = await Reflect.apply(
                target,
                context,
                argumentsList
            );

            if (!handledTransformFunction) {
                return Promise.resolve();
            }

            const { code, map, moduleId } = handledTransformFunction;

            return {
                code:
                    (await plugin.beforeBundle!.bind(context)(
                        code,
                        moduleId
                    )) || code,
                map
            };
        }
    });
};
