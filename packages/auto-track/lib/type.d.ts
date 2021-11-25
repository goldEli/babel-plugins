import { NodePath } from "@babel/traverse";
declare type BabelTransformationFile = {
    opts: {
        filename: string;
        babelrc: boolean;
        configFile: boolean;
        passPerPreset: boolean;
        envName: string;
        cwd: string;
        root: string;
        plugins: unknown[];
        presets: unknown[];
        parserOpts: object;
        generatorOpts: object;
    };
    declarations: {};
    path: NodePath | null;
    ast: {};
    scope: unknown;
    metadata: {};
    code: string;
    inputMap: object | null;
};
export declare type Opts = {
    removePrefix?: boolean | string | RegExp;
    filebase?: boolean;
    includeExportName?: boolean | "all";
    extractComments?: boolean;
    useKey?: boolean;
    moduleSourceName?: string;
    separator?: string;
    relativeTo?: string;
};
export declare type TState = {
    file: BabelTransformationFile;
    opts: Opts;
    filename: string;
    trackerImportId?: string;
    trackerAST?: any;
};
export {};
