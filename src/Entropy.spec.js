import { Reflexion } from './Reflexion.js'
import { Entropy, BodyEntropy } from './Entropy.js'
import { Evaluation } from './Evalution.js'
import { Divisor } from './Divisor.js'

describe('Method invocation entropy', () => {
  it('sums objects entropy and method entropy', () => {
    const code = 'f.c()'
    const entropy = new Entropy(
      Reflexion.parse(code, (ast) => ast.body),
      new Divisor(['f', 'z'])
    )

    const expected = new Evaluation(1, 2).plus(new Evaluation(1, 1))
    expect(entropy.evaluate()).toEvaluateTo(expected)
  })

  it('sums all invocation when a method invocation argument is a function call', () => {
    const code = 'f.c(b())'
    const entropy = new Entropy(
      Reflexion.parse(code, (ast) => ast.body),
      new Divisor(['f', 'z', 'b', 'c'])
    )

    const expected = new Evaluation(1, 4)
      .plus(new Evaluation(1, 1))
      .plus(new Evaluation(1, 4))
    expect(entropy.evaluate()).toEvaluateTo(expected)
  })

  it('sums all invocation when a arguments are functions calls', () => {
    const code = 'f.c(b(), c())'
    const entropy = new Entropy(
      Reflexion.parse(code, (ast) => ast.body),
      new Divisor(['f', 'z', 'b', 'c'])
    )

    const expected = new Evaluation(1, 4)
      .plus(new Evaluation(1, 1))
      .plus(new Evaluation(1, 4).plus(new Evaluation(1, 4)))
    expect(entropy.evaluate()).toEvaluateTo(expected)
  })

  it('considers all methods invocation for each method invocation entropy', () => {
    const code = 'f.aMethod(); f.anOtherMethod();'
    const divisor = Divisor.parse(code, (ast) => ast.body)
    divisor.accesses.add('aMethod')
    divisor.accesses.add('anOtherMethod')
    const entropy = new BodyEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      divisor
    )

    const expected = new Evaluation(1, 1).plus(new Evaluation(1, 2)).times(2)
    expect(entropy.evaluate()).toEvaluateTo(expected)
  })
})

describe('Call entropy', () => {
  describe('when an argument of a call is also a call', () => {
    it('calculates possible identifiers when calls are nested', () => {
      const code = 'a(b())'
      const entropy = new Entropy(
        Reflexion.parse(code, (ast) => ast.body),
        new Divisor(['a', 'b', 'c'])
      )

      expect(entropy.evaluate()).toEvaluateTo(new Evaluation(2, 3))
    })

    it('calculates possible identifiers when three calls are nested', () => {
      const code = 'a(b(c()))'
      const entropy = new Entropy(
        Reflexion.parse(code, (ast) => ast.body),
        new Divisor(['a', 'b', 'c', 'd'])
      )

      expect(entropy.evaluate()).toEvaluateTo(new Evaluation(3, 4))
    })

    it('is the sum of both calls entropy when the inner call is extracted', () => {
      const code = 'const x = b(); call(x)'
      const entropy = new BodyEntropy(
        Reflexion.parse(code, (ast) => ast.body),
        new Divisor(['b', 'call'])
      )

      const expected = new Evaluation(1, 3)
        .plus(new Evaluation(2, 3))
      expect(entropy.evaluate()).toEvaluateTo(expected)
    })

    it('is the sum of all calls', () => {
      const code = 'const x = b(); a(c, x, d())'
      const entropy = new BodyEntropy(
        Reflexion.parse(code, (ast) => ast.body),
        new Divisor(['a', 'b', 'c', 'd'])
      )

      const expected = new Evaluation(1, 5).plus(new Evaluation(4, 5))
      expect(entropy.evaluate()).toEvaluateTo(expected)
    })
  })
})

