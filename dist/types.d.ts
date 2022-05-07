interface IFunc<T extends any[] = any[], R = any> {
    (...args: T): R;
}
declare type keyRuleFuncName = 'string' | 'regExp' | 'function';
interface IOptions {
    retain?: boolean;
    transValue?: boolean;
    matchFullRules?: boolean;
    relativePath?: boolean;
    priority?: keyRuleFuncName[];
}
declare type TransformFunc = IFunc<[path: (string | number)[], value: any, matchPath: BaseMatchRule[], matchRule: MatchRule], any>;
declare type BaseMatchRule = string | RegExp | TransformFunc;
declare type MatchRule = BaseMatchRule | (BaseMatchRule | BaseMatchRule[])[];
declare type Rules = Map<MatchRule, any>;
export { IFunc, keyRuleFuncName, IOptions, TransformFunc, BaseMatchRule, MatchRule, Rules, };
//# sourceMappingURL=types.d.ts.map