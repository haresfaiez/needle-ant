import NeedleAnt from './NeedleAnt.js'

describe('Successive statements entropy', () => {
  it('is the sum of each statement entropy', () => {
    const ant = new NeedleAnt('(a) => { if (a > 0) { return true; } return a + 1; }')
    expect(ant.entropy()).toBeCloseTo(1.056, 2)
  })
})
