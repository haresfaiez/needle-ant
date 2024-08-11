import { CodeBag } from './CodeBag.js'
import { Reflexion } from './Reflexion.js'

export class Divisor {
  constructor(rawDivisor = new CodeBag(), accesses = new CodeBag()) {
    this._identifiers = new CodeBag()

    // TODO: Simplify this
    const isReflexion = rawDivisor.api
    if (isReflexion) {
      // TODO: Put the right coordinates
      this._identifiers = this._identifiers.plus(CodeBag.withNullCoordinates(rawDivisor.api()))
    } else {
      this._identifiers = this._identifiers.plus(rawDivisor)
    }

    this.importedModules = rawDivisor.importedModuleExports
    this.otherModules = rawDivisor.otherModules

    this.accesses = accesses
  }

  static clone(aDivisor, newIdentifiers = new CodeBag()) {
    const result = new Divisor()
    result.accesses = aDivisor.accesses
    result.extend(aDivisor.identifiers())
    result.extend(newIdentifiers)
    return result
  }

  static fromAccesses(aDivisor) {
    return new Divisor(aDivisor.accesses)
  }

  shouldFocusOnCurrentModule() {
    return true
  }

  extend(newIdentifiers) {
    this._identifiers = this._identifiers.plus(newIdentifiers)
  }

  extendAccesses(newAccesses) {
    this.accesses = this.accesses.plus(newAccesses)
  }

  identifiers() {
    return this._identifiers
  }

  importedModulesNames() {
    return []
  }

  adjacentModules() {
    return []
  }

  shouldCheckAdjacentModules() {
    return false
  }

  static parse(sourceCode, transformer) {
    const ast = Reflexion.parse(sourceCode, transformer)
    ast.keepBag = true
    return new Divisor(ast.identifiers())
  }
}

export class MultiModulesDivisor extends Divisor {
  shouldFocusOnCurrentModule() {
    return false
  }

  importedModulesNames() {
    return this.importedModules
  }

  adjacentModules() {
    return this.otherModules
  }

  shouldCheckAdjacentModules() {
    return true
  }
}
