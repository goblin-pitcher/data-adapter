function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var defOptions = {
  retain: false,
  transValue: false,
  matchFullRules: true,
  relativePath: false,
  priority: ['string', 'regExp', 'function']
};

// import { mergeWith, get } from "lodash";
var isDef = function isDef(val) {
  return !!(val || val === 0);
};
var isRefrence = function isRefrence(checkItem) {
  return checkItem && ['object', 'function'].includes(_typeof(checkItem));
};
var splitEnd = function splitEnd(path) {
  var prefixPath = path.length > 1 ? path.slice(0, path.length - 1) : [];
  var endPath = path[path.length - 1];
  return [prefixPath, endPath];
};
var getTop = function getTop(val) {
  return Array.isArray(val) ? val[val.length - 1] : null;
};
// const deleteProps = (obj: Record<string, unknown>, path: (number | string)[]): boolean => {
//   const [prefixPath, endPath] = splitEnd(path);
//   const o = get(obj, prefixPath);
//   if (!isRefrence(o)) return false;
//   delete o[endPath]
//   return true
// }
var getDataSafely = function getDataSafely(obj, path, safely) {
  var rollbacks = [];
  var end = false;
  var tapVal = path.reduce(function (o, p, idx) {
    if (!isRefrence(o)) return undefined;
    if (!isDef(o[p]) && safely) {
      o[p] = Number.isFinite(o[p]) ? [] : {};
      rollbacks.unshift(function () {
        delete o[p];
      });
    }
    if (idx === path.length - 1) {
      end = true;
    }
    return o[p];
  }, obj);
  if (!end) {
    rollbacks.forEach(function (func) {
      return func();
    });
  }
  return tapVal;
};
var setProps = function setProps(obj, path, value, safely) {
  if (!isRefrence(obj)) return false;
  var _splitEnd = splitEnd(path),
    _splitEnd2 = _slicedToArray(_splitEnd, 2),
    prefixPath = _splitEnd2[0],
    endPath = _splitEnd2[1];
  var o = getDataSafely(obj, prefixPath, safely);
  if (!isRefrence(o)) return false;
  o[endPath] = value;
  return true;
};
var genJoinAndSplit = function genJoinAndSplit() {
  var connectKey = "#".concat(Math.random().toString(36).substr(2, 5), "#");
  var split = function split(str) {
    return str.split(connectKey);
  };
  var join = function join(strArr) {
    return strArr.join(connectKey);
  };
  return {
    split: split,
    join: join
  };
};
genJoinAndSplit();
var createDefRuleNode = function createDefRuleNode() {
  return {
    parent: null,
    children: [],
    rulePath: [],
    rule: null
  };
};
var createDefRuleDataNode = function createDefRuleDataNode() {
  return {
    parent: null,
    children: [],
    path: [],
    value: null,
    rule: null,
    rulePath: []
  };
};
var traverseByGrade = function traverseByGrade(root, visit) {
  var checkItems = [root];
  while (checkItems.length) {
    var _checkItem$children;
    var checkItem = checkItems.shift();
    visit(checkItem, root);
    if ((_checkItem$children = checkItem.children) !== null && _checkItem$children !== void 0 && _checkItem$children.length) {
      checkItems = checkItems.concat(checkItem.children);
    }
  }
};
var pruneTree = function pruneTree(root) {
  var validateFunc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
    return true;
  };
  var checkValidateAndPrune = function checkValidateAndPrune(node) {
    if (!node) return false;
    var children = node.children.map(function (n) {
      if (checkValidateAndPrune(n)) return n;
      return null;
    }).filter(Boolean);
    node.children = children;
    return !!node.children.length || validateFunc(node);
  };
  return checkValidateAndPrune(root) ? root : null;
};
var createRuleDescendantNode = function createRuleDescendantNode(rule) {
  var root = createDefRuleNode();
  var decoRules = [].concat(rule).map(function (child) {
    return [].concat(child);
  });
  var checkGradeNodes = [root];
  decoRules.forEach(function (ruleArr) {
    var tempChekGradeNodes = [];
    checkGradeNodes.forEach(function (node) {
      var children = ruleArr.map(function (ruleItem) {
        var defNode = createDefRuleNode();
        defNode.parent = node;
        defNode.rule = rule;
        defNode.rulePath = defNode.parent.rulePath.concat(ruleItem);
        return defNode;
      });
      node.children = children;
      tempChekGradeNodes.push.apply(tempChekGradeNodes, _toConsumableArray(children));
    });
    checkGradeNodes = tempChekGradeNodes;
  });
  return root;
};
var createRuleTree = function createRuleTree(matchRules) {
  var root = createDefRuleNode();
  var rules = matchRules.reduce(function (arr, rule) {
    var ruleRoot = createRuleDescendantNode(rule);
    return arr.concat(ruleRoot.children);
  }, []);
  root.children = rules;
  return root;
};
var createRuleDataTree = function createRuleDataTree() {
  var createRuleDataTreeBase = function createRuleDataTreeBase() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var data = args[0],
      ruleTree = args[1],
      testFunc = args[2],
      _args$ = args[3],
      parentNode = _args$ === void 0 ? null : _args$;
    var checkItems = ruleTree.children;
    if (!checkItems.length || !isRefrence(data)) return data;
    if (!parentNode) {
      parentNode = createDefRuleDataNode();
      parentNode.value = data;
    }
    var children = [];
    Object.keys(data).forEach(function (key) {
      var path = parentNode.path.concat(key);
      var value = data[key];
      checkItems.forEach(function (checkRule) {
        var matchPath = checkRule.rulePath;
        var matchRule = checkRule.rule;
        var isTreeNode = testFunc(path, value, matchPath, matchRule, data);
        if (!isTreeNode) return;
        var ruleDataNode = createDefRuleDataNode();
        ruleDataNode.parent = parentNode;
        ruleDataNode.path = path;
        ruleDataNode.value = value;
        ruleDataNode.rulePath = matchPath;
        ruleDataNode.rule = matchRule;
        createRuleDataTreeBase(value, checkRule, testFunc, ruleDataNode);
        children.push(ruleDataNode);
      });
    });
    parentNode.children = children;
    return parentNode;
  };
  return createRuleDataTreeBase.apply(void 0, arguments);
};

