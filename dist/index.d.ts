import { IOptions, Rules } from './types';
declare type RulesAndOptions = [rules: Rules, options: boolean | IOptions];
declare const adapter: (obj: Record<string, unknown>, ...args: RulesAndOptions | [RulesAndOptions[]]) => Record<string, unknown>;
export default adapter;
//# sourceMappingURL=index.d.ts.map