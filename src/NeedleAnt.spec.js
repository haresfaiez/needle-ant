import NeedleAnt from './NeedleAnt.js'

describe('Change entropy', () => {
  it('is 0 if the string is empty both before and after', () => {
    const ant = new NeedleAnt()
    expect(ant.entropy('', '')).toBe(0)
  })

  it('is 0 if the string does not change', () => {
    const ant = new NeedleAnt()
    expect(ant.entropy('a', 'a')).toBe(0)
  })

  it('is NAME_UNIT when a constant name changes', () => {
    const initialCode = 'var a'
    const updatedCode = 'var b'
    const ant = new NeedleAnt()
    expect(ant.entropy(initialCode, updatedCode)).toBeCloseTo(4.7, 2)
  })

  it('is NAME_UNIT when a constant name and length change', () => {
    const initialCode = 'var ab'
    const updatedCode = 'var bf'
    const ant = new NeedleAnt()
    expect(ant.entropy(initialCode, updatedCode)).toBeCloseTo(9.4, 2)

  })

  // constant name change but all others stay the same
  // var ab, var ab

  // a, a
  // ab, ac
  // abc, xyw
  // var/const
  // let/var
  // const a = 5, const a = 'Hello'
})
