import NeedleAnt from './NeedleAnt.js'

describe('', () => {
  it('', () => {
    // const ground = new DependencyGround('export function a() {}')
    // const ground = new DependencyGround('export function a() {}; export function b() {};')

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
