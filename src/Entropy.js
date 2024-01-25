class Entropy {
  constructor(expression) {
    this.expression = expression.body[0]
  }

  calculate() {
    throw new Error('Non implemented yet')
  }

  minus(dependency) {
    return this.calculate() - dependency.calculate()
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
    if (this.expression.kind === 'let')
      return 2/6
  
    if (this.expression.kind === 'var')
      return 1/6
  
    if (this.expression.kind === 'const')
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

export class ExpressionEntropy {
  constructor(elements, scope) {
    this.identifiers = elements.filter(eachElement => eachElement.type === 'Identifier')
    this.literalsWeight = elements.find(eachElement => eachElement.type === 'Literal') ? 1 : 0
    this.scope = scope
  }

  calculate() {
    return 1 / this.possibilities()
  }

  possibilities() {
    return this.identifiers.length
      + this.literalsWeight
      + this.combination(this.scope.length + this.literalsWeight, this.identifiers.length || 1)
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
