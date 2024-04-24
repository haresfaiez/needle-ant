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
    this.dividend = [...this.dividend, anEntropy]
    return this
  }

  _evaluate(createEvaluation) {
    return this.dividend.reduce(
      (acc, eachEntropy) =>{
        eachEntropy.delegate?.divisor.extend(this.divisor.identifiers())
        return acc.plus(eachEntropy.evaluate(createEvaluation))
      },
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

  createDelegate(_dividend, divisor) {
    const dividend = _dividend?.sources?.[0]
    const dividendType = dividend?.type

    if (dividendType === 'ImportDeclaration') {
      return new DependencyEntropy(new Reflexion(dividend), divisor)
    }

    if (dividendType === 'VariableDeclaration') {
      // TODO: why are we ignoring "const"/"let"/"var"/...?
      return new DeclarationEntropy(new DeclarationReflexion(dividend.declarations), divisor)
    }

    const callee = dividend?.expression?.callee
    if (callee?.type === 'MemberExpression') {
      return new SumEntropy([
        new SingleEntropy(new Reflexion(callee.object), divisor),
        new SingleEntropy(new Reflexion(callee.property), divisor.unfold(callee.object.name)),
        new JointEntropy(new Reflexion(dividend?.expression?.arguments), divisor)
      ])
    }

    // TODO: generalize this to all functions
    if (dividend.type === 'ArrowFunctionExpression') {
      return new JointEntropy(new Reflexion(dividend.body), divisor)
    }

    // TODO: generalize this to all functions
    if (dividendType === 'VariableDeclarator') {
      return new ExpressionEntropy(new Reflexion(dividend), divisor)
    }

    const expressionTypes = [
      'BinaryExpression',
      'CallExpression',
      'ExpressionStatement',
      'Identifier',
      'ImportNamespaceSpecifier',
      'ImportSpecifier',
      'Literal',
      'ReturnStatement',
    ]
    // TODO: should we handle function definition as DeclarationEntropy
    // TODO: Test declaration with many inits
    if (expressionTypes.includes(dividendType)) {
      return new ExpressionEntropy(new Reflexion(dividend), divisor)
    }

    if (dividendType === 'BlockStatement') {
      return new JointEntropy(new Reflexion(dividend.body), divisor)
    }

    throw new Error(`Cannot create Delegate for dividend: ${JSON.stringify(_dividend)}`)
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
        this.divisor.identifiers().length,
        this.divisor.identifiers().length,
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
    // TODO: Remove this check
    const isImport = this.dividend.sources[0].type.includes('mport')
    const literalsWeight = !isImport && this.dividend.literals().length ? 1 : 0
    const allPossibilitiesCount = this.divisor.identifiers().length + literalsWeight
    const actualCount = this.dividend.identifiers().length + literalsWeight

    return createEvaluation(actualCount, allPossibilitiesCount, this.dividend.sources[0])
  }
}

class DeclarationEntropy extends Entropy {
  _evaluate(createEvaluation) {
    const declaration = this.dividend.sources[0]

    this.divisor._identifiers.add(declaration.id.name)

    const params = new Reflexion(declaration.init.params || []).identifiers()

    const declarationDivisor = new Divisor([])
    declarationDivisor.extend(this.divisor.identifiers())
    declarationDivisor.extend(params)

    const delegateEntropy = new SingleEntropy(new Reflexion(declaration.init), declarationDivisor)
    return delegateEntropy._evaluate(createEvaluation)
  }
}
