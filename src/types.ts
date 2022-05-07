interface IFunc<T extends any[] = any[], R = any> {
  (...args: T): R
}

type keyRuleFuncName = 'string' | 'regExp' | 'function'

interface IOptions {
  retain?: boolean;
  transValue?: boolean;
  matchFullRules?: boolean;
  relativePath?: boolean,
  priority?: keyRuleFuncName[];
}

type TransformFunc = IFunc<[path: (string|number)[], value: any, matchPath: BaseMatchRule[], matchRule: MatchRule], any>;

type BaseMatchRule = string | RegExp | TransformFunc;

type MatchRule = BaseMatchRule | (BaseMatchRule | BaseMatchRule[])[];


type Rules = Map<MatchRule, any>


export {
  IFunc,
  keyRuleFuncName,
  IOptions,
  TransformFunc,
  BaseMatchRule,
  MatchRule,
  Rules,
}