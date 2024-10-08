import { CodePath } from './code/CodePath.js'
import { NullEvaluation } from './evaluation/NullEvaluation.js'
import { NumericEvaluation } from './evaluation/NumericEvaluation.js'
import NeedleAnt from './NeedleAnt.js'

// TODO: weighted probability: f(real-world-usage-scenario)
//   |-> impact of referenc name (length, changed chars, ...)
//   |-> more vars => more entropy
//   |-> distance between definition and usage
//   |-> frequency/number of usage
//   |-> adding indirection levels => ??
//   |-> bulk entropy (not always 1/n)
//   |-> size of module (fn, class, files, ...): number of lines, ...
// TODO: check todos
// TODO: [Next release]

// TODO: Add path collection for object literals
// TODO: Non-obvious paths (object literals, class as array elements, class as init var value, ...)

describe('Path navigation', () => {
  it('calculates inner-function scope', () => {
    const code = `
      const increment = (a) => a++;
      const plusTwo = (x) => {
        const doItTwice = (f) => (y) => f(f(y));
        return doItTwice(increment)(x);
      };
    `
    const actual = new NeedleAnt(code)
      .entropy()
      .navigate(CodePath.parse('plusTwo/doItTwice'))
      .captureScope()
      .raws()

    const expected = ['increment', 'plusTwo', 'x', 'doItTwice']
    expect(actual).toEqual(expected)
  })

  it('calculates inner-function entropy in a definition block', () => {
    const code = `
      const increment = (a) => a++;
      const identity = (n) => n, plusTwo = (x) => {
        const doItTwice = (f) => (y) => f(f(y));
        return doItTwice(increment)(x);
      };
    `
    const actual = new NeedleAnt(code)
      .entropy()
      .navigate(CodePath.parse('plusTwo/doItTwice'))
      .evaluate()
      .evaluate()

    const expectedEvaluation = new NumericEvaluation(1, 7).times(3)
    expect(actual).toEvaluateTo(expectedEvaluation)
  })

  it('calculates inner anonymous function entropy ', () => {
    const code = `
      const increment = (a) => a++;
      const plusTwo = (x) => {
        const doItTwice = (f) => (y) => f(f(y));
        return doItTwice(increment)(x);
      };
    `
    const actual = new NeedleAnt(code)
      .entropy()
      .navigate(CodePath.parse('plusTwo/doItTwice'))
      .evaluate()
      .evaluate()

    const expectedEvaluation = new NumericEvaluation(1, 6).times(3)
    expect(actual).toEvaluateTo(expectedEvaluation)
  })

  it('calculates inner function entropy ', () => {
    const code = `
      const increment = (a) => a++;
      const plusTwo = function(x) {
        const doItTwice = function (f) {
          return function(y) {
            return f(f(y));
          }
        };
        return doItTwice(increment)(x);
      };
    `
    const actual = new NeedleAnt(code)
      .entropy()
      .navigate(CodePath.parse('plusTwo/doItTwice'))
      .evaluate()
      .evaluate()

    const expectedEvaluation = new NumericEvaluation(1, 6).times(3)
    expect(actual).toEvaluateTo(expectedEvaluation)
  })

  it('calculates inner empty function entropy ', () => {
    const code = `
      const increment = (a) => a++;
      const plusTwo = function(x) {
        const doItTwice = function (f) {
        };
        return doItTwice(increment)(x);
      };
    `
    const actual = new NeedleAnt(code)
      .entropy()
      .navigate(CodePath.parse('plusTwo/doItTwice'))
      .evaluate()

    expect(actual).toEvaluateTo(new NullEvaluation())
  })

  it('calculates inner empty function scope ', () => {
    const code = `
      const increment = (a) => a++;
      const plusTwo = function(x) {
        const doItTwice = function (f) {
        };
        return doItTwice(increment)(x);
      };
    `
    const actual = new NeedleAnt(code)
      .entropy()
      .navigate(CodePath.parse('plusTwo/doItTwice'))
      .captureScope()
      .raws()

    expect(actual).toEqual(['increment', 'plusTwo', 'x', 'doItTwice'])
  })

  it('calculates method entropy ', () => {
    const code = `
      class Arithmetics {
        plusTwo(x) {
          return x+2;
        }
      }
    `
    const actual = new NeedleAnt(code)
      .entropy()
      .navigate(CodePath.parse('Arithmetics/plusTwo'))
      .evaluate()
      .evaluate()

    const expectedEvaluation = new NumericEvaluation(1, 2)
      .plus(new NumericEvaluation(1, 3))
    expect(actual).toEvaluateTo(expectedEvaluation)
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