describe('Import statement entropy', () => {
  it('calculates entropy of import specfiers', () => {
    const code = 'import { a } from "./a"'
    const specifiers = Reflexion.parse(code, (ast) => ast.body)

    const entropy = new BodyEntropy(specifiers, new Divisor(['a', 'b']))

    expect(entropy.evaluate()).toEvaluateTo(new Evaluation(1, 2))
  })

  it('calculates entropy of two import specfiers', () => {
    const code = 'import { a, b } from "./a"'
    const specifiers = Reflexion.parse(code, (ast) => ast.body)

    const entropy = new BodyEntropy(specifiers, new Divisor(['a', 'b', 'c']))

    expect(entropy.evaluate()).toEvaluateTo(new Evaluation(2, 3))
  })

  it('calculates entropy of wildcard import specfier', () => {
    const code = 'import * as A from "./a"'
    const specifiers = Reflexion.parse(code, (ast) => ast.body)

    const entropy = new BodyEntropy(specifiers, new Divisor(['a', 'b', 'c']))

    expect(entropy.evaluate()).toEvaluateTo(new Evaluation(3, 3))
  })

  it('calculates entropy of import source', () => {
    const code = 'import { a } from "./a"'
    const source = Reflexion.parse(code, (ast) => ast.body)

    const entropy = new BodyEntropy(source, new Divisor(['./a', './b', './c']))

    expect(entropy.evaluate()).toEvaluateTo(new Evaluation(1, 3))
  })
})

describe('Function body entropy', () => {
  it('is the body statement entropy for identity function', () => {
    const code = 'const identity = (aNumber) => aNumber;'
    const entropy = new BodyEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      new Divisor([])
    )

    const expectedEvaluation = new Evaluation(1, 2)
    expect(entropy.evaluate()).toEvaluateTo(expectedEvaluation)
  })

  it('with local variables does not affect global scope', () => {
    const code = `
      const a = (i) => {
        const next = i + 1;
        return next;
      };
      a(4, 5);
    `
    const entropy = new BodyEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      new Divisor([])
    )

    const expectedEvaluation =
      new Evaluation(2, 4)
        .plus(new Evaluation(1, 3))
        .plus(new Evaluation(2, 2))
    expect(entropy.evaluate()).toEvaluateTo(expectedEvaluation)
  })

  it('defined variable does not impace top-level scope', () => {
    const code = `
      const start = 40;
      const a = (aNumber) => {
        return start - aNumber;
      };
      a(4);
    `
    const entropy = new BodyEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      new Divisor([])
    )

    const expectedEvaluation =
      new Evaluation(1, 2)
        .plus(new Evaluation(2, 3))
        .plus(new Evaluation(2, 3))
    expect(entropy.evaluate()).toEvaluateTo(expectedEvaluation)
  })

  it('does not impact another function', () => {
    const code = `
      const increment = (i) => {
        const next = i + 1;
        return next;
      };
      const decrementTwice = (n) => {
        const first = n - 1;
        const second = first - 1;
        return second;
      }
      decrementTwice(increment(20))
    `
    const entropy = new BodyEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      new Divisor([])
    )

    const expectedEvaluation =
      new Evaluation(2, 4)
        .plus(new Evaluation(1, 3))
        .plus(new Evaluation(2, 5))
        .plus(new Evaluation(2, 6))
        .plus(new Evaluation(1, 5))
        .plus(new Evaluation(3, 3))
    expect(entropy.evaluate()).toEvaluateTo(expectedEvaluation)
  })

  // TODO: Uncomment this
  // it('', () => {
  //   const code = 'function one() { return 1; }'
  // })
})

describe('Variable declaration entropy', () => {
  it('calculates property entropy from accessed properties', () => {
    const code = 'const a = {x: 3, y: 0}; const tmp = a.x;'
    const entropy = new BodyEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      new Divisor([])
    )

    const expected =  new Evaluation(3, 2)
      .plus(new Evaluation(1, 2))
      .plus(new Evaluation(1, 2))
    expect(entropy.evaluate()).toEvaluateTo(expected)
  })

  // TODO: Uncomment this
  // it('', () => {
  //   const code = 'const tmp = a.x.y;'
  //   const entropy = new BodyEntropy(
  //     Reflexion.parse(code, (ast) => ast.body),
  //     new Divisor([])
  //   )

  //   const expected =  new Evaluation(3, 4)
  //     .plus(new Evaluation(1, 2))
  //     .plus(new Evaluation(1, 1))
  //   expect(entropy.evaluate()).toEqual(expected)
  // })

  // it('', () => {
  //   const code = 'class Example {}; const a = new Example();'
  // })

  // it('', () => {
  //   const code = 'class User {}; const a = new User({ name: "Joe" });'
  // })

  // it('', () => {
  //   const code = 'const a = 0, b = a'
  // })
})

// describe('Class definition entropy', () => {
//   it('', () => {
//     const code = `class A {
//       meta = {s: []};
//         // Skip if auditResults is missing a particular audit result

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
