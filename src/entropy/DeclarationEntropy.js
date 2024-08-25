import { SingleEntropy } from './SingleEntropy.js'
import { BodyEntropy } from './BodyEntropy.js'
import { Entropy } from './Entropy.js'
import { Reflexion } from '../reflexion/Reflexion.js'
import { NullEvaluation } from '../evaluation/NullEvaluation.js'
import { Divisor } from '../reflexion/Divisor.js'
import { CodeBag } from '../code/CodeBag.js'

// TODO: Extract into a composition of classes (next. release)
export class DeclarationEntropy extends SingleEntropy  {

  // TODO: simplify this (next. release)
  evaluate() {
    const declarations = this.dividend.sources
    const declaration = declarations[0]

    const isVariable = declarations.length === 1 && declaration.type === 'VariableDeclarator'
    declarations
      .filter(eachDeclaration => eachDeclaration.id)
      .forEach(eachDeclaration => this.divisor.extend(CodeBag.fromAcronNodes([eachDeclaration.id])))

    const functionsTypes = [
      'ArrowFunctionExpression',
      'FunctionDeclaration'
    ]
    if (functionsTypes.includes(declaration.type)) {
      const paramsAsIdentifiers = Reflexion.fromAcornNodes(declaration.params).identifiers()
      const declarationDivisor = Divisor.clone(this.divisor, paramsAsIdentifiers)
      return new BodyEntropy(declaration.body, declarationDivisor).evaluate()
    }

    if (isVariable && !declaration.init) {
      return new NullEvaluation()
    }

    if (isVariable) {
      const value = declaration.init
      const paramsAsIdentifiers = Reflexion.fromAcornNodes(value.params).identifiers()
      const declarationDivisor = Divisor.clone(this.divisor, paramsAsIdentifiers)
      return new Entropy(value, declarationDivisor).evaluate()
    }

    declarations
      .filter(eachDeclaration => eachDeclaration.type === 'FunctionDeclaration')
      .forEach((eachDeclaration, i) => declarations[i] = eachDeclaration.body)

    const declarationsEvaluation = new BodyEntropy(declarations, this.divisor).evaluate()

    // TODO: Remove this?
    // // class A extends B
    // if (declaration.type === 'ClassDeclaration' && declaration.superClass) {
    //   this.divisor.extend([declaration.superClass.name])
    //   // TODO: Use CodeBag here
    //   return new BagEvaluation(CodeBag.withNullCoordinates([declaration.id.name]), this.divisor.identifiers()).plus(declarationsEvaluation)
    // }

    return declarationsEvaluation
  }
}