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



### 新版本

#### 实现思路

#### 配置项