// import { merge } from 'lodash';
var createOptions = function createOptions(options) {
  var newOpts = typeof options === 'boolean' ? {
    retain: options
  } : options;
  return _objectSpread(_objectSpread({}, defOptions), newOpts);
};
var getRuleType = function getRuleType(rule) {
  var ruleType = _typeof(rule);
  if (ruleType === 'string') return 'string';
  if (ruleType === 'function') return 'function';
  return 'regExp';
};
var TapFunc = function TapFunc(path, value, matchPath, matchRule, data) {
  var rst = false;
  var testRule = matchPath[matchPath.length - 1];
  var key = path[path.length - 1];
  var ruleType = getRuleType(testRule);
  if (ruleType === 'string') {
    rst = key === testRule;
  } else if (ruleType === 'regExp') {
    rst = testRule.test("".concat(key));
  } else {
    rst = testRule(path, value, matchPath, matchRule, data);
  }
  return rst;
};
var sortRuleByPriority = function sortRuleByPriority(node, priority) {
  node.children = _toConsumableArray(node.children).sort(function (a, b) {
    var _map = [a, b].map(function (item) {
        return item.rulePath[item.rulePath.length - 1];
      }),
      _map2 = _slicedToArray(_map, 2),
      ruleA = _map2[0],
      ruleB = _map2[1];
    var typeA = getRuleType(ruleA);
    var typeB = getRuleType(ruleB);
    return priority.indexOf(typeA) - priority.indexOf(typeB);
  });
};
var createMatchFullRuleDataTree = function createMatchFullRuleDataTree(matchFullRules) {
  return function () {
    var ruleDataTree = createRuleDataTree.apply(void 0, arguments);
    // 若需要全规则匹配，则裁剪不符合条件的节点
    if (matchFullRules) {
      return pruneTree(ruleDataTree, function (node) {
        if (!node.rule) return false;
        var fulRulesLen = Array.isArray(node.rule) ? node.rule.length : 1;
        return node.rulePath.length === fulRulesLen;
      });
    }
    return ruleDataTree;
  };
};
/**
 *
 * @param rules 匹配规则
 * @param transValue 是否转换匹配项的值
 * @returns {
 *  nodeCache: Set<RuleDataNode> 转换的叶子节点
 *  visit: IFunc<[RuleDataNode], void> 访问函数
 * }
 */
var assignMatchRuleDataCreater = function assignMatchRuleDataCreater(rules, data, transValue, relativePath) {
  var matchNodes = new Set();
  var assignLeafValue = function assignLeafValue(node, root) {
    var isLeaf = !node.children.length;
    if (!isLeaf) return;
    var transValData = rules.get(node.rule);
    var endPath = splitEnd(node.path)[1];
    if (typeof transValData === 'function') {
      transValData = transValData(node.path, node.value, node.rulePath, node.rule, data);
    }
    if (transValue) {
      node.parent.value[endPath] = transValData;
      return;
    }
    if (isDef(transValData)) {
      if (Array.isArray(transValData)) {
        var _node$parent;
        var setObj = relativePath ? (_node$parent = node.parent) === null || _node$parent === void 0 ? void 0 : _node$parent.value : root.value;
        setProps(setObj, transValData, node.value, true);
      } else {
        node.parent.value[transValData] = node.value;
      }
    } else {
      var _node$parent2;
      var key = getTop((_node$parent2 = node.parent) === null || _node$parent2 === void 0 ? void 0 : _node$parent2.rule);
      key && delete node.value[key];
    }
    matchNodes.add(node);
  };
  return {
    nodeCache: matchNodes,
    visit: assignLeafValue
  };
};
var adapterBase = function adapterBase(obj) {
  var rules = arguments.length <= 1 ? undefined : arguments[1];
  var options = createOptions(arguments.length <= 2 ? undefined : arguments[2]);
  var retain = options.retain,
    transValue = options.transValue,
    relativePath = options.relativePath,
    matchFullRules = options.matchFullRules,
    priority = options.priority;
  // 创建匹配树
  var ruleTree = createRuleTree(_toConsumableArray(rules.keys()));
  // 根据配置的优先级对匹配规则进行排序
  traverseByGrade(ruleTree, function (node) {
    return sortRuleByPriority(node, priority);
  });
  // 生成规则-数据树，matchFullRules配置决定是否剪去没有完全匹配规则的节点
  var ruleDataTree = createMatchFullRuleDataTree(matchFullRules)(obj, ruleTree, TapFunc);
  if (!ruleDataTree) return obj;
  // 遍历规则-数据树的叶子节点，根据transValue配置进行key或值的转换
  var _assignMatchRuleDataC = assignMatchRuleDataCreater(rules, obj, transValue, relativePath),
    nodeCache = _assignMatchRuleDataC.nodeCache,
    visit = _assignMatchRuleDataC.visit;
  traverseByGrade(ruleDataTree, visit);
  // 对于匹配并成功转换的节点，根据retain配置判断是否保留转换前的项
  if (!retain) {
    nodeCache.forEach(function (node) {
      var endPath = splitEnd(node.path)[1];
      delete node.parent.value[endPath];
    });
  }
  return obj;
};
var adapter = function adapter(obj) {
  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }
  if (Array.isArray(args[0])) {
    return args.reduce(function (rtn, argArr) {
      if (!argArr.length) return rtn;
      return adapterBase.apply(void 0, [rtn].concat(_toConsumableArray(argArr)));
    }, obj);
  }
  return adapterBase.apply(void 0, [obj].concat(args));
};
export { adapter as default };
