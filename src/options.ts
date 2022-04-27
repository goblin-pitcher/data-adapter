import { IOptions } from './types'
const defOptions: IOptions = {
  retain: false,
  transValue: false,
  matchFullRules: true,
  priority: ['string', 'regExp', 'function']
}

export default defOptions;
