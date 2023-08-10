import { IFunc } from '../types';
declare const isDef: (val: any) => boolean;
declare const isRefrence: (checkItem: unknown) => unknown;
declare const splitEnd: <T = any>(path: T[]) => [T[], T];
declare const setProps: (obj: Record<string, unknown>, path: (string | number)[], value: unknown, safely?: boolean) => boolean;
declare const cloneType: (val: any) => any;
declare const join: (strArr: (string | number)[]) => string, split: (str: string) => string[];
declare const syncBailHandler: <T extends any[], R>(funcs: IFunc<T, R>[], bailFunc?: IFunc<[R], boolean>) => (...args: T) => any[];
export { isDef, isRefrence, setProps, cloneType, join, split, splitEnd, syncBailHandler, };
//# sourceMappingURL=utils.d.ts.map