import NeedleAnt from './NeedleAnt.js'

describe('Empty string', () => {
    it('entropy is 0', () => {
        const ant = new NeedleAnt()
        expect(ant.entropy('')).toBe(0)
    })
})