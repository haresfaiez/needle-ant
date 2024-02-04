import NeedleAnt from './NeedleAnt.js'

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
