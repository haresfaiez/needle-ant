import { Reflexion, DependenciesReflexion } from './Reflexion.js'
import { Evaluation, NullEvaluation } from './Evalution.js'
import { Divisor } from './Divisor.js'

class Entropy {
  constructor(dividend, rawDivisor) {
    this.dividend = dividend
    this.__divisor = new Divisor(rawDivisor)
  }

  definitions() {
    return this.dividend.definitions()
  }

  plus() {
    throw new Error('`Entropy#plus` not implemented yet in `Entropy`!')
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
  constructor(dividend) {
    super(dividend)
  }

  definitions() {
    // TODO: Implement this
    return []
  }

  plus(anEntropy) {
    this.__divisor.merge(anEntropy)

    anEntropy.delegate.__divisor = new Divisor(this.__divisor.identifiers())
    this.dividend = [...this.dividend, anEntropy]
    this.__divisor.addDefinitions(anEntropy)
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
  constructor(dividend, aDivisor) {
    super()
    this.delegate = this.createDelegate(dividend, aDivisor)
  }

  evaluate() {
    return this.delegate.evaluate()
  }

  definitions() {
    return this.delegate.definitions()
  }

  createDelegate(dividend, aDivisor) {
    const dividendType = dividend.sources?.[0]?.type

    if (dividendType === 'ImportDeclaration') {
      return new DependencyEntropy(dividend, aDivisor)
    }

    if (dividendType === 'VariableDeclaration') {
      return new DeclarationEntropy(dividend, aDivisor)
    }

    const callee = dividend.sources?.[0]?.expression?.callee
    if (callee?.type === 'MemberExpression') {
      return new SumEntropy([
        new SingleEntropy(new Reflexion(callee.object), aDivisor),
        new SingleEntropy(new Reflexion(callee.property), [callee.property.name]),
        new JointEntropy(new Reflexion(dividend.sources?.[0]?.expression?.arguments), aDivisor)
      ])
    }

    // TODO: Add ifs and throw Error by default
    return new ExpressionEntropy(dividend, aDivisor)
  }
}

class DependencyEntropy extends Entropy {
  // TODO: improve this
  evaluate() {
    if (this.__divisor.shouldCheckAdjacentModules()) {
      // TODO: fix next line
      const importParts = new DependenciesReflexion(this.dividend.sources[0]).__factorize()
      const importSpecifiers = importParts[0]
      const importSource = importParts[1]

      return new SingleEntropy(new Reflexion(importSpecifiers), new JointEntropy([], this.__divisor.importedModulesNames())).evaluate()
        .plus(new SingleEntropy(new Reflexion(importSource), new JointEntropy([], this.__divisor.adjacentModules())).evaluate())
    }

    const isWildcardImport = (this.dividend.sources?.[0]?.type === 'ImportDeclaration')
      && (this.dividend.sources?.[0]?.specifiers?.[0]?.type === 'ImportNamespaceSpecifier')

    if (this.__divisor.shouldFocusOnCurrentModule() && isWildcardImport) {
      return new Evaluation(this.__divisor.identifiersCount(), this.__divisor.identifiersCount())
    }

    if (this.__divisor.shouldFocusOnCurrentModule()) {
      return new ExpressionEntropy(this.dividend, this.__divisor._divisor).evaluate()
    }

    // TODO: Use ExpressionEntropy
    const actualCount = this.dividend.odds().length
    const allPossibilitiesCount = this.__divisor.identifiersCount()
    return new Evaluation(actualCount, allPossibilitiesCount)
  }
}

class ExpressionEntropy extends Entropy {
  evaluate() {
    const allPossibilitiesCount = this.__divisor.identifiersCount()

    const literalsWeight = this.dividend.literals().length ? 1 : 0
    const actualCount = this.dividend.identifiers().length > 0
      ? this.dividend.odds().length
      : (this.dividend.identifiers().length + literalsWeight)

    return new Evaluation(actualCount, allPossibilitiesCount)
  }
}

class DeclarationEntropy extends ExpressionEntropy {
}
