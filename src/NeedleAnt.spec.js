import { NumericEvaluation } from './evaluation/NumericEvaluation.js'
import NeedleAnt from './NeedleAnt.js'

// TODO: test path with: const a = () => {}
// TODO: Implement navigate() and scope() for all Entropy classes
// TODO: Rename Divisor, Reflexion, and reflexion
// TODO: Restore ignored tests
// TODO: Implemnt a mechanism to study Vite code base
// TODO: weighted probability
// TODO: check todos
// TODO: [Next release]

describe('Path navigation', () => {
  xit('calculates inner-function entropy ', () => {
    const code = `
      const incerment = (a) => a++;
      const plusTwo = (x) => {
        const doItTwice = (f) => (y) => f(f(y));
        return doItTwice(increment)(x);
      };
    `
    const actual = new NeedleAnt(code)
      .entropy()
      .navigate('plusTwo/doItTwice')

    const expectedEvaluation = new NumericEvaluation(1, 6).times(3)
    expect(actual.evaluate()).toEvaluateTo(expectedEvaluation)
  })
})

describe('Successive statements entropy', () => {
  it('is the sum of each statement entropy', () => {
    const code = 'const f = (a) => { if (a > 0) { return true; } return a + 1; }'
    const actual = new NeedleAnt(code).entropy()

    const expected = new NumericEvaluation(1, 2)
      .plus(new NumericEvaluation(1, 3))
      .plus(new NumericEvaluation(1, 3))
      .plus(new NumericEvaluation(1, 2))
      .plus(new NumericEvaluation(1, 3))
    expect(actual.evaluate()).toEvaluateTo(expected)
  })
})

describe('Nested expressions entropy', () => {
  it('is the sum of each statement entropy', () => {
    const code = `const f = (a) => {
      if (a > 0) {
        if (a === 1) {
          return false;
        } else {
          return true;
        }
      }
    }`
    const actual = new NeedleAnt(code).entropy()

    const expected = new NumericEvaluation(1, 2)
      .plus(new NumericEvaluation(1, 3))
      .plus(new NumericEvaluation(1, 2))
      .plus(new NumericEvaluation(1, 3))
      .plus(new NumericEvaluation(1, 3))
      .plus(new NumericEvaluation(1, 3))
    expect(actual.evaluate()).toEvaluateTo(expected)
  })

  it('twice is the sum of each statement entropy', () => {
    const code = `const f = (a) => {
      if (a > 5) {
        if (a < 0) {
          if (a === 1) {
            return false;
          } else {
            return true;
          }
        }
      }
    }`
    const actual = new NeedleAnt(code).entropy()

    const expected = new NumericEvaluation(1, 2)
      .plus(new NumericEvaluation(1, 3))
      .plus(new NumericEvaluation(1, 2))
      .plus(new NumericEvaluation(1, 3))
      .plus(new NumericEvaluation(1, 2))
      .plus(new NumericEvaluation(1, 3))
      .plus(new NumericEvaluation(1, 3))
      .plus(new NumericEvaluation(1, 3))
    expect(actual.evaluate()).toEvaluateTo(expected)
  })
})

describe('Function', () => {
  describe('body entropy', () => {
    it('with simple conditional and sum return', () => {
      const code = `const f = (a) => {
        if (a > 0) {
          return a + 2;
        } else {
          return a + 4;
        }
      }`
      const actual = new NeedleAnt(code).entropy()

      const expected = new NumericEvaluation(1, 2)
        .plus(new NumericEvaluation(1, 3))
        .plus(new NumericEvaluation(1, 2))
        .plus(new NumericEvaluation(1, 3))
        .plus(new NumericEvaluation(1, 2))
        .plus(new NumericEvaluation(1, 3))
      expect(actual.evaluate()).toEvaluateTo(expected)
    })
  })

  describe('as references are similarely likely', () => {
    it('of function that returns a constant is null', () => {
      const actual = new NeedleAnt('() => 2').entropy()

      expect(actual.evaluate()).toEvaluateTo(new NumericEvaluation(1, 1))
    })

    it('of function that takes an argument and returns a constant', () => {
      const actual = new NeedleAnt('2').entropy()

      expect(actual.evaluate()).toEvaluateTo(new NumericEvaluation(1, 1))
    })

    it('of function that increments a number', () => {
      const actual = new NeedleAnt('a + 1').entropy()

      const expected = new NumericEvaluation(1, 0).plus(new NumericEvaluation(1, 1))
      expect(actual.evaluate()).toEvaluateTo(expected)
    })

    it('of function that pre-increments a number', () => {
      const actual = new NeedleAnt('1 + a').entropy()


      const expected = new NumericEvaluation(1, 1).plus(new NumericEvaluation(1, 0))
      expect(actual.evaluate()).toEvaluateTo(expected)
    })

    it('of function that sums all available variables', () => {
      const actual = new NeedleAnt('a + b').entropy()

      const expected = new NumericEvaluation(1, 0).plus(new NumericEvaluation(1, 0))
      expect(actual.evaluate()).toEvaluateTo(expected)
    })
  })
})

