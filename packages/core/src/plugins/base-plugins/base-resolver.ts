import { path, isModuleExternal } from "packager-shared";

import { PackagerContext, File, Resolver, ResolveResult } from "packager/types";

const { resolve, dirname } = path;
export const resolveRelative = (
    childPath: string,
    parentPath: string,
    context: PackagerContext,
    pathOnly: boolean = true
): File | string | null => {
    const retryFileFind = (path: string): File | null =>
        context.files.find(
            f =>
                f.path === `${path}/index.js` ||
                f.path === `${path}/index.ts` ||
                f.path === `${path}/index.jsx` ||
                f.path === `${path}/index.tsx` ||
                f.path === `${path}.js` ||
                f.path === `${path}.ts` ||
                f.path === `${path}.jsx` ||
                f.path === `${path}.tsx`
        ) || null;

    const resolved = resolve(dirname(parentPath), childPath).replace(
        /^\.\//,
        ""
    );

    const foundFile = context.files.find(f => f.path === resolved);

    if (foundFile) return pathOnly ? foundFile.path : foundFile;

    const absolute = resolve(dirname(parentPath), childPath);
    const retriedFile = retryFileFind(absolute);

    if (!retriedFile) return null;

    return pathOnly ? retriedFile.path || null : retriedFile || null;
};

const resolveRelativeExternal = (
    childPath: string,
    parentPath: string,
    context: PackagerContext
) => {
    if (!parentPath.startsWith("@")) {
        if (!!~parentPath.indexOf("/")) {
            const cachedParent = context.cache.dependencies.get(parentPath);
            if (cachedParent) {
                const relativeExternalUrl = new URL(cachedParent.meta.url)
                    .pathname;

                return resolve(dirname(relativeExternalUrl), childPath);
            }

            return resolve(dirname(`/${parentPath}`), childPath).replace(
                /^\.\//,
                ""
            );
        }

        return resolve(`/${parentPath}`, childPath);
    }

    throw new Error(`Module ${childPath} has a parent ${parentPath} with @.`);
};

export default function baseResolver(context: PackagerContext): Resolver {
    return {
        name: "packager::resolver::base-resolver",
        resolveId(moduleId: string, parentId?: string): ResolveResult {
            if (!parentId) return moduleId;

            if (isModuleExternal(moduleId)) return moduleId;

            const relativePath = <string | null>(
                resolveRelative(moduleId, parentId, context)
            );

            if (relativePath) return relativePath;

            if (
                !parentId.startsWith(".") ||
                !parentId.startsWith("/") ||
                isModuleExternal(parentId)
            ) {
                const pkgPath = resolveRelativeExternal(
                    moduleId,
                    parentId,
                    context
                );

                return {
                    id: pkgPath.substr(1)
                };
            }

            throw new Error(
                `Could not resolve '${moduleId}' from '${parentId}'`
            );
        }
    };
}
