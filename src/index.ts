// import { merge } from 'lodash';
import defOptions from './options';
import { IFunc, BaseMatchRule, IOptions, MatchRule, Rules, TransformFunc } from './types';
import { splitEnd, isDef, setProps, getTop } from './lib/utils'
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

const TapFunc : IFunc<[...args: Parameters<TransformFunc>], boolean> =  (path, value, matchPath, matchRule, data) => {
  let rst = false;
  const testRule = <BaseMatchRule>matchPath[matchPath.length - 1];
  const key = path[path.length - 1]
  const ruleType = getRuleType(testRule);
  if (ruleType === 'string') {
    rst = key === testRule
  } else if (ruleType === 'regExp') {
      rst = (<RegExp>testRule).test(`${key}`);
  } else {
    rst = (<TransformFunc>testRule)(path, value, matchPath, matchRule, data)
  }
  return rst
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
  // 若需要全规则匹配，则裁剪不符合条件的节点
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
 * @param rules 匹配规则
 * @param transValue 是否转换匹配项的值
 * @returns {
 *  nodeCache: Set<RuleDataNode> 转换的叶子节点
 *  visit: IFunc<[RuleDataNode], void> 访问函数
 * }
 */
const assignMatchRuleDataCreater = <T>(rules: Rules, data: T, transValue?: boolean, relativePath?: boolean) => {
  const matchNodes = new Set<RuleDataNode>()
  const assignLeafValue = (node: RuleDataNode, root: RuleDataNode) => {
    const isLeaf = !node.children.length;
    if (!isLeaf) return;
    let transValData = rules.get(<MatchRule>node.rule);
    const endPath = splitEnd(node.path)[1]
    if (typeof transValData === 'function') {
      transValData = transValData(node.path, node.value, node.rulePath, node.rule, data)
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
    } else {
      const key = getTop(node.parent?.rule);
      key && (delete node.value[key]);
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
  // 创建匹配树
  const ruleTree = createRuleTree([...rules.keys()]);
  // 根据配置的优先级对匹配规则进行排序
  traverseByGrade(ruleTree, (node) => sortRuleByPriority(node, priority));
  // 生成规则-数据树，matchFullRules配置决定是否剪去没有完全匹配规则的节点
  const ruleDataTree = createMatchFullRuleDataTree(matchFullRules)(obj, ruleTree, TapFunc)
  if (!ruleDataTree) return obj;
  // 遍历规则-数据树的叶子节点，根据transValue配置进行key或值的转换
  const { nodeCache, visit } = assignMatchRuleDataCreater(rules, obj,  transValue, relativePath);
  traverseByGrade(ruleDataTree, visit);
  // 对于匹配并成功转换的节点，根据retain配置判断是否保留转换前的项

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
    return (<RulesAndOptions[]>args).reduce((rtn, argArr) => {
      if(!argArr.length) return rtn
      return adapterBase(rtn, ...<RulesAndOptions>argArr)
    }, obj)
  }
  return adapterBase(obj, ...<RulesAndOptions>args);
}

export default adapter;