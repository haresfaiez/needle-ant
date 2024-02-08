import NeedleAnt from './NeedleAnt.js'

import AntTrail from './AntTrail.js'
import { DependencyEntropy } from './Entropy.js'

describe('Dependency entropy', () => {
  // it('is null when a module imports the only exported function', () => {
  //   const code = 'import { a } from "./a"'
  //   const dependencyCode = 'export function a() {}'
  //   const entropy = new DependencyEntropy(
  //     AntTrail.parse(code, (ast) => ast.body),
  //     AntTrail.parse(dependencyCode)
  //   )

  //   expect(entropy.calculate()).toBe(0)
  // })

  // it('is null when a module imports one of three exported functions', () => {
  //   const code = 'import { a } from "./a"'
  //   const dependencyCode = 'export function a() {}; export function b() {}; export function c() {};'
  //   const entropy = new DependencyEntropy(
  //     AntTrail.parse(code, (ast) => ast.body),
  //     AntTrail.parse(dependencyCode)
  //   )

  //   expect(entropy.calculate()).toBe(.5)
  // })

  it('is null when a module imports all exported functions', () => {
    const code = 'import { a, b } from "./a"'
    const dependencyCode = 'export function a() {}; export function b() {};'
    const entropy = new DependencyEntropy(
      AntTrail.parse(code, (ast) => ast.body),
      AntTrail.parse(dependencyCode)
    )

    expect(entropy.calculate()).toBe(0)
  })
})

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
})
