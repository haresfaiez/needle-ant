import NeedleAnt from './NeedleAnt.js'

// TODO: entropy("sum(a(),b())")=e(calling-sum)+e(calling-a)+e(calling-b) === entropy("const h=b(); sum(a(),h)")
// TODO: entropy("f.c()")=entropy(calling-c-in-f)
// TODO: entropy("f.c()")=entropy(calling-c-in-f)+entropy(using-f)
describe('Functions entropy', () => {
  describe('as references are similarely likely', () => {
    it('of function that returns a constant is null', () => {
      const ant = new NeedleAnt('() => 2')
      expect(ant.entropy()).toBe(0)
    })

    it('of function that takes an argument and returns a constant', () => {
      const ant = new NeedleAnt('2')
      ant.addToScope(['a'])
      expect(ant.entropy()).toBeCloseTo(0, 2)
    })

    it('of function that increments a number', () => {
      const ant = new NeedleAnt('a + 1')
      ant.addToScope(['a'])
      expect(ant.entropy()).toBeCloseTo(.528, 2)
    })

    it('of function that pre-increments a number', () => {
      const ant = new NeedleAnt('1 + a')
      ant.addToScope(['a'])
      expect(ant.entropy()).toBeCloseTo(.528, 2)
    })

    it('of function that sums two numbers', () => {
      const ant = new NeedleAnt('a + b')
      ant.addToScope(['a', 'b'])
      expect(ant.entropy()).toBeCloseTo(.464, 2)
    })
  })
})

// TODO: more variables -> more entropy
// TODO: more state space for variable -> more entropy
// TODO: `f(b){x(),b(),y()}, f(z)` -> higher entropy than `x(), z(), y()`, but same entropy as `f(){x(),z(),y()}, f()`
// TODO: entropy(pull request with another if) >>> entropy(pull request that parses config and dispatch)
// TODO: entropy(a=1, b=2, c=3) > entropy(obj = {a: 1, b: 2, c: 3})

// TODO: no effects on entropy: names/length/lines count
// TODO: refactoring should not change entropy

// TODO: create graph of entropy changes by commit for open-source projects

describe('Dependencies entropy', () => {
  it('equals 0 when an imported file changes', () => {
    const initialCode = 'import A from "./a"'
    const updatedCode = 'import B from "./b"'
    const ant = new NeedleAnt(initialCode)
    expect(ant.coverEntropy(updatedCode)).toBe(0)
  })

  // it('equals new file unit when an import stays but a new file is added in the file system', () => {
  //   const initialCode = 'import A from "./a"'
  //   const updatedCode = 'import B from "./b"'
  //   const ant = new NeedleAnt(initialCode)
  //   ant.notice('./c')
  //   expect(ant.coverEntropy(updatedCode)).toBe(100)
  // })

  // it('favours change that adds less dependencies', () => {
  //   const initialCode = ''
  //   const firstUpdatedCode = `
  //     import A from './a';
  //     import B from './b';
  //   `
  //   const secondUpdatedCode = 'import C from "./c"'

  //   const ant = new NeedleAnt(initialCode)
  //   const firstEntropy = ant.coverEntropy(firstUpdatedCode)
  //   const secondEntropy = ant.coverEntropy(secondUpdatedCode)

  //   expect(firstEntropy).toBeGreaterThan(secondEntropy)
  // })
})

describe('Declarations entropy', () => {
  it('equals 0 if the string is empty both before and after', () => {
    const ant = new NeedleAnt('')
    expect(ant.coverEntropy('')).toBe(0)
  })

  it('equals 0 if the string does not change', () => {
    const ant = new NeedleAnt('a')
    expect(ant.coverEntropy('a')).toBe(0)
  })

  it('equals 0 when a "let" expression does not change', () => {
    const initialCode = 'let a'
    const updatedCode = 'let a'
    const ant = new NeedleAnt(initialCode)
    expect(ant.coverEntropy(updatedCode)).toBe(0)
  })

  it('equals 0 when a "let" expression does not change but the code changes', () => {
    const initialCode = 'let a'
    const updatedCode = 'let a;'
    const ant = new NeedleAnt(initialCode)
    expect(ant.coverEntropy(updatedCode)).toBe(0)
  })

  it('increases unit when a "let" changes into a "var"', () => {
    const initialCode = 'let a'
    const updatedCode = 'var a'
    const ant = new NeedleAnt(initialCode)
    expect(ant.coverEntropy(updatedCode)).toBeGreaterThan(0)
  })

  it('equals one identifier change unit when a constant name changes', () => {
    const initialCode = 'const a = 1'
    const updatedCode = 'const b = 1'
    const ant = new NeedleAnt(initialCode)
    expect(ant.coverEntropy(updatedCode)).toBe(4)
  })

  it('equals one identifier change unit when a constant name and length change', () => {
    const initialCode = 'const ab45 = 1'
    const updatedCode = 'const bf = 1'
    const ant = new NeedleAnt(initialCode)
    expect(ant.coverEntropy(updatedCode)).toBe(4)
  })

  // constant name change but all others stay the same

  // a, a
  // ab, ac
  // abc, xyw
  // var/const
  // let/var
  // const a = 5, const a = 'Hello'
  // const -> let
  // let -> const
})

describe('Api change entropy', () => {
  it('equals one declaration change unit when an argument is added to the Api', () => {
    const initialCode = 'class Country { setCode(codeName) {} }'
    const updatedCode = 'class Country { setCode(codeName, countryName) {} }'
    const ant = new NeedleAnt(initialCode)
    expect(ant.coverEntropy(updatedCode)).toBe(8)
  })
})
