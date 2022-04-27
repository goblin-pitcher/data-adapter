import { BaseMatchRule, IFunc, MatchRule, TransformFunc } from '../types';
interface BaseTree<T> {
    children: T[];
}
interface RuleNode extends BaseTree<RuleNode> {
    parent: RuleNode | null;
    rulePath: BaseMatchRule[];
    rule: MatchRule | null;
}
interface RuleDataNode extends BaseTree<RuleDataNode> {
    parent: RuleDataNode | null;
    children: RuleDataNode[];
    path: (string | number)[];
    value: any;
    rulePath: BaseMatchRule[];
    rule: MatchRule | null;
}
declare const traverseByGrade: <T extends BaseTree<T>>(root: T, visit: IFunc<[T], void>) => void;
declare const pruneTree: <T extends BaseTree<T>>(root: T | null, validateFunc?: IFunc<[T], void>) => T | null;
declare const createRuleTree: (matchRules: MatchRule[]) => RuleNode;
declare const createRuleDataTree: (data: any, ruleTree: RuleNode, testFunc: IFunc<[...args: Parameters<TransformFunc>], boolean>) => RuleDataNode | null;
export { RuleNode, RuleDataNode, traverseByGrade, pruneTree, createRuleTree, createRuleDataTree };
//# sourceMappingURL=data-struct-handler.d.ts.map