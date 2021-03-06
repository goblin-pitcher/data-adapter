// import { merge } from 'lodash';
import defOptions from './options';
import { IFunc, BaseMatchRule, IOptions, MatchRule, Rules, TransformFunc } from './types';
import { join, splitEnd, isDef, setProps } from './lib/utils'
import { traverseByGrade, createRuleTree, createRuleDataTree, RuleNode, RuleDataNode, pruneTree } from './lib/data-struct-handler'

type RequireOptions = Required<IOptions>
const createOptions = (options: boolean | IOptions): RequireOptions => {
  const newOpts: IOptions = typeof options === 'boolean' ? { retain: options } : options
  return <RequireOptions>{ ...defOptions, ...newOpts }
}

const getRuleType = (rule: BaseMatchRule) => {
  const ruleType = typeof rule;
  if (ruleType === 'string') return 'string';
  if (ruleType === 'function') return 'function';
  return 'regExp';
}

const createTestFunc = (): IFunc<[...args: Parameters<TransformFunc>], boolean> => {
  const banList = new Set();
  return (path, value, matchPath, matchRule) => {
    const testKey = join(path);
    let rst = false;

    if (banList.has(testKey)) return rst;
    const testRule = <BaseMatchRule>matchPath[matchPath.length - 1];
    const key = path[path.length - 1]
    const ruleType = getRuleType(testRule);
    if (ruleType === 'string') {
      rst = key === testRule
    } else if (ruleType === 'regExp') {
        rst = (<RegExp>testRule).test(`${key}`);
    } else {
      rst = (<TransformFunc>testRule)(path, value, matchPath, matchRule)
    }
    if (rst) {
      banList.add(testKey)
    }
    return rst
  }
}

const sortRuleByPriority = (node: RuleNode, priority: Required<IOptions>["priority"]) => {
  node.children = [...node.children].sort((a, b) => {
    const [ruleA, ruleB] = [a, b].map(item => item.rulePath[item.rulePath.length - 1])
    const typeA = getRuleType(ruleA)
    const typeB = getRuleType(ruleB)
    return priority.indexOf(typeA) - priority.indexOf(typeB)
  })
}

const createMatchFullRuleDataTree = (matchFullRules: boolean | undefined) => (...args: Parameters<typeof createRuleDataTree>) => {
  const ruleDataTree = createRuleDataTree(...args);
  // ????????????????????????????????????????????????????????????
  if (matchFullRules) {
    return pruneTree<RuleDataNode>(ruleDataTree, (node) => {
      if (!node.rule) return false;
      const fulRulesLen = Array.isArray(node.rule) ? node.rule.length : 1
      return node.rulePath.length === fulRulesLen
    })
  }
  return ruleDataTree
}
/**
 * 
 * @param rules ????????????
 * @param transValue ???????????????????????????
 * @returns {
 *  nodeCache: Set<RuleDataNode> ?????????????????????
 *  visit: IFunc<[RuleDataNode], void> ????????????
 * }
 */
const assignMatchRuleDataCreater = (rules: Rules, transValue?: boolean, relativePath?: boolean) => {
  const matchNodes = new Set<RuleDataNode>()
  const assignLeafValue = (node: RuleDataNode, root: RuleDataNode) => {
    const isLeaf = !node.children.length;
    if (!isLeaf) return;
    let transValData = rules.get(<MatchRule>node.rule);
    const endPath = splitEnd(node.path)[1]
    if (typeof transValData === 'function') {
      transValData = transValData(node.path, node.value, node.rulePath, node.rule)
    }
    if (transValue) {
      (<RuleDataNode>node.parent).value[endPath] = transValData;
      return;
    }
    if(isDef(transValData)) {
      if(Array.isArray(transValData)) {
        const setObj = relativePath?node.parent?.value: root.value;
        setProps(setObj, transValData, node.value, true)
      } else {
        (<RuleDataNode>node.parent).value[transValData] = node.value;
      }
    }
    matchNodes.add(node);
  }
  return {
    nodeCache: matchNodes,
    visit: assignLeafValue
  }
}

type RulesAndOptions = [rules: Rules, options: boolean | IOptions];

const adapterBase = (obj: Record<string, unknown>, ...args: RulesAndOptions): Record<string, unknown> => {
  const rules = args[0];
  const options = createOptions(args[1]);
  const { retain, transValue, relativePath, matchFullRules, priority } = options;
  // ???????????????
  const ruleTree = createRuleTree([...rules.keys()]);
  // ???????????????????????????????????????????????????
  traverseByGrade(ruleTree, (node) => sortRuleByPriority(node, priority));
  // ????????????-????????????matchFullRules?????????????????????????????????????????????????????????
  const ruleDataTree = createMatchFullRuleDataTree(matchFullRules)(obj, ruleTree, createTestFunc())
  if (!ruleDataTree) return obj;
  // ????????????-?????????????????????????????????transValue????????????key???????????????
  const { nodeCache, visit } = assignMatchRuleDataCreater(rules, transValue, relativePath);
  traverseByGrade(ruleDataTree, visit);
  // ?????????????????????????????????????????????retain???????????????????????????????????????

  if (!retain) {
    nodeCache.forEach(node => {
      const endPath = splitEnd(node.path)[1]
      delete (<RuleDataNode>node.parent).value[endPath]
    })
  }
  return obj;
}

interface Adapter {
  (obj: Record<string, unknown>, ...args: RulesAndOptions): Record<string, unknown>;
  (obj: Record<string, unknown>, ...args: RulesAndOptions[]): Record<string, unknown>;
}

const adapter: Adapter = (obj, ...args) => {
  if (Array.isArray(args[0])) {
    return args[0].reduce((rtn, argArr) => {
      return adapterBase(rtn, ...<RulesAndOptions>argArr)
    }, obj)
  }
  return adapterBase(obj, ...<RulesAndOptions>args);
}

export default adapter;