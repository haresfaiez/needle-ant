import { CodeBag } from '../code/CodeBag.js'
import { Reflexion } from './Reflexion.js'

// TODO: Rename this
export class Divisor {
  constructor(rawDivisor = new CodeBag(), accesses = new CodeBag(), clonedDivisorInstance) {
    this.cloned = clonedDivisorInstance

    this._identifiers = rawDivisor.clone()

    this.importedModules = rawDivisor.importedModuleExports
    this.otherModules = rawDivisor.otherModules

    this.accesses = accesses
  }

  static clone(aDivisor, newIdentifiers = new CodeBag()) {
    const result = new Divisor()
    result.accesses = aDivisor.accesses
    result.extend(aDivisor.identifiers())
    result.extend(newIdentifiers)
    result.cloned = aDivisor
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
    this.cloned?.extendAccesses(newAccesses)
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
