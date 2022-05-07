import adapter from '../src/index'

describe('adapter test', ()=>{
  let obj;
  let rules;
  beforeEach(()=>{
    obj = {
      a:5,
      b:{
        g:{
          f:"xxx"
        },
        a:5,
        d:7,
        f:9
      },
      ca:8,
      cd:9
    }
    rules = new Map([
      ['a', 'transKey-a'],
      [['b', /a|g/, 'f'], (path, value)=>`transKey-${path[path.length - 1]}`]
    ])
  })

  it('normal rule test', ()=>{
    const rst = adapter(obj, rules)
    expect(rst).toEqual({
      'transKey-a':5,
      b:{
        g:{
          'transKey-f':"xxx"
        },
        a:5,
        d:7,
        f:9
      },
      ca:8,
      cd:9
    })
  });

  it('options test', ()=>{
    const rst = adapter(obj, rules, {retain: true, matchFullRules: false})
    expect(rst).toEqual({
      a: 5,
      'transKey-a': 5,
      b:{
        g:{
          f: "xxx",
          'transKey-f':"xxx"
        },
        a:5,
        'transKey-a': 5,
        d:7,
        f:9
      },
      ca:8,
      cd:9,
    })
  })
  it('transvalue', ()=>{
    const rst = adapter(obj, rules, {transValue: true, matchFullRules: false})
    expect(rst).toEqual({
      a:'transKey-a',
      b:{
        g:{
          f:'transKey-f'
        },
        a:'transKey-a',
        d:7,
        f:9
      },
      ca:8,
      cd:9
    })
  })
  it('change path', ()=>{
    rules = new Map([
      ['a', ['e', 'transKey-a-b']],
      [['b', /a|g/, 'f'], (path, value)=>`transKey-${path[path.length - 1]}`]
    ])
    const rst = adapter(obj, rules, {})
    expect(rst).toEqual({
      b:{
        g:{
          'transKey-f':"xxx"
        },
        a:5,
        d:7,
        f:9
      },
      e: {
        'transKey-a-b':5,
      },
      ca:8,
      cd:9
    })
  })
  it('change path relative', ()=>{
    rules = new Map([
      [['b', 'g'], ['e', 'transKey-a-b']]
    ])
    const rst = adapter(obj, rules, {relativePath: true})
    expect(rst).toEqual({
      a:5,
      b:{
        e:{
          'transKey-a-b': {
            f: 'xxx'
          }
        },
        a:5,
        d:7,
        f:9
      },
      ca:8,
      cd:9
    })
  })
})