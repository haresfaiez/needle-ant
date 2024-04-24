import { Reflexion } from './Reflexion.js'
import { SingleEntropy, JointEntropy } from './Entropy.js'
import { Evaluation } from './Evalution.js'
import { Divisor } from './Divisor.js'

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

  it('considers all methods invocation for each method invocation entropy', () => {
    const code = 'f.aMethod(); f.anOtherMethod();'
    const entropy = new JointEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      Divisor.parse(code, (ast) => ast.body)
    )

    const expected = new Evaluation(1, 1).plus(new Evaluation(1, 3)).times(2)
    expect(entropy.evaluate()).toEqual(expected)
  })
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

      const expected = new Evaluation(1, 3)
        .plus(new Evaluation(2, 3))
      expect(entropy.evaluate()).toEqual(expected)
    })

    it('is the sum of all calls', () => {
      const code = 'const x = b(); a(c, x, d())'
      const entropy = new JointEntropy(
        Reflexion.parse(code, (ast) => ast.body),
        new Divisor(['a', 'b', 'c', 'd'])
      )

      const expected = new Evaluation(1, 5).plus(new Evaluation(4, 5))
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

describe('Function body entropy', () => {
  it('is the body statement entropy for identity function', () => {
    const code = 'const identity = (aNumber) => aNumber;'
    const entropy = new JointEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      new Divisor([])
    )

    const expectedEvaluation = new Evaluation(1, 2)
    expect(entropy.evaluate()).toEqual(expectedEvaluation)
  })

  it('with local variables does not affect global scope', () => {
    const code = `
      const a = (i) => {
        const next = i + 1;
        return next;
      };
      a(4, 5);
    `
    const entropy = new JointEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      new Divisor([])
    )

    const expectedEvaluation =
      new Evaluation(2, 4)
        .plus(new Evaluation(1, 3))
        .plus(new Evaluation(2, 2))
    expect(entropy.evaluate()).toEqual(expectedEvaluation)
  })

  // TODO: uncomment this
  // it('does not impact another function', () => {
  //   const code = `
  //     const increment = (i) => {
  //       const next = i + 1;
  //       return next;
  //     };
  //     const decrementTwice = (n) => {
  //       const first = n - 1;
  //       const second = first - 1;
  //       return second;
  //     }
  //     decrementTwice(increment(20))
  //   `
  // })

  // TODO: write the same test for NeedleAnt.spec.js
  // it('defined variable does not impace top-level scope', () => {
  //   const code = `
  //     const start = 40;
  //     const a = (aNumber) => {
  //       return start - aNumber;
  //     };
  //     a(4);
  //   `
  //   const entropy = new JointEntropy(
  //     Reflexion.parse(code, (ast) => ast.body),
  //     new Divisor(['40', '4', 'a'])
  //   )

  //   const expectedEvaluation = new JointEntropy([
  //     new Evaluation(1, 3),
  //     new Evaluation(1, 2),
  //     new Evaluation(2, 3),
  //     new Evaluation(2, 3)
  //   ])
  //   expect(entropy.evaluate()).toEqual(expectedEvaluation)
  // })
})


// TODO: uncomment following tests
// describe('Variable declaration entropy', () => {
// it('', () => {
//   const code = 'const a = 1;'
// })

// it('', () => {
//   const code = 'const a = 1; let b = "Hello world!"'
// })

// it('', () => {
//   const code = 'const a = {x: 3, y: 0};'
// })

// it('', () => {
//   const code = 'const a = new Example();'
// })

// it('', () => {
//   const code = 'const a = new User({ name: "Joe" });'
// })
// })

// describe('Class definition entropy', () => {
//   it('', () => {
//     const code = `class A {
//       meta = {s: []};
//          // Skip if auditResults is missing a particular audit result

//       start(passContext) { }

//       /**
//        * Comment
//        */
//       stop(context) { }
//     }
//     `
//   })
// })

// describe('Loop entropy', () => {
//   // TODO: check all forms of loops
// })
