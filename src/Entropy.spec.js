import { Reflexion } from './Reflexion.js'
import { Entropy, BodyEntropy } from './Entropy.js'
import { Evaluation, NullEvaluation } from './Evalution.js'
import { Divisor } from './Divisor.js'

describe('Method invocation entropy', () => {
  it('sums objects entropy and method entropy', () => {
    const code = 'f.c()'
    const entropy = new Entropy(
      Reflexion.parse(code, (ast) => ast.body),
      new Divisor(['f', 'z'])
    )

    const expected = new Evaluation(1, 2).plus(new Evaluation(1, 1))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
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
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
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
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('considers all methods invocation for each method invocation entropy', () => {
    const code = 'f.aMethod(); f.anOtherMethod();'
    const divisor = Divisor.parse(code, (ast) => ast.body)
    const entropy = new BodyEntropy(
      Reflexion.parse(code, (ast) => ast.body),
      divisor
    )

    const expected = new Evaluation(1, 1).times(3).plus(new Evaluation(1, 2))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
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

      expect(entropy.evaluate().evaluate()).toEvaluateTo(new Evaluation(2, 3))
    })

    it('calculates possible identifiers when three calls are nested', () => {
      const code = 'a(b(c()))'
      const entropy = new Entropy(
        Reflexion.parse(code, (ast) => ast.body),
        new Divisor(['a', 'b', 'c', 'd'])
      )

      expect(entropy.evaluate().evaluate()).toEvaluateTo(new Evaluation(3, 4))
    })

    it('is the sum of both calls entropy when the inner call is extracted', () => {
      const code = 'const x = b(); call(x)'
      const entropy = new BodyEntropy(
        Reflexion.parse(code, (ast) => ast.body),
        new Divisor(['b', 'call'])
      )

      const expected = new Evaluation(1, 3)
        .plus(new Evaluation(2, 3))
      expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
    })

    it('is the sum of all calls', () => {
      const code = 'const x = b(); a(c, x, d())'
      const entropy = new BodyEntropy(
        Reflexion.parse(code, (ast) => ast.body),
        new Divisor(['a', 'b', 'c', 'd'])
      )

      const expected = new Evaluation(1, 5).plus(new Evaluation(4, 5))
      expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
    })
  })
})

describe('Import statement entropy', () => {
  it('calculates entropy of import specfiers', () => {
    const code = 'import { a } from "./a"'
    const specifiers = Reflexion.parse(code, (ast) => ast.body)

    const entropy = new BodyEntropy(specifiers, new Divisor(['a', 'b']))

    expect(entropy.evaluate().evaluate()).toEvaluateTo(new Evaluation(1, 2))
  })

  it('calculates entropy of two import specfiers', () => {
    const code = 'import { a, b } from "./a"'
    const specifiers = Reflexion.parse(code, (ast) => ast.body)

    const entropy = new BodyEntropy(specifiers, new Divisor(['a', 'b', 'c']))

    expect(entropy.evaluate().evaluate()).toEvaluateTo(new Evaluation(2, 3))
  })

  // TODO: Uncomment and fix this (next. release)
  // it('calculates entropy of wildcard import specfier', () => {
  //   const code = 'import * as A from "./a"'
  //   const specifiers = Reflexion.parse(code, (ast) => ast.body)

  //   const entropy = new BodyEntropy(specifiers, new Divisor(['a', 'b', 'c']))

  //   expect(entropy.evaluate().evaluate()).toEvaluateTo(new Evaluation(3, 3))
  // })

  // TODO: Uncomment and fix this (next. release)
  // it('calculates entropy of import source', () => {
  //   const code = 'import { a } from "./a"'
  //   const source = Reflexion.parse(code, (ast) => ast.body)

  //   const entropy = new BodyEntropy(source, new Divisor(['./a', './b', './c']))

  //   expect(entropy.evaluate().evaluate()).toEvaluateTo(new Evaluation(1, 3))
  // })
})

describe('Function body entropy', () => {
  it('is the body statement entropy for identity function', () => {
    const code = 'const identity = (aNumber) => aNumber;'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expectedEvaluation = new Evaluation(1, 2)
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expectedEvaluation)
  })

  it('forgets function params after function definition', () => {
    const code = 'const identity = (aNumber) => {const b = aNumber}; const a = 3'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expectedEvaluation = new Evaluation(1, 3).plus(new Evaluation(1, 3))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expectedEvaluation)
  })

  it('with local variables does not affect global scope', () => {
    const code = `
      const a = (i) => {
        const next = i + 1;
        return next;
      };
      a(4, 5);
    `
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expectedEvaluation =
      new Evaluation(1, 3)
        .plus(new Evaluation(1, 4))
        .plus(new Evaluation(1, 3))
        .plus(new Evaluation(2, 2))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expectedEvaluation)
  })

  it('defined variable does not impace top-level scope', () => {
    const code = `
      const start = 40;
      const a = (aNumber) => {
        return start - aNumber;
      };
      a(4);
    `
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expectedEvaluation =
      new Evaluation(1, 2)
        .plus(new Evaluation(1, 3))
        .plus(new Evaluation(1, 3))
        .plus(new Evaluation(2, 3))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expectedEvaluation)
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
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expectedEvaluation =
      new Evaluation(1, 3)
        .plus(new Evaluation(1, 4))
        .plus(new Evaluation(1, 3))
        .plus(new Evaluation(1, 4))
        .plus(new Evaluation(1, 5))
        .plus(new Evaluation(1, 5))
        .plus(new Evaluation(1, 6))
        .plus(new Evaluation(1, 5))
        .plus(new Evaluation(3, 3))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expectedEvaluation)
  })

  it('calculates named function entropy', () => {
    const code = 'function one() { return 1; }'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expectedEvaluation = new Evaluation(1, 2)
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expectedEvaluation)
  })
})

describe('Variable declaration entropy', () => {
  it('calculates property entropy from accessed properties', () => {
    const code = 'const a = {x: 3, y: 0}; const tmp = a.x;'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected =  new Evaluation(1, 4).times(2).plus(new Evaluation(1, 2).times(2))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates property entropy for member of member access', () => {
    const code = 'const tmp = a.x.y;'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected =  new Evaluation(1, 1)
      .plus(new Evaluation(1, 1))
      .plus(new Evaluation(1, 2))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of declaration with two initialization', () => {
    const code = 'const a = 0, b = a'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected =  new Evaluation(1, 3).plus(new Evaluation(1, 2))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of class definition and instantiation', () => {
    const code = 'class Example {}; const a = new Example();'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected =  new Evaluation(1, 2)
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of class definition with a method', () => {
    const code = 'class Example { sayHello(name) { return "Hello " + name } }'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected =  new Evaluation(1, 3).plus(new Evaluation(1, 2))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of class definition with two methods', () => {
    const code = 'class Example { sayHello(name) { return "Hello " + name } identity(x) { return x; } }'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected =  new Evaluation(1, 3)
      .plus(new Evaluation(1, 2))
      .plus(new Evaluation(1, 2))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of class instantiation with an object', () => {
    const code = 'class User {}; const a = new User({ name: "Joe" });'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected =  new Evaluation(1, 2).plus(new Evaluation(1, 4))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of class instantiation with an object with two attributes', () => {
    const code = 'class User {}; const a = new User({ name: "Joe", lastName: "James" });'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected =  new Evaluation(1, 2).plus(new Evaluation(1, 5)).plus(new Evaluation(1, 5))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })
})

describe('Class definition entropy', () => {
  it('calculates entropy of class definition with one property and one method', () => {
    const code = `class A {
      // Skip if auditResults is missing a particular audit result
      meta = {s: 1};

      /**
       * Comment
       */
      start(passContext) { }
    }
    `
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected =  new Evaluation(1, 5)
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of class definition, instanciation, and usage', () => {
    const code = `class A {
      constructor(argument) {
        this.a = argument;
      }

      read() {}

      write() {}
    }
    const instance = new A(12)
    instance.write()
    `
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected =  new Evaluation(1, 2)
      .plus(new Evaluation(1, 3))
      .plus(new Evaluation(1, 2))
      .plus(new Evaluation(1, 2))
      .plus(new Evaluation(1, 3))
      .plus(new Evaluation(1, 2))
      .plus(new Evaluation(1, 3))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of class extension', () => {
    const code = 'class A extends B {}'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected =  new Evaluation(1, 1)
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy class extension of defined class', () => {
    const code = 'class C {}; class B {}; class A extends B {}'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected =  new Evaluation(1, 2)
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })
})

describe('Update expression entropy', () => {
  it('calculates "++" entropy', () => {
    const code = 'i++'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected =  new Evaluation(2, 1)
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates "--" entropy', () => {
    const code = 'i--'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected =  new Evaluation(2, 1)
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })
})

describe('Assignment entropy', () => {
  it('calculates inline assignment entropy', () => {
    const code = 'let a = 0; a = 2'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected =  new Evaluation(1, 2)
      .plus(new Evaluation(1, 1))
      .plus(new Evaluation(1, 2))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })
})

describe('Loop entropy', () => {
  it('calculates entropy of empty for-loop', () => {
    const code = 'for (let i = 0; i < 10; i++) { }'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 2)
      .plus(new Evaluation(1, 1))
      .plus(new Evaluation(1, 2))
      .plus(new Evaluation(2, 2))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of for-loop with two variables and a body', () => {
    const code = 'for (let i = 0, j = 10; i < 10; i++, j--) { if (i == j) { break; } }'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 3)
      .times(2)
      .plus(new Evaluation(1, 2))
      .plus(new Evaluation(1, 3))
      .plus(new Evaluation(2, 3).times(2))
      .plus(new Evaluation(1, 2).times(2))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('encloses loop init variables inside the loop scope', () => {
    const code = 'for (let i = 0; i < 10; i++) { } const a = 2; const c = a + 19;'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 2)
      .plus(new Evaluation(1, 1))
      .plus(new Evaluation(1, 2))
      .plus(new Evaluation(2, 2))
      .plus(new Evaluation(1, 2))
      .plus(new Evaluation(1, 2))
      .plus(new Evaluation(1, 3))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of while-loop', () => {
    const code = 'let a; while (a < 10) {}'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 1).plus(new Evaluation(1, 2))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of do-while-loop', () => {
    const code = 'let a; do { } while (a < 10)'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 1).plus(new Evaluation(1, 2))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of for-each iterator', () => {
    const code = 'let a; a.forEach(each => each)'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 1)
      .plus(new Evaluation(1, 1))
      .plus(new Evaluation(1, 2))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of for-in loop', () => {
    const code = 'let obj; for (let key in obj) { obj; }'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 2).times(2)
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of for-of loop', () => {
    const code = 'let obj; for (let key of obj) {}'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 2)
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('ignores `continue;` inside a loop', () => {
    const code = 'let obj; for (let key in obj) { continue; }'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 2)
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })
})

describe('Unitary operator entropy', () => {
  it('calculates entropy of `++` expression', () => {
    const code = 'let i; i++'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(2, 2)
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of `--` expression', () => {
    const code = 'let i; (i--)'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(2, 2)
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })
})

describe('Array entropy', () => {
  it('of empty array is null', () => {
    const code = '[]'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new NullEvaluation()
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates used varibales from scope', () => {
    const code = 'let a, b, c; [a, b]'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 3).times(2)
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates singleton strings array', () => {
    const code = 'let a; ["e"]'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 2)
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates array of strings and variables', () => {
    const code = 'let a; ["e", 9, a]'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 2).times(2).plus(new Evaluation(1, 1))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('adds entropy of function element', () => {
    const code = '["e", (a) => a]'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 1).times(2)
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of spreading operator', () => {
    const code = 'let x; [0, ...x]'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 2).plus(new Evaluation(1, 1))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of spreading operator on a literal array', () => {
    const code = '[2, ...[3, 5]]'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 1)
      .plus(new Evaluation(1, 1))
      .plus(new Evaluation(1, 1))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of array element assignment', () => {
    const code = 'let a; a[4] = 5'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 1)
      .plus(new Evaluation(1, 2).times(2))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of a dynamic array element assignment', () => {
    const code = 'let a, c = 2, b = 4; a[b] = 3'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 4)
      .times(2)
      .plus(new Evaluation(1, 3))
      .plus(new Evaluation(1, 3))
      .plus(new Evaluation(1, 4))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of "in" operator expression', () => {
    const code = 'let a; "t" in a.b;'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 2)
      .plus(new Evaluation(1, 1))
      .plus(new Evaluation(1, 1))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of deep access return', () => {
    const code = 'function f() { return metricsAudit.details.items[0] }'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 1)
      .plus(new Evaluation(1, 1))
      .plus(new Evaluation(1, 2))
      .plus(new Evaluation(1, 2))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })
})

describe('Switch case entropy', () => {
  it('calcuates entorpy of simple case/switch statement', () => {
    const code = 'let a; switch (a) { case 2: a + 1; break; default: a + 3; }'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 1)
      .plus(new Evaluation(1, 2))
      .plus(new Evaluation(1, 1))
      .plus(new Evaluation(1, 2))
      .plus(new Evaluation(1, 1))
      .plus(new Evaluation(1, 2))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)

  })
})

describe('Bit-shifting operator entropy', () => {
  it('calcuates entorpy of "&"', () => {
    const code = 'let a, b; a & 2;'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 2).plus(new Evaluation(1, 3))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })
  it('calcuates entorpy of "|"', () => {
    const code = 'let a, b; a | 2;'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 2).plus(new Evaluation(1, 3))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })
  it('calcuates entorpy of "~"', () => {
    const code = 'let a, b; ~a;'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 2)
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })
  it('calcuates entorpy of "<<"', () => {
    const code = 'let a, b; a << 2;'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 2).plus(new Evaluation(1, 3))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })
  it('calcuates entorpy of "^"', () => {
    const code = 'let a, b; a ^ 2;'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 2).plus(new Evaluation(1, 3))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })
})

describe('Divisor identifiers', () => {
  it('counts default import', () => {
    const code = 'import a from "./a"; let b; a + b;'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 1).plus(new Evaluation(1, 2).times(2))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('counts named imports', () => {
    const code = 'import {a, c} from "./a"; let b; a + b;'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(2, 2).plus(new Evaluation(1, 3).times(2))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('counts named imports with "as"', () => {
    const code = 'import { origin as a, sc as b } from "./a"; let c; a + b;'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(2, 2).plus(new Evaluation(1, 3).times(2))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })

  it('counts wildcard import with "as"', () => {
    const code = 'import * as a from "./a"; let b; a + b;'
    const entropy = new BodyEntropy(Reflexion.parse(code, (ast) => ast.body))

    const expected = new Evaluation(1, 1).plus(new Evaluation(1, 2).times(2))
    expect(entropy.evaluate().evaluate()).toEvaluateTo(expected)
  })
})
