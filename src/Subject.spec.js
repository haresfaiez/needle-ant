import Subject from './Subject.js'

describe('Expresson factors', () => {
  it('of "a + b + c" are a, b, and c', () => {
    const subject = Subject.parse('a + b + c')
    expect(subject.identifiers()).toEqual(['a', 'b', 'c'])
  })
})