// TODO: [DEPS] uncomment these (next. release)
// describe('Declarations entropy', () => {
//   it('equals 0 if the string is empty both before and after', () => {
//     const ant = new NeedleAnt('')
//     expect(ant.coverEntropy('')).toBe(0)
//   })

//   it('equals 0 if the string does not change', () => {
//     const ant = new NeedleAnt('a')
//     expect(ant.coverEntropy('a')).toBe(0)
//   })

//   it('equals 0 when a "let" expression does not change', () => {
//     const initialCode = 'let a'
//     const updatedCode = 'let a'
//     const ant = new NeedleAnt(initialCode)
//     expect(ant.coverEntropy(updatedCode)).toBe(0)
//   })

//   it('equals 0 when a "let" expression does not change but the code changes', () => {
//     const initialCode = 'let a'
//     const updatedCode = 'let a;'
//     const ant = new NeedleAnt(initialCode)
//     expect(ant.coverEntropy(updatedCode)).toBe(0)
//   })

//   it('increases unit when a "let" changes into a "var"', () => {
//     const initialCode = 'let a'
//     const updatedCode = 'var a'
//     const ant = new NeedleAnt(initialCode)
//     expect(ant.coverEntropy(updatedCode)).toBeGreaterThan(0)
//   })

//   it('equals one identifier change unit when a constant name changes', () => {
//     const initialCode = 'const a = 1'
//     const updatedCode = 'const b = 1'
//     const ant = new NeedleAnt(initialCode)
//     expect(ant.coverEntropy(updatedCode)).toBe(4)
//   })

//   it('equals one identifier change unit when a constant name and length change', () => {
//     const initialCode = 'const ab45 = 1'
//     const updatedCode = 'const bf = 1'
//     const ant = new NeedleAnt(initialCode)
//     expect(ant.coverEntropy(updatedCode)).toBe(4)
//   })
// })
// describe('Api change entropy', () => {
//   it('equals one declaration change unit when an argument is added to the Api', () => {
//     const initialCode = 'class Country { setCode(codeName) {} }'
//     const updatedCode = 'class Country { setCode(codeName, countryName) {} }'
//     const ant = new NeedleAnt(initialCode)
//     expect(ant.coverEntropy(updatedCode)).toBe(8)
//   })
// })

// describe('Entropy result', () => {
// it('calculates top level variable entropy', () => {
//   const code = `import { a, b, c } from './other.js';
//     const x = b();
//     a(c, x);
//   `
//   const otherJsCode = 'export const a = 1; export const b = 3; export const c = 45;'

//   const actual = new NeedleAnt(code, [otherJsCode]).entropy()

//   const expected =
//     new NumericEvaluation(3, 3, 'import{a,b,c}from\'./other.js\';')
//       .plus(new NumericEvaluation(1, 4, 'b()'))
//       .plus(new NumericEvaluation(3, 4, 'a(c,x)'))

//   expect(actual.evaluate()).toEvaluateTo(expected)
// })

// it('calculates top level entropy of wildcard import', () => {
//   const code = 'import * as Other from \'./other.js\';'
//   const otherJsCode = 'export const a = 1;'

//   const actual = new NeedleAnt(code, [otherJsCode]).entropy()

//   const expected = new NumericEvaluation(1, 1, 'import*as Other from\'./other.js\';')
//   expect(actual.evaluate()).toEqual(expected)
// })
// })
