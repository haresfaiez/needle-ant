import { Spectrum } from './Spectrum.js'
import { Entropy } from '../entropy/Entropy.js'
import { NumericEvaluation } from '../evaluation/NumericEvaluation.js'
import { Surface } from './Surface.js'
import { CodeSlice } from '../code/CodeSlice.js'
import { CodePath } from '../code/CodePath.js'

// TODO: [DEPS] Uncomment dependencies tests below (next. release)

describe('Paths collection', () => {
  it('finds class definition', () => {
    const code = `
      class Arithmetics {
        identity = (x) => x;

        plus(a, b) {
          const add = (x, y) => x + y;
          return add(a, b);
        }
      }
    `
    const spectrum = new Spectrum(CodeSlice.parse(code))

    const expected = [
      CodePath.parse('Arithmetics/identity'),
      CodePath.parse('Arithmetics/plus/add'),
      CodePath.parse('Arithmetics/plus'),
      CodePath.parse('Arithmetics'),
    ]
    expect(spectrum.paths()).toEqual(expected)
  })

  it('finds anonymous inner-function definition', () => {
    const code = `
      const increment = (a) => a++;
      const plusTwo = (x) => {
        const doItTwice = (f) => (y) => f(f(y));
        return doItTwice(increment)(x);
      };
    `
    const spectrum = new Spectrum(CodeSlice.parse(code))

    const expected = [
      CodePath.parse('increment'),
      CodePath.parse('plusTwo/doItTwice'),
      CodePath.parse('plusTwo')
    ]
    expect(spectrum.paths()).toEqual(expected)
  })

  it('finds variable-declared inner-function definition', () => {
    const code = `
      const increment = function (a) { a++; }
      const plusTwo = function (x) {
        const doItTwice = function (f) {
          return (y) => f(f(y));
        }
        return doItTwice(increment)(x);
      };
    `
    const spectrum = new Spectrum(CodeSlice.parse(code))

    const expected = [
      CodePath.parse('increment'),
      CodePath.parse('plusTwo/doItTwice'),
      CodePath.parse('plusTwo')
    ]
    expect(spectrum.paths()).toEqual(expected)
  })

  it('finds inner-function definition', () => {
    const code = `
      function increment(a) { a++; }
      function plusTwo(x) {
        function doItTwice(f) {
          return (y) => f(f(y));
        }
        return doItTwice(increment)(x);
      };
    `
    const spectrum = new Spectrum(CodeSlice.parse(code))

    const expected = [
      CodePath.parse('increment'),
      CodePath.parse('plusTwo/doItTwice'),
      CodePath.parse('plusTwo')
    ]
    expect(spectrum.paths()).toEqual(expected)
  })

  it('finds function definition', () => {
    const code = 'function myFunction(){}'
    const spectrum = new Spectrum(CodeSlice.parse(code))

    const expected = [new CodePath(['myFunction'])]
    expect(spectrum.paths()).toEqual(expected)
  })
})

describe('Dependency entropy', () => {
  // it('of wildecard import checks files available for import', () => {
  //   const code = 'import * as A from "./a"'
  //   const dependencyAst = Spectrum.parse('', (ast) => ast.body)
  //   const entropy = new Entropy(
  //     CodeSlice.parse(code),
  //     new MultiModulesSurface(new DependenciesSpectrum(dependencyAst, [ './B.js', './C.js' ]))
  //   )

  //   expect(entropy.evaluate().evaluate()).toEvaluateTo(new Evaluations([new NumericEvaluation(1, 3)]))
  // })

  it('is null when a module imports the only exported function', () => {
    const code = 'import { a } from "./a"'
    const dependencyCode = 'export function a() {}'
    const apiCodeBag = new Spectrum(CodeSlice.parse(dependencyCode)).api()
    const entropy = new Entropy(CodeSlice.parse(code)[0], new Surface(apiCodeBag))

    expect(entropy.evaluate().evaluate()).toEvaluateTo(new NumericEvaluation(1, 1))
    expect(entropy.evaluate().evaluate().calculate()).toBe(0)
  })

  it('is 1/3 when a module imports of one of three exported functions', () => {
    const code = 'import { a } from "./a"'
    const dependencyCode = 'export function a() {}; export function b() {}; export function c() {};'
    const apiCodeBag = new Spectrum(CodeSlice.parse(dependencyCode)).api()
    const entropy = new Entropy(CodeSlice.parse(code)[0], new Surface(apiCodeBag))

    expect(entropy.evaluate().evaluate()).toEvaluateTo(new NumericEvaluation(1, 3))
  })

  it('is 2/3 when a module imports of two of three exported functions', () => {
    const code = 'import { a, b } from "./a"'
    const dependencyCode = 'export function a() {}; export function b() {}; export function c() {};'
    const apiCodeBag = new Spectrum(CodeSlice.parse(dependencyCode)).api()
    const entropy = new Entropy(CodeSlice.parse(code)[0], new Surface(apiCodeBag))

    expect(entropy.evaluate().evaluate()).toEvaluateTo(new NumericEvaluation(2, 3))
  })

  // it('is (1/3)+(1/4) when a module imports of one of three exported functions', () => {
  //   const code = 'import { a } from "./a";'
  //   const dependencyCode = 'export function a() {}; export function b() {}; export function c() {};'
  //   const dependencyAst = Spectrum.parse(dependencyCode, (ast) => ast.body)
  //   const entropy = new Entropy(
  //     CodeSlice.parse(code),
  //     new MultiModulesSurface(new DependenciesSpectrum(dependencyAst, [ './b', './c', './e' ]))
  //   )

  //   const expected = new NumericEvaluation(1, 3).plus(new NumericEvaluation(1, 4))
  //   expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  // })

  it('is null when a module imports all exported functions', () => {
    const code = 'import { a, b } from "./a"'
    const dependencyCode = 'export function a() {}; export function b() {};'
    const apiCodeBag = new Spectrum(CodeSlice.parse(dependencyCode)).api()
    const entropy = new Entropy(CodeSlice.parse(code)[0], new Surface(apiCodeBag))

    expect(entropy.evaluate().evaluate().calculate()).toEqual(0)
  })
})

describe('Factorization', () => {
  // describe('of a dependcy', () => {
  //   it('counts possible imports', () => {
  //     const dependencyCode = 'export function a() {}; export function b() {}; export function c() {};'

  //     const dependcyAst = Spectrum.parse(dependencyCode, (ast) => ast.body)
  //     const actual = new DependenciesSpectrum(dependcyAst, [ './a', './b', './c', './e' ])

  //     expect(actual.importedModuleExports).toEqual(['a', 'b', 'c'])
  //     expect(actual.otherModules).toEqual([ './a', './b', './c', './e' ])
  //   })
  // })

  describe('of an expression', () => {
    it('of "a + b + c" is "a, b, and c"', () => {
      const subject = Spectrum.parse('a + b + c', (ast) => ast.body)
      expect(subject.identifiers().raws()).toEqual(['a', 'b', 'c'])
    })
  })
})
