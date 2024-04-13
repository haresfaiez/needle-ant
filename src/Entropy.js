import { Reflexion, DependenciesReflexion } from './Reflexion.js'
import { Evaluation, NullEvaluation } from './Evalution.js'
import { Divisor } from './Divisor.js'

class Entropy {
  constructor(dividend, rawDivisor) {
    this.dividend = dividend
    this.divisor = rawDivisor || new Divisor([])
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

  _evaluate() {
    throw new Error('`Entropy#evaluate` not implemented yet in `Entropy`!')
  }

  evaluate(createEvaluation) {
    const evaluationFactory =
      (actual, possibilities) => new Evaluation(actual, possibilities)
    return this._evaluate(createEvaluation || evaluationFactory)
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
    this.divisor.merge(anEntropy)

    anEntropy.delegate.divisor = new Divisor(this.divisor.identifiers())
    this.dividend = [...this.dividend, anEntropy]
    this.divisor.addDefinitions(anEntropy)
    return this
  }

  _evaluate(createEvaluation) {
    return this.dividend.reduce(
      (acc, eachEntropy) => acc.plus(eachEntropy.evaluate(createEvaluation)),
      new NullEvaluation()
    )
  }
}

export class JointEntropy extends Entropy {
  _evaluate(createEvaluation) {
    return this.dividend.sources
      .map(eachSource => new SingleEntropy(new Reflexion(eachSource), this.divisor))
      .reduce((acc, eachEntropy) => acc.plus(eachEntropy), new SumEntropy([]))
      .evaluate(createEvaluation)
  }
}

export class SingleEntropy extends Entropy {
  constructor(dividend, divisor) {
    super()
    this.delegate = this.createDelegate(dividend, divisor)
  }

  _evaluate(createEvaluation) {
    return this.delegate.evaluate(createEvaluation)
  }

  definitions() {
    return this.delegate.definitions()
  }

  createDelegate(dividend, divisor) {
    const dividendType = dividend.sources?.[0]?.type

    if (dividendType === 'ImportDeclaration') {
      return new DependencyEntropy(dividend, divisor)
    }

    if (dividendType === 'VariableDeclaration') {
      return new DeclarationEntropy(dividend, divisor)
    }

    const callee = dividend.sources?.[0]?.expression?.callee
    if (callee?.type === 'MemberExpression') {
      return new SumEntropy([
        new SingleEntropy(new Reflexion(callee.object), divisor),
        new SingleEntropy(new Reflexion(callee.property), divisor.unfold(callee.object.name)),
        new JointEntropy(new Reflexion(dividend.sources?.[0]?.expression?.arguments), divisor)
      ])
    }

    // TODO: Add ifs and throw Error by default
    return new ExpressionEntropy(dividend, divisor)
  }
}

class DependencyEntropy extends Entropy {
  // TODO: improve this
  _evaluate(createEvaluation) {
    if (this.divisor.shouldCheckAdjacentModules()) {
      // TODO: fix next line
      const importParts = new DependenciesReflexion(this.dividend.sources[0]).__factorize()
      const importSpecifiers = importParts[0]
      const importSource = importParts[1]

      return new SingleEntropy(new Reflexion(importSpecifiers), new Divisor(this.divisor.importedModulesNames())).evaluate(createEvaluation)
        .plus(new SingleEntropy(new Reflexion(importSource), new Divisor(this.divisor.adjacentModules())).evaluate(createEvaluation))
    }

    const isWildcardImport = (this.dividend.sources?.[0]?.type === 'ImportDeclaration')
      && (this.dividend.sources?.[0]?.specifiers?.[0]?.type === 'ImportNamespaceSpecifier')

    if (isWildcardImport) {
      return createEvaluation(this.divisor.identifiersCount(), this.divisor.identifiersCount())
    }

    if (this.divisor.shouldFocusOnCurrentModule()) {
      return new ExpressionEntropy(this.dividend, new Divisor(this.divisor.identifiers())).evaluate(createEvaluation)
    }

    // TODO: Use ExpressionEntropy
    const actualCount = this.dividend.odds().length
    const allPossibilitiesCount = this.divisor.identifiersCount()
    return createEvaluation(actualCount, allPossibilitiesCount)
  }
}

class ExpressionEntropy extends Entropy {
  _evaluate(createEvaluation) {
    const allPossibilitiesCount = this.divisor.identifiersCount()

    const literalsWeight = this.dividend.literals().length ? 1 : 0
    const actualCount = this.dividend.identifiers().length > 0
      ? this.dividend.odds().length
      : (this.dividend.identifiers().length + literalsWeight)

    return createEvaluation(actualCount, allPossibilitiesCount, this.dividend.sources[0])
  }
}

class DeclarationEntropy extends ExpressionEntropy {
}
