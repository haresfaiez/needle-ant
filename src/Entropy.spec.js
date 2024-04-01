import { Reflexion } from './Reflexion.js'
import { SingleEntropy, JointEntropy } from './Entropy.js'
import { Evaluation } from './Evalution.js'
import { Divisor } from './Divisor.js'

// Run it for:
//   * https://github.com/GoogleChrome/lighthouse/blob/main/core/gather/base-gatherer.js
//   * https://github.com/GoogleChrome/lighthouse/blob/main/core/lib/traces/metric-trace-events.js

describe('Method invocation entropy', () => {
  it('sums objects entropy and method entropy', () => {
    const code = 'f.c()'
    const entropy = new SingleEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      new Divisor(['f', 'z'])
    )

    const expected = new Evaluation(1, 2).plus(new Evaluation(1, 1))
    expect(entropy.evaluate()).toEqual(expected)
  })

  it('sums all invocation when a method invocation argument is a function call', () => {
    const code = 'f.c(b())'
    const entropy = new SingleEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      new Divisor(['f', 'z', 'b', 'c'])
    )

    const expected = new Evaluation(1, 4)
      .plus(new Evaluation(1, 1))
      .plus(new Evaluation(1, 4))
    expect(entropy.evaluate()).toEqual(expected)
  })

  it('sums all invocation when a arguments are functions calls', () => {
    const code = 'f.c(b(), c())'
    const entropy = new SingleEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      new Divisor(['f', 'z', 'b', 'c'])
    )

    const expected = new Evaluation(1, 4)
      .plus(new Evaluation(1, 1))
      .plus(new Evaluation(1, 4).plus(new Evaluation(1, 4)))
    expect(entropy.evaluate()).toEqual(expected)
  })

  // it('considers all methods invocation for method entropy', () => {
  //   const code = 'f.a(); f.b();'
  //   const entropy = new JointEntropy(
  //     Reflexion.parse(code, (ast) => ast.body),
  // new Divisor(['f'])
  //   )

  //   const expected =
  //     new Evaluation(1, 1).plus(new Evaluation(1, 2)).plus(new NullEvaluation())
  //       .plus(new Evaluation(1, 1).plus(new Evaluation(1, 2)).plus(new NullEvaluation()))
  //   expect(entropy.evaluate()).toEqual(expected)
  // })
})

describe('Call entropy', () => {
  describe('when an argument of a call is also a call', () => {
    it('calculates possible identifiers when calls are nested', () => {
      const code = 'a(b())'
      const entropy = new SingleEntropy(
        Reflexion.parse(code, (ast) => ast.body),
        new Divisor(['a', 'b', 'c'])
      )

      expect(entropy.evaluate()).toEqual(new Evaluation(2, 3))
    })

    it('calculates possible identifiers when three calls are nested', () => {
      const code = 'a(b(c()))'
      const entropy = new SingleEntropy(
        Reflexion.parse(code, (ast) => ast.body),
        new Divisor(['a', 'b', 'c', 'd'])
      )

      expect(entropy.evaluate()).toEqual(new Evaluation(3, 4))
    })

    it('is the sum of both calls entropy when the inner call is extracted', () => {
      const code = 'const x = b(); call(x)'
      const entropy = new JointEntropy(
        Reflexion.parse(code, (ast) => ast.body),
        new Divisor(['b', 'call'])
      )

      const expected = new Evaluation(1, 2)
        .plus(new Evaluation(2, 3))
      expect(entropy.evaluate()).toEqual(expected)
    })

    it('is the sum of all calls', () => {
      const code = 'const x = b(); a(c, x, d())'
      const entropy = new JointEntropy(
        Reflexion.parse(code, (ast) => ast.body),
        new Divisor(['a', 'b', 'c', 'd'])
      )

      const expected = new Evaluation(1, 4).plus(new Evaluation(4, 5))
      expect(entropy.evaluate()).toEqual(expected)
    })
  })
})

describe('Import statement entropy', () => {
  it('calculates entropy of import specfiers', () => {
    const code = 'import { a } from "./a"'
    const specifiers = Reflexion.parse(code, (ast) => ast.body)

    const entropy = new JointEntropy(specifiers, new Divisor(['a', 'b']))

    expect(entropy.evaluate()).toEqual(new Evaluation(1, 2))
  })

  it('calculates entropy of two import specfiers', () => {
    const code = 'import { a, b } from "./a"'
    const specifiers = Reflexion.parse(code, (ast) => ast.body)

    const entropy = new JointEntropy(specifiers, new Divisor(['a', 'b', 'c']))

    expect(entropy.evaluate()).toEqual(new Evaluation(2, 3))
  })

  it('calculates entropy of wildcard import specfier', () => {
    const code = 'import * as A from "./a"'
    const specifiers = Reflexion.parse(code, (ast) => ast.body)

    const entropy = new JointEntropy(specifiers, new Divisor(['a', 'b', 'c']))

    expect(entropy.evaluate()).toEqual(new Evaluation(3, 3))
  })

  it('calculates entropy of import source', () => {
    const code = 'import { a } from "./a"'
    const source = Reflexion.parse(code, (ast) => ast.body)

    const entropy = new JointEntropy(source, new Divisor(['./a', './b', './c']))

    expect(entropy.evaluate()).toEqual(new Evaluation(1, 3))
  })
})