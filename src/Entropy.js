import { Reflexion, DependenciesReflexion } from './Reflexion.js'
import { Evaluation, NullEvaluation } from './Evalution.js'

class Entropy {
  constructor(dividend, _divisor) {
    this.dividend = dividend
    // TODO: Simplify this
    this._divisor = _divisor?.divisor ? _divisor.divisor() : _divisor
  }

  definitions() {
    return this.dividend.definitions()
  }

  plus() {
    throw new Error('`Entropy#plus` not implemented yet in `Entropy`!')
  }

  setDivisor(newDivisor) {
    this._divisor = newDivisor
  }

  // TODO: Make this returns always an array
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
    anEntropy.setDivisor(this.divisor())
    this.dividend = [...this.dividend, anEntropy]
    anEntropy.definitions().forEach(eachId => this._divisor.add(eachId))
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
      .map(eachSource => new SingleEntropy(new Reflexion(eachSource), this))
      .reduce((acc, eachEntropy) => acc.plus(eachEntropy), new SumEntropy([], []))
      .evaluate()
  }
}

export class SingleEntropy extends Entropy {
  constructor(dividend, _divisor) {
    super()
    this.delegate = this.createDelegate(dividend, _divisor)
  }

  setDivisor(newDivisor) {
    this.delegate.setDivisor(newDivisor)
  }

  divisor() {
    return this.delegate.divisor()
  }

  evaluate() {
    return this.delegate.evaluate()
  }

  definitions() {
    return this.delegate.definitions()
  }

  createDelegate(dividend, _divisor) {
    // dividend/ BinaryExpression
    // dividend/ ExpressionStatement
    // dividend/ ImportDeclaration
    // dividend/ Literal
    // dividend/ ReturnStatement
    // dividend/ VariableDeclaration

    const dividendType = dividend.sources?.[0]?.type

    if (dividendType === 'ImportDeclaration') {
      // console.log('dividend/', dividend.sources?.[0]?.type)
      // return new DependencyEntropy(dividend, _divisor)
    }

    if (dividendType === 'VariableDeclaration') {
      return new DeclarationEntropy(dividend, _divisor)
    }

    return new ExpressionEntropy(dividend, _divisor)
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
      return new SingleEntropy(new Reflexion(importSpecifiers), new JointEntropy([], this.divisor().importedModuleExports)).evaluate()
        .plus(new SingleEntropy(new Reflexion(importSource), new JointEntropy([], this.divisor().otherModules)).evaluate())
    }

    const actualCount = this.dividend.odds().length
    const allPossibilitiesCount = this.divisor().odds().length
    return new Evaluation(actualCount, allPossibilitiesCount)
  }
}

class ExpressionEntropy extends Entropy {
  evaluate() {
    const isWildcardImport = (this.dividend.sources?.[0]?.type === 'ImportDeclaration')
      && (this.dividend.sources?.[0]?.specifiers?.[0]?.type === 'ImportNamespaceSpecifier')

    // TODO: Move this to DependencyEntropy...
    if (isWildcardImport) {
      return new Evaluation(this.divisor().length, this.divisor().length)
    }

    const allPossibilitiesCount = this.divisor().length

    const literalsWeight = this.dividend.literals().length ? 1 : 0
    const actualCount = this.dividend.identifiers().length > 0
      ? this.dividend.odds().length
      : (this.dividend.identifiers().length + literalsWeight)

    return new Evaluation(actualCount, allPossibilitiesCount)
  }
}

class DeclarationEntropy extends ExpressionEntropy {
}
