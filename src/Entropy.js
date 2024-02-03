export class Entropy {
  constructor(ast, scope) {
    this.subject = ast
    this.scope = scope
  }

  calculate() {
    throw new Error('Non implemented yet')
  }

  minus(dependency) {
    return this.calculate() - dependency.calculate()
  }

  permutation(n, k) {
    if (n < 0 || k < 0)
      throw new RangeError(`${n < 0 ? n : k} is out of range`)

    if (0 == k)
      return 1

    if (n < k)
      return 0

    let [bn, bk, bp] = [n, k, 1]
    while (bk--)
      bp *= bn--

    return bp
  }

  combination(n, k) {
    if ((0 == k) || (n == k))
      return 1

    if (n < k)
      return 0

    return this.permutation(n, k) / this.permutation(k, k)
  }
}

export class JointEntropy extends Entropy {
  constructor(ast, scope) {
    super(ast, scope)
  }

  calculate() {
    return this.subject
      .entropies(this.scope)
      .map(e => e.calculate())
      .reduce((a, b) => a + b, 0)
  }
}
  
export class DependencyEntropy extends Entropy {
  calculate() {
    const numberOfFiles = 2
    const possibleFiles = 2
    const fileProbabilty = 1/numberOfFiles
    return fileProbabilty * possibleFiles * Math.log2(numberOfFiles)
  }
}
  
export class DeclarationEntropy extends Entropy {
  kindProbability() {
    if (this.subject.sources[0].body?.[0].kind === 'let')
      return 2/6
  
    if (this.subject.sources[0].body?.[0].kind === 'var')
      return 1/6
  
    if (this.subject.sources[0].body?.[0].kind === 'const')
      return 3/6
  
    throw new Error('Unknown declaration kind')
  }
  
  calculate() {
    const numberOfKinds = 3 // let, const, var
    const possibleKinds = 3
    const kindProbability = this.kindProbability() * (1/numberOfKinds)
    return kindProbability * possibleKinds * Math.log2(numberOfKinds)
  }
}

export class ExpressionEntropy extends Entropy {
  constructor(ast, scope) {
    super(ast, scope)
  }

  calculate() {
    return this.probability() * Math.log2(this.probability()) * (-1)
  }

  probability() {
    return 1 / this.possibilitiesCount()
  }

  possibilitiesCount() {
    const primitiveAndGlobalsCount = 1
    let combinationsCount = 0
    if (this.subject.identifiers().length > 0) {
      combinationsCount = this.combination(
        this.scope.length + primitiveAndGlobalsCount,
        this.subject.steps(true).length
      )
    }

    return this.subject.identifiers().length + this.subject.literalsWeight() + combinationsCount
  }
}
