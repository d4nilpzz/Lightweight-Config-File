export type LCFValue = string | number | boolean | Array<any> | Record<string, any> | null;
export interface LCFParseOptions {
    trim?: boolean;
}
export declare class LCFConfigInstance {
    private data;
    private hidden;
    constructor(data: Record<string, any>, hidden: Set<string>);
    get(pathStr: string, defaultValue?: any): LCFValue;
    toObject(): Record<string, any>;
    getHiddenKeys(): string[];
}
export declare function parseLCF(content: string, opts?: LCFParseOptions): {
    data: Record<string, any>;
    hidden: Set<string>;
};
export declare function LCFConfig(fileOrContent: string, opts?: LCFParseOptions): LCFConfigInstance;
export default LCFConfig;
