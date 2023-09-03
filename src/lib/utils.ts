import { IFunc } from '../types'
// import { mergeWith, get } from "lodash";
const isDef = (val: any) => !!(val || val === 0);
const isRefrence = (checkItem: unknown) => checkItem && ['object', 'function'].includes(typeof checkItem);
const splitEnd = <T = any>(path: T[]): [T[], T] => {
  const prefixPath = path.length > 1 ? path.slice(0, path.length - 1) : []
  const endPath = path[path.length - 1]
  return [prefixPath, endPath]
}

const getTop = (val: unknown) => Array.isArray(val) ? val[val.length - 1] : null;

// const deleteProps = (obj: Record<string, unknown>, path: (number | string)[]): boolean => {
//   const [prefixPath, endPath] = splitEnd(path);
//   const o = get(obj, prefixPath);
//   if (!isRefrence(o)) return false;
//   delete o[endPath]
//   return true
// }
const getDataSafely = (obj: Record<string, unknown>, path: (string|number)[], safely?: boolean) => {
  const rollbacks = <IFunc<[],void>[]>[];
  let end = false;
  const tapVal = path.reduce((o: any, p, idx) => {
    if(!isRefrence(o)) return undefined;
    if(!isDef(o[p])&&safely) {
      o[p] = Number.isFinite(o[p])?[]:{}
      rollbacks.unshift(()=>{
        delete o[p]
      })
    }
    if(idx === path.length - 1) {
      end = true
    }
    return o[p]
  }, obj)
  if(!end) {
    rollbacks.forEach(func=>func())
  }
  return tapVal
}


const setProps = (obj: Record<string, unknown>, path: (string|number)[], value: unknown, safely?: boolean): boolean => {
  if (!isRefrence(obj)) return false;
  const [prefixPath, endPath] = splitEnd(path);
  const o = getDataSafely(obj, prefixPath, safely);
  if (!isRefrence(o)) return false;
  o[endPath] = value;
  return true
}

// const rplArrayMerge = <T>(source: T, ...objArr: T[]) => {
//   const rplArrayFunc = (before: unknown, after: unknown): unknown[] | void => {
//     if (Array.isArray(before) && Array.isArray(after)) {
//       return after
//     }
//   }
//   return mergeWith(cloneType(source), source, ...objArr, rplArrayFunc)
// }

const cloneType = (val: any) => {
  if (isRefrence(val)) {
    return new val.constructor()
  }
  return val
}

const genJoinAndSplit = () => {
  const connectKey = `#${Math.random().toString(36).substr(2, 5)}#`;
  const split = (str: string): string[] => str.split(connectKey);
  const join = (strArr: (string|number)[]): string => strArr.join(connectKey);
  return {
    split,
    join
  }
}

const { join, split } = genJoinAndSplit()

const syncBailHandler = <T extends any[], R>(funcs: IFunc<T, R>[], bailFunc: IFunc<[R], boolean> = () => false) => (...args: T) => {
  const rtn = Array(funcs.length).fill(undefined);
  for (const i in funcs) {
    rtn[i] = funcs[i](...args)
    if (bailFunc(rtn[i])) {
      return rtn
    }
  }
  return rtn
}

export {
  isDef,
  isRefrence,
  getTop,
  // deleteProps,
  setProps,
  // rplArrayMerge,
  cloneType,
  join,
  split,
  splitEnd,
  syncBailHandler,
}