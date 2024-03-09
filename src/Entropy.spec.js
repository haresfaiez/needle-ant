import { AntTrail } from './AntTrail.js'
import { ExpressionEntropy } from './Entropy.js'
import { Evaluation } from './Evalution.js'

describe('Import statement entropy', () => {
  it('calculates entropy of import specfiers', () => {
    const code = 'import { a } from "./a"'
    const specifiers = AntTrail.parse(code, (ast) => ast.body[0].specifiers)

    const entropy = new ExpressionEntropy(specifiers, [ 'a', 'b' ])

    expect(entropy.evaluate()).toEqual(new Evaluation(1, 2).withLocalPossibilities(1))
  })

  it('calculates entropy of two import specfiers', () => {
    const code = 'import { a, b } from "./a"'
    const specifiers = AntTrail.parse(code, (ast) => ast.body[0].specifiers)

    const entropy = new ExpressionEntropy(specifiers, [ 'a', 'b', 'c' ])

    expect(entropy.evaluate()).toEqual(new Evaluation(2, 3).withLocalPossibilities(2))
  })

  it('calculates entropy of wildcard import specfier', () => {
    const code = 'import * as A from "./a"'
    const specifiers = AntTrail.parse(code, (ast) => ast.body[0].specifiers)

    const entropy = new ExpressionEntropy(specifiers, [ 'a', 'b', 'c' ])

    expect(entropy.evaluate()).toEqual(new Evaluation(3, 3))
  })

  it('calculates entropy of import source', () => {
    const code = 'import { a } from "./a"'
    const source = AntTrail.parse(code, (ast) => ast.body[0].source)

    const entropy = new ExpressionEntropy(source, [ './a', './b', './c' ])

    expect(entropy.evaluate()).toEqual(new Evaluation(0, 3).withLocalPossibilities(1))
  })
})