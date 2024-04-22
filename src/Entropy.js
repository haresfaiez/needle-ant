import { Reflexion, DependenciesReflexion, DeclarationReflexion } from './Reflexion.js'
import { Evaluation, NullEvaluation } from './Evalution.js'
import { Divisor } from './Divisor.js'

// TODO: Check subclasses, do not ignore divisor
class Entropy {
  constructor(dividend, rawDivisor) {
    this.dividend = dividend
    this.divisor = rawDivisor || new Divisor([])
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

// TODO: Merge SumEntropy and JointEntropy
class SumEntropy extends Entropy {
  constructor(dividend, divisor) {
    super(dividend, divisor)
  }

  plus(anEntropy) {
    anEntropy.delegate.divisor = new Divisor(this.divisor.identifiers())
    this.dividend = [...this.dividend, anEntropy]

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
      .reduce((sumEntropy, eachSource) => {
        const eachEntropy = new SingleEntropy(new Reflexion(eachSource), this.divisor)
        return sumEntropy.plus(eachEntropy)
      }, new SumEntropy([], this.divisor))
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

  createDelegate(dividend, divisor) {
    const dividendType = dividend.sources?.[0]?.type

    if (dividendType === 'ImportDeclaration') {
      return new DependencyEntropy(dividend, divisor)
    }

    if (dividendType === 'VariableDeclaration') {
      // TODO: why are we ignoring "const"/"let"/"var"/...?
      const declaration = dividend.sources[0]
      // TODO: Copy divisor (think about adjacent functions)
      divisor.addIdentifiers(new Reflexion(declaration).identifiers())
      const declarationReflexion = new DeclarationReflexion(declaration.declarations)
      return new DeclarationEntropy(declarationReflexion, divisor)
    }

    const callee = dividend.sources?.[0]?.expression?.callee
    if (callee?.type === 'MemberExpression') {
      return new SumEntropy([
        new SingleEntropy(new Reflexion(callee.object), divisor),
        new SingleEntropy(new Reflexion(callee.property), divisor.unfold(callee.object.name)),
        new JointEntropy(new Reflexion(dividend.sources?.[0]?.expression?.arguments), divisor)
      ])
    }

    // TODO: generalize this to all functions
    if (dividendType === 'VariableDeclarator' && dividend.sources[0].init.type === 'ArrowFunctionExpression') {
      return new JointEntropy(new Reflexion(dividend.sources[0].init.body), divisor)
    }

    const expressionTypes = [
      'ArrowFunctionExpression',
      'BinaryExpression',
      'CallExpression',
      'ExpressionStatement',
      'Identifier',
      'ImportNamespaceSpecifier',
      'ImportSpecifier',
      'Literal',
      'ReturnStatement',
      'VariableDeclarator'
    ]
    // TODO: should we handle function definition as DeclarationEntropy
    // TODO: Test declaration with many inits
    if (expressionTypes.includes(dividendType)) {
      return new ExpressionEntropy(dividend, divisor)
    }

    throw new Error(`Cannot create Delegate for dividend: ${JSON.stringify(dividend)}`)
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
      return createEvaluation(
        this.divisor.identifiersCount(),
        this.divisor.identifiersCount(),
        this.dividend.sources[0]
      )
    }

    if (this.divisor.shouldFocusOnCurrentModule()) {
      return new ExpressionEntropy(this.dividend, new Divisor(this.divisor.identifiers())).evaluate(createEvaluation)
    }

    throw ('DepencyEntropy#_evaluate does not handle this case yet')
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

class DeclarationEntropy extends Entropy {
  _evaluate(createEvaluation) {
    const declaration = this.dividend.sources[0]
    const declarationReflexion = new Reflexion(declaration)
    return new SingleEntropy(declarationReflexion, this.divisor)._evaluate(createEvaluation)
  }
}
