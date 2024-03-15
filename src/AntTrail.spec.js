import { AntTrail, DependenciesGround, Reflexion } from './AntTrail.js'
import { DependencyEntropy } from './Entropy.js'
import { Evaluation } from './Evalution.js'
import NeedleAnt from './NeedleAnt.js'

describe('Dependency AntTrail', () => {
  it('counts possible imports', () => {
    const dependencyCode = 'export function a() {}; export function b() {}; export function c() {};'

    const actual = AntTrail.dependency(dependencyCode, [ './a', './b', './c', './e' ])

    expect(actual.importedModuleExports).toEqual(['a', 'b', 'c'])
    expect(actual.otherModules).toEqual([ './a', './b', './c', './e' ])
  })
})

describe('Expresson factors', () => {
  it('of "a + b + c" are a, b, and c', () => {
    const subject = Reflexion.parse('a + b + c')
    expect(subject.identifiers()).toEqual(['a', 'b', 'c'])
  })
})

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

describe('Module dependency entropy', () => {
  it('of wildecard checks files available for import', () => {
    const code = 'import * as A from "./a"'
    const entropy = new DependencyEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      new DependenciesGround().add('./B.js').add('./C.js')
    )

    expect(entropy.evaluate()).toEqual(new Evaluation(1, 2))
  })
})

describe('Dependency entropy', () => {
  it('is null when a module imports the only exported function', () => {
    const code = 'import { a } from "./a"'
    const dependencyCode = 'export function a() {}'
    const entropy = new DependencyEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      Reflexion.parse(dependencyCode)
    )

    expect(entropy.evaluate()).toEqual(new Evaluation(1, 1))
    expect(entropy.calculate()).toBe(0)
  })

  it('is null when a module imports one of three exported functions', () => {
    const code = 'import { a } from "./a"'
    const dependencyCode = 'export function a() {}; export function b() {}; export function c() {};'
    const entropy = new DependencyEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      Reflexion.parse(dependencyCode)
    )

    expect(entropy.evaluate()).toEqual(new Evaluation(1, 3))
  })

  it('is not null when a module imports two of three exported functions', () => {
    const code = 'import { a, b } from "./a"'
    const dependencyCode = 'export function a() {}; export function b() {}; export function c() {};'
    const entropy = new DependencyEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      Reflexion.parse(dependencyCode)
    )

    expect(entropy.evaluate()).toEqual(new Evaluation(2, 3))
  })

  it('is null when a module imports one of three exported functions', () => {
    const code = 'import { a } from "./a";'
    const dependencyCode = 'export function a() {}; export function b() {}; export function c() {};'
    const entropy = new DependencyEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      AntTrail.dependency(dependencyCode, [ './a', './b', './c', './e' ])
    )

    const expected = new Evaluation(1, 3).withLocalPossibilities(1).plus(new Evaluation(0, 4).withLocalPossibilities(1))
    expect(entropy.evaluate()).toEqual(expected)
  })

  it('is null when a module imports all exported functions', () => {
    const code = 'import { a, b } from "./a"'
    const dependencyCode = 'export function a() {}; export function b() {};'
    const entropy = new DependencyEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      Reflexion.parse(dependencyCode)
    )

    expect(entropy.calculate()).toEqual(0)
  })
})

// describe('Dependencies entropy', () => {
// it('equals 0 when an imported file changes', () => {
//   const initialCode = 'import A from "./a"'
//   const updatedCode = 'import B from "./b"'
//   const ant = new NeedleAnt(initialCode)
//   expect(ant.coverEntropy(updatedCode)).toBe(0)
// })

// it('equals new file unit when an import stays but a new file is added in the file system', () => {
//   const initialCode = 'import A from "./a"'
//   const updatedCode = 'import B from "./b"'
//   const ant = new NeedleAnt(initialCode)
//   ant.notice('./c']
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
// })
