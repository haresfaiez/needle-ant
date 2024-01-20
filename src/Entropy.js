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
