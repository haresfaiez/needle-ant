import { Reflexion, DependenciesReflexion } from './Reflexion.js'
import { Evaluation, NullEvaluation } from './Evalution.js'

// TODO: Merge all in one class
export class Entropy {
  constructor(dividend, _divisor) {
    this.dividend = dividend
    // TODO: Simplify this
    this._divisor = _divisor?.divisor ? _divisor.divisor() : _divisor
  }

  plus() {
    throw new Error('`Entropy#plus` not implemented yet in `Entropy`!')
  }

  divisor() {
    return this._divisor
  }

  calculate() {
    return this.evaluate().calculate()
  }

  evaluate() {
    throw new Error('`Entropy#evaluate` not implemented yet in `Entropy`!')
  }

  minus(other) {
    return this.calculate() - other.calculate()
  }
}

class SumEntropy extends Entropy {
  constructor(dividend, _divisor) {
    super(dividend, _divisor)
    this._divisor = new Set()
  }

  divisor() {
    return Array.from(this._divisor)
  }

  plus(anEntropy) {
    anEntropy.divisor().forEach(eachDivisor => this._divisor.add(eachDivisor))

    this.dividend = [...this.dividend, new ExpressionEntropy(anEntropy.dividend, this.divisor())]

    if (anEntropy.dividend.sources?.[0]?.type === 'VariableDeclaration') {
      anEntropy
        .dividend
        .sources?.[0]?.declarations
        .map(eachDeclaration => eachDeclaration.id.name)
        .forEach(eachId => this._divisor.add(eachId))
    }

    return this
  }

  evaluate() {
    return this.dividend.reduce(
      (acc, eachEntropy) => acc.plus(eachEntropy.evaluate()),
      new NullEvaluation()
    )
  }
}

export class JointEntropy extends Entropy {
  evaluate() {
    return this.dividend.sources
      .map(eachSource => new ExpressionEntropy(new Reflexion(eachSource), this))
      .reduce((acc, eachEntropy) => acc.plus(eachEntropy), new SumEntropy([], []))
      .evaluate()
  }
}
  
export class DependencyEntropy extends Entropy {
  evaluate() {
    // TODO: fix next line
    const importParts = new DependenciesReflexion(this.dividend.sources[0]).__factorize()
    const importSpecifiers = importParts[0]
    const importSource = importParts[1]
    // TODO: Remove this check
    if (this.divisor().otherModules) {
      return new ExpressionEntropy(new Reflexion(importSpecifiers), new JointEntropy([], this.divisor().importedModuleExports)).evaluate()
        .plus(new ExpressionEntropy(new Reflexion(importSource), new JointEntropy([], this.divisor().otherModules)).evaluate())
    }

    const actualCount = this.dividend.odds().length
    const allPossibilitiesCount = this.divisor().odds().length
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
    // TODO: simplify this method
    const actualCount = this.dividend.sources?.[0]?.type === 'ImportNamespaceSpecifier' ? 3 : (this.dividend.identifiers().length > 0 ? this.dividend.odds().length : 0)
    // TODO: Do this the proper way
    const allPossibilitiesCount = this.divisor().length
    const localPossibilities = this.dividend.identifiers().length + (this.dividend.literals().length ? 1 : 0)
    return new Evaluation(actualCount || localPossibilities, allPossibilitiesCount)
  }
}
