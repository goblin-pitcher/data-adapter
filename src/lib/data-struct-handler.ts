import { BaseMatchRule, IFunc, MatchRule, TransformFunc } from '../types'
import { isRefrence } from './utils'

interface BaseTree<T> {
  children: T[]
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
  rule: MatchRule | null,
}

const createDefRuleNode = (): RuleNode => ({
  parent: null,
  children: [],
  rulePath: [],
  rule: null
})

const createDefRuleDataNode = (): RuleDataNode => ({
  parent: null,
  children: [],
  path: [],
  value: null,
  rule: null,
  rulePath: []
})

const traverseByGrade = <T extends BaseTree<T>>(root: T, visit: IFunc<[node: T, root: T], void>) => {
  let checkItems = [root];
  while(checkItems.length) {
    const checkItem = <T>(checkItems.shift())
    visit(checkItem, root);
    if(checkItem.children?.length) {
      checkItems = checkItems.concat(<T[]>checkItem.children)
    }
  }
}

const pruneTree = <T extends BaseTree<T>>(root: T | null, validateFunc: IFunc<[T], void> = () => true) => {
  const checkValidateAndPrune = (node: T | null) => {
    if (!node) return false;
    const children = <T[]>node.children.map(n => {
      if (checkValidateAndPrune(n)) return n;
      return null
    }).filter(Boolean);
    node.children = children;
    return !!node.children.length || validateFunc(node)
  }
  return checkValidateAndPrune(root) ? root : null;
}

const createRuleDescendantNode = (rule: MatchRule): RuleNode => {
  const root = createDefRuleNode()
  const decoRules = <BaseMatchRule[][]>((<MatchRule[]>[]).concat(rule)).map(child => (<MatchRule[]>[]).concat(child));
  let checkGradeNodes = [root]
  decoRules.forEach(ruleArr => {
    const tempChekGradeNodes = <RuleNode[]>[];
    checkGradeNodes.forEach(node => {
      const children = ruleArr.map(ruleItem => {
        const defNode = createDefRuleNode();
        defNode.parent = node;
        defNode.rule = rule;
        defNode.rulePath = defNode.parent.rulePath.concat(ruleItem);
        return defNode;
      })
      node.children = children;
      tempChekGradeNodes.push(...children);
    })
    checkGradeNodes = tempChekGradeNodes;
  })
  return root;
}

const createRuleTree = (matchRules: MatchRule[]): RuleNode => {
  const root = createDefRuleNode();
  const rules = matchRules.reduce((arr, rule) => {
    const ruleRoot = createRuleDescendantNode(rule);
    return arr.concat(ruleRoot.children)
  }, <RuleNode[]>[])
  root.children = rules;
  return root
}

type CreateRuleDataTree = IFunc<[data: any, ruleTree: RuleNode, testFunc: IFunc<[...args: Parameters<TransformFunc>], boolean>], RuleDataNode|null>
const createRuleDataTree: CreateRuleDataTree =(...args) => {
  const createRuleDataTreeBase =  (...args: [...Parameters<CreateRuleDataTree>, ...[parentNode?: RuleDataNode]]) =>{
    let [data, ruleTree, testFunc, parentNode = null] = args;
    const checkItems = ruleTree.children;
    if (!checkItems.length || !isRefrence(data)) return data;
    if (!parentNode) {
      parentNode = createDefRuleDataNode();
      parentNode.value = data;
    }
    const children = <RuleDataNode[]>[];
    Object.keys(data).forEach(key => {
      const path = (<RuleDataNode>parentNode).path.concat(key);
      const value = data[key];
      checkItems.forEach(checkRule => {
        const matchPath = checkRule.rulePath;
        const matchRule = <MatchRule>checkRule.rule;
        const isTreeNode = testFunc(path, value, matchPath, matchRule, data);
        if (!isTreeNode) return;
        const ruleDataNode = createDefRuleDataNode();
        ruleDataNode.parent = parentNode;
        ruleDataNode.path = path;
        ruleDataNode.value = value;
        ruleDataNode.rulePath = matchPath;
        ruleDataNode.rule = matchRule;
        createRuleDataTreeBase(value, checkRule, testFunc, ruleDataNode);
        children.push(ruleDataNode);
      })
    })
    parentNode.children = children;
    return parentNode;
  }
  return createRuleDataTreeBase(...args);
}

export {
  RuleNode,
  RuleDataNode,
  traverseByGrade,
  pruneTree,
  createRuleTree,
  createRuleDataTree
}