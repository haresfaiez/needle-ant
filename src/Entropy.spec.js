import { Reflexion } from './Reflexion.js'
import { ExpressionEntropy, JointEntropy } from './Entropy.js'
import { Evaluation } from './Evalution.js'

// Run it for:
//   * https://github.com/GoogleChrome/lighthouse/blob/main/core/gather/base-gatherer.js
//   * https://github.com/GoogleChrome/lighthouse/blob/main/core/lib/traces/metric-trace-events.js

describe('Call entropy', () => {
  describe('when an argument of a call is also a call', () => {
    it('calculates possible identifiers when calls are nested', () => {
      const code = 'a(b())'
      const entropy = new ExpressionEntropy(
        Reflexion.parse(code, (ast) => ast.body),
        new JointEntropy([], ['a', 'b', 'c'])
      )

      expect(entropy.evaluate()).toEqual(new Evaluation(2, 3).withLocalPossibilities(2))
    })

    it('calculates possible identifiers when three calls are nested', () => {
      const code = 'a(b(c()))'
      const entropy = new ExpressionEntropy(
        Reflexion.parse(code, (ast) => ast.body),
        new JointEntropy([], ['a', 'b', 'c', 'd'])
      )

      expect(entropy.evaluate()).toEqual(new Evaluation(3, 4).withLocalPossibilities(3))
    })

    it('is the sum of both calls entropy when the inner call is extracted', () => {
      const code = 'const x = b(); call(x)'
      const entropy = new JointEntropy(
        Reflexion.parse(code, (ast) => ast.body),
        new JointEntropy([], ['a', 'b', 'c', 'd'])
      )

      const expected = new Evaluation(1, 4).withLocalPossibilities(1)
        .plus(new Evaluation(2, 5).withLocalPossibilities(2))
      expect(entropy.evaluate()).toEqual(expected)
    })

    it('is the sum of all calls', () => {
      const code = 'const x = b(); a(c, x, d())'
    })
  })
})

describe('Import statement entropy', () => {
  it('calculates entropy of import specfiers', () => {
    const code = 'import { a } from "./a"'
    const specifiers = Reflexion.parse(code, (ast) => ast.body[0].specifiers)

    const entropy = new ExpressionEntropy(specifiers, new JointEntropy([], ['a', 'b']))

    expect(entropy.evaluate()).toEqual(new Evaluation(1, 2).withLocalPossibilities(1))
  })

  it('calculates entropy of two import specfiers', () => {
    const code = 'import { a, b } from "./a"'
    const specifiers = Reflexion.parse(code, (ast) => ast.body[0].specifiers)

    const entropy = new ExpressionEntropy(specifiers, new JointEntropy([], ['a', 'b', 'c']))

    expect(entropy.evaluate()).toEqual(new Evaluation(2, 3).withLocalPossibilities(2))
  })

  it('calculates entropy of wildcard import specfier', () => {
    const code = 'import * as A from "./a"'
    const specifiers = Reflexion.parse(code, (ast) => ast.body[0].specifiers)

    const entropy = new ExpressionEntropy(specifiers, new JointEntropy([], ['a', 'b', 'c']))

    expect(entropy.evaluate()).toEqual(new Evaluation(3, 3))
  })

  it('calculates entropy of import source', () => {
    const code = 'import { a } from "./a"'
    const source = Reflexion.parse(code, (ast) => ast.body[0].source)

    const entropy = new ExpressionEntropy(source, new JointEntropy([], ['./a', './b', './c']))

    expect(entropy.evaluate()).toEqual(new Evaluation(0, 3).withLocalPossibilities(1))
  })
})