import { IOptions, Rules } from './types';
type RulesAndOptions = [rules: Rules, options: boolean | IOptions];
interface Adapter {
    (obj: Record<string, unknown>, ...args: RulesAndOptions): Record<string, unknown>;
    (obj: Record<string, unknown>, ...args: RulesAndOptions[]): Record<string, unknown>;
}
declare const adapter: Adapter;
export default adapter;
//# sourceMappingURL=index.d.ts.map