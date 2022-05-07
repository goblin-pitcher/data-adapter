## 数据适配器

### 背景

开发过程中往往需要降低对后端数据结构的依赖性，避免接口数据结构改变引起的前端代码大面积修改。因此需要一个适配器工具，并对转换规则的统一管理，当接口数据结构改变时，只需动态维护转换规则即可。

### 需求分析

首先分析IO，需要实现的方法如下

````javascript
/**
* @params {Object} data 需要转换的数据
* @params rules 数据结构待定，转换规则
* @params {Object} options 转换配置
* @returns {Object} adaptedData 返回数据
*/
function adapter(data, rules, options) {}
````

由于返回的数据量可能很大，为避免不必要的开销，最好在原地修改数据，因此返回的`adaptedData`满足`adaptedData === data`。若确定数据量不大，且需要返回新的数据时，最好在使用时传入`cloneDeep(data)`。

### 旧版本

最初版是项目临时需求的产物，转换规则rules是一个key为匹配路径，value为转换后的路径或值，具体代码可参考[地址](https://github.com/goblin-pitcher/data-adapter/blob/master/assets/adapter.html)，示例如下：

````javascript
/** 
* key为匹配路径, 如：
*  'e|a'代表匹配key为e或a，
*  'b.c'代表匹配路径['b', 'c']
*  '/^c/'代表正则匹配key值，匹配规则为/^c/
*  写法上是支持多种类型混用，如'e|a.b./^c/'，会匹配obj[e|a][b][/^c/]
* value可表示转换后的路径或值，规则如下：
*   当value为字符串待变转换后的路径
*   当value为方法时代表转换后的值，参数分别为：
*      data: 匹配路径的值
*      path: 匹配路径
*      obj: 原对象
*/
const rules= {
  "e|a": "b.a", // 将obj.e或obj.a的值放在obj.b.a下
  "b.c": "b.d", // obj.b.c的值放在obj.b.d下
  "/^c/": "b.f", // 将obj下以c开头的key放到obj.b.f下
  "b.ff": "b.g.f",
  e: (data, path, obj) => obj.a + obj.ca, // obj.e = obj.a + obj.ca
  "b.c": (data) => data ** 2, // obj.b.c = obj.b.c ** 2
};
const obj = {a:5,b:{g:{f:"xxx"},a:5,d:7,f:9},ca:8,cd:9}
adapter(obj, rules)
````

旧版本由于只是临时方案，无疑有很多问题。
规则定义上：比如`b.c`代表路径`['b', 'c']`，这会和作为key值的`b.c`产生歧义，另外用字符串生成正则，写法上需要许多额外的转义符。

拓展性上：旧版本只支持一个配置，即retain—— 是否保留转换前的项。这部分代码写的比较仓促，耦合性太强，添加新的配置需要修改很多个地方，不方便拓展。



### 新版本

首先在rules的定义上，为了避免旧版本的诸多问题，新版本采用了Map作为规则。key为匹配路径，value为转换的规则。

#### 使用方式

具体可参考测试[示例](https://github.com/goblin-pitcher/data-adapter/blob/master/tests/adapter.test.js)

````txt
npm i git+https://github.com/goblin-pitcher/data-adapter.git -S
--------
import adapter from 'data-adapter';
const obj = {
  a:5,
  b:{
    g:{
      f:"xxx"
    },
    a:5,
  }
}
const rules = new Map([
  ['a', 'transKey-a'],
  [['b', /a|g/, 'f'], (path, value)=>`transKey-${path[path.length - 1]}`]
])

// 转换后数据格式如下：
// {
//   'transKey-a':5,
//   b:{
//     g:{
//       'transKey-f':"xxx"
//     },
//     a:5,
//   }
// }
adapter(obj, rules)
````

adapter方法格式如下：

````typescript
interface IOptions {
  retain?: boolean;
  transValue?: boolean;
  matchFullRules?: boolean;
  relativePath?: boolean,
  priority?: ('string' | 'regExp' | 'function')[];
}
// 当options为布尔类型时，代表配置{retain: options}
type RulesAndOptions = [rules: Rules, options: boolean | IOptions];
interface Adapter {
  (obj: Record<string, unknown>, ...args: RulesAndOptions): Record<string, unknown>;
  (obj: Record<string, unknown>, ...args: RulesAndOptions[]): Record<string, unknown>;
}
// adapter也可以接收多个转换规则，即adapter(data, [rules1, rules2, ....])
````

#### 匹配规则

定义匹配规则rules为Map结构。假设rules值如下：

````javascript
const testFunc = (path, value, matchPath, matchRule) => path[path.length - 1]==='f' && value>5;
const rules = new Map([
    [['b', /a|g/, testFunc], (path, value, matchPath, matchRule)=>`transKey-${path[path.length - 1]}`]
])
````

若以rules去转换data，其中一条rule的key是`['b', /a|g/, testFunc]`，代表先匹配`data.b`，然后寻找`data.b.a`和`data.b.g`，并分别寻找`data.b.a`和`data.b.g`下满足`testFunc`的项，若该项存在，则将其key转换为`transKey-${key}`

#### 配置说明

````typescript
interface IOptions {
  // 是否保留转换前的数据，默认为false
  retain?: boolean;
  // rule.value是否作为转换项的值，默认为false
  // 假设某条规则为new Map([['a', 'b']])：
  //   1. 若该项为true，代表data.a = 'b'
  //   2. 该项为false，代表data.b = data.a
  transValue?: boolean;
  // 是否匹配全路径，默认为true。
  // 比如某条规则为new Map([[['a', 'b'], 'xxx']]),假设data.a.b不存在：
  //   1. 当matchFullRules为true，则该条规则不生效
  //   2. 当matchFullRules为false，则会退而求其次寻找data.a，若data.a存在，则会转换data.a
  matchFullRules?: boolean;
  // 转换后的路径是否相对于转换前的路径，默认为false.
  // 比如某条规则为new Map([[['a', 'b'], 'xxx']])：
  //   1. 当relativePath为true，代表将data.a.b的值放到data.a.xxx下
  //   2. 当relativePath为false, 代表将data.a.b的值放到data.xxx下
  relativePath?: boolean,
  // 匹配优先级，默认为['string', 'regExp', 'function']
  // 比如某条规则为new Map([[['a', ['b', /^b/, testFunc]], 'xxx']])
  // 其中['b', /^b/, testFunc]代表以多种规则去匹配data.a下的所有项，priority代表匹配的优先级
  priority?: ('string' | 'regExp' | 'function')[];
}
````

