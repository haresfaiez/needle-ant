import { AntTrail } from './AntTrail.js'

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
    const subject = AntTrail.parse('a + b + c')
    expect(subject.identifiers()).toEqual(['a', 'b', 'c'])
  })
})
