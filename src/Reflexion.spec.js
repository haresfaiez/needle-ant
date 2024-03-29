import { DependenciesReflexion, Reflexion } from './Reflexion.js'
import { DependencyEntropy, JointEntropy } from './Entropy.js'
import { Evaluation } from './Evalution.js'
import NeedleAnt from './NeedleAnt.js'

describe('Successive statements entropy', () => {
  it('is the sum of each statement entropy', () => {
    const ant = new NeedleAnt('(a) => { if (a > 0) { return true; } return a + 1; }')
    expect(ant.entropy()).toBeCloseTo(1.056, 2)
  })
})

describe('Nested expressions entropy', () => {
  it('is the sum of each statement entropy', () => {
    const code = `(a) => {
      if (a > 0) {
        if (a === 1) {
          return false;
        } else {
          return true;
        }
      }
    }`
    const ant = new NeedleAnt(code)
    expect(ant.entropy()).toBeCloseTo(1.056, 2)
  })

  it('twice is the sum of each statement entropy', () => {
    const code = `(a) => {
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
    const ant = new NeedleAnt(code)
    expect(ant.entropy()).toBeCloseTo(1.584, 2)
  })
})

describe('Dependency entropy', () => {
  it('of wildecard import checks files available for import', () => {
    const code = 'import * as A from "./a"'
    const entropy = new DependencyEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      new JointEntropy([], new DependenciesReflexion().add('./B.js').add('./C.js'))
    )

    expect(entropy.evaluate()).toEqual(new Evaluation(1, 2))
  })

  it('is null when a module imports the only exported function', () => {
    const code = 'import { a } from "./a"'
    const dependencyCode = 'export function a() {}'
    const entropy = new DependencyEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      new JointEntropy([], Reflexion.parse(dependencyCode))
    )

    expect(entropy.evaluate()).toEqual(new Evaluation(1, 1))
    expect(entropy.calculate()).toBe(0)
  })

  it('is 1/3 when a module imports of one of three exported functions', () => {
    const code = 'import { a } from "./a"'
    const dependencyCode = 'export function a() {}; export function b() {}; export function c() {};'
    const entropy = new DependencyEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      new JointEntropy([], Reflexion.parse(dependencyCode))
    )

    expect(entropy.evaluate()).toEqual(new Evaluation(1, 3))
  })

  it('is 2/3 when a module imports of two of three exported functions', () => {
    const code = 'import { a, b } from "./a"'
    const dependencyCode = 'export function a() {}; export function b() {}; export function c() {};'
    const entropy = new DependencyEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      new JointEntropy([], Reflexion.parse(dependencyCode))
    )

    expect(entropy.evaluate()).toEqual(new Evaluation(2, 3))
  })

  it('is (1/3)+(1/4) when a module imports of one of three exported functions', () => {
    const code = 'import { a } from "./a";'
    const dependencyCode = 'export function a() {}; export function b() {}; export function c() {};'
    const dependencyAst = Reflexion.parse(dependencyCode, (ast) => ast.body)
    const entropy = new DependencyEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      new JointEntropy([], new DependenciesReflexion(dependencyAst, [ './a', './b', './c', './e' ]))
    )

    const expected = new Evaluation(1, 3).plus(new Evaluation(1, 4))
    expect(entropy.evaluate()).toEqual(expected)
  })

  it('is null when a module imports all exported functions', () => {
    const code = 'import { a, b } from "./a"'
    const dependencyCode = 'export function a() {}; export function b() {};'
    const entropy = new DependencyEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      new JointEntropy([], Reflexion.parse(dependencyCode))
    )

    expect(entropy.calculate()).toEqual(0)
  })
})

describe('Factorization', () => {
  describe('of a dependcy', () => {
    it('counts possible imports', () => {
      const dependencyCode = 'export function a() {}; export function b() {}; export function c() {};'

      const dependcyAst = Reflexion.parse(dependencyCode, (ast) => ast.body)
      const actual = new DependenciesReflexion(dependcyAst, [ './a', './b', './c', './e' ])

      expect(actual.importedModuleExports).toEqual(['a', 'b', 'c'])
      expect(actual.otherModules).toEqual([ './a', './b', './c', './e' ])
    })
  })

  describe('of an expression', () => {
    it('of "a + b + c" is "a, b, and c"', () => {
      const subject = Reflexion.parse('a + b + c')
      expect(subject.identifiers()).toEqual(['a', 'b', 'c'])
    })
  })
})
