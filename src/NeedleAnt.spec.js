import NeedleAnt from './NeedleAnt.js'

describe('Change entropy', () => {
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

  it('equals one specifier change unit when a "let" changes into a "var"', () => {
    const initialCode = 'let a'
    const updatedCode = 'var b'
    const ant = new NeedleAnt(initialCode)
    expect(ant.coverEntropy(updatedCode)).toBe(6)
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

// describe('Api changes comparison', () => {
//   it('favours change that adds less dependencies', () => {
//     const initialCode = ''
//     const firstUpdatedCode = `
//       import A from './a';
//       import B from './b';
//     `
//     const secondUpdatedCode = 'import C from "./c"'

//     const ant = new NeedleAnt(initialCode)
//     const firstEntropy = ant.coverEntropy(firstUpdatedCode)
//     const secondEntropy = ant.coverEntropy(secondUpdatedCode)

//     expect(firstEntropy).toBeGreaterThan(secondEntropy)
//   })
// })
