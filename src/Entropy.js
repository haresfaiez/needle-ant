import { AntTrail } from './AntTrail.js'
import { Evaluation } from './Evalution.js'

export class Entropy {
  constructor(dividend, divisor) {
    this.dividend = dividend
    this.divisor = divisor
  }

  calculate() {
    return this.evaluate().calculate()
  }

  evaluate() {
    throw new Error('Non implemented yet')
  }

  minus(other) {
    return this.calculate() - other.calculate()
  }
}

export class JointEntropy extends Entropy {
  calculate() {
    return this.dividend.sources
      .map(eachSource => new ExpressionEntropy(AntTrail.from(eachSource), this.divisor))
      .map(e => e.calculate())
      .reduce((a, b) => a + b, 0)
  }
}
  
export class DependencyEntropy extends Entropy {
  evaluate() {
    const actualCount = this.dividend.steps().length
    const allPossibilitiesCount = this.divisor.odds().length
    return new Evaluation(actualCount, allPossibilitiesCount)
  }
}
  
export class DeclarationEntropy extends Entropy {
  kindProbability() {
    if (this.dividend.sources[0].body?.[0].kind === 'let')
      return 2/6
  
    if (this.dividend.sources[0].body?.[0].kind === 'var')
      return 1/6
  
    if (this.dividend.sources[0].body?.[0].kind === 'const')
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
  evaluate() {
    const actualCount = this.dividend.identifiers().length > 0 ? this.dividend.steps().length : 0
    const allPossibilitiesCount = this.divisor.length
    const localPossibilities = this.dividend.identifiers().length + this.dividend.literalsWeight()
    return new Evaluation(actualCount, allPossibilitiesCount)
      .withLocalPossibilities(localPossibilities)
  }
}
