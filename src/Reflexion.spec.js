import { Reflexion } from './Reflexion.js'
import { Entropy } from './Entropy.js'
import { NumericEvaluation } from './Evalution.js'
import { Divisor } from './Divisor.js'

// TODO: Uncomment dependencies tests below (next. release)

describe('Dependency entropy', () => {
  // it('of wildecard import checks files available for import', () => {
  //   const code = 'import * as A from "./a"'
  //   const dependencyAst = Reflexion.parse('', (ast) => ast.body)
  //   const entropy = new Entropy(
  //     Reflexion.parse(code, (ast) => ast.body),
  //     new MultiModulesDivisor(new DependenciesReflexion(dependencyAst, [ './B.js', './C.js' ]))
  //   )

  //   expect(entropy.evaluate().evaluate()).toEvaluateTo(new Evaluations([new NumericEvaluation(1, 3)]))
  // })

  it('is null when a module imports the only exported function', () => {
    const code = 'import { a } from "./a"'
    const dependencyCode = 'export function a() {}'
    const entropy = new Entropy(
      Reflexion.parse(code, (ast) => ast.body),
      new Divisor(Reflexion.parse(dependencyCode))
    )

    expect(entropy.evaluate().evaluate()).toEvaluateTo(new NumericEvaluation(1, 1))
    expect(entropy.evaluate().evaluate().calculate()).toBe(0)
  })

  it('is 1/3 when a module imports of one of three exported functions', () => {
    const code = 'import { a } from "./a"'
    const dependencyCode = 'export function a() {}; export function b() {}; export function c() {};'
    const entropy = new Entropy(
      Reflexion.parse(code, (ast) => ast.body),
      new Divisor(Reflexion.parse(dependencyCode))
    )

    expect(entropy.evaluate().evaluate()).toEvaluateTo(new NumericEvaluation(1, 3))
  })

  it('is 2/3 when a module imports of two of three exported functions', () => {
    const code = 'import { a, b } from "./a"'
    const dependencyCode = 'export function a() {}; export function b() {}; export function c() {};'
    const entropy = new Entropy(
      Reflexion.parse(code, (ast) => ast.body),
      new Divisor(Reflexion.parse(dependencyCode))
    )

    expect(entropy.evaluate().evaluate()).toEvaluateTo(new NumericEvaluation(2, 3))
  })

  // it('is (1/3)+(1/4) when a module imports of one of three exported functions', () => {
  //   const code = 'import { a } from "./a";'
  //   const dependencyCode = 'export function a() {}; export function b() {}; export function c() {};'
  //   const dependencyAst = Reflexion.parse(dependencyCode, (ast) => ast.body)
  //   const entropy = new Entropy(
  //     Reflexion.parse(code, (ast) => ast.body),
  //     new MultiModulesDivisor(new DependenciesReflexion(dependencyAst, [ './b', './c', './e' ]))
  //   )

  //   const expected = new NumericEvaluation(1, 3).plus(new NumericEvaluation(1, 4))
  //   expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  // })

  it('is null when a module imports all exported functions', () => {
    const code = 'import { a, b } from "./a"'
    const dependencyCode = 'export function a() {}; export function b() {};'
    const entropy = new Entropy(
      Reflexion.parse(code, (ast) => ast.body),
      new Divisor(Reflexion.parse(dependencyCode))
    )

    expect(entropy.evaluate().evaluate().calculate()).toEqual(0)
  })
})

describe('Factorization', () => {
  // describe('of a dependcy', () => {
  //   it('counts possible imports', () => {
  //     const dependencyCode = 'export function a() {}; export function b() {}; export function c() {};'

  //     const dependcyAst = Reflexion.parse(dependencyCode, (ast) => ast.body)
  //     const actual = new DependenciesReflexion(dependcyAst, [ './a', './b', './c', './e' ])

  //     expect(actual.importedModuleExports).toEqual(['a', 'b', 'c'])
  //     expect(actual.otherModules).toEqual([ './a', './b', './c', './e' ])
  //   })
  // })

  describe('of an expression', () => {
    it('of "a + b + c" is "a, b, and c"', () => {
      const subject = Reflexion.parse('a + b + c')
      expect(subject.identifiers().raws()).toEqual(['a', 'b', 'c'])
    })
  })
})
