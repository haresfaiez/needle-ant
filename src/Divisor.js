import { Reflexion } from './Reflexion.js'

export class Divisor {
  constructor(rawDivisor = [], accesses = new Set()) {
    this._identifiers = new Set()

    const isReflexion = rawDivisor.api
    if (isReflexion) {
      rawDivisor.api().forEach(e => this._identifiers.add(e))
    } else {
      rawDivisor.forEach(e => this._identifiers.add(e))
    }

    this.importedModules = rawDivisor.importedModuleExports
    this.otherModules = rawDivisor.otherModules

    this.accesses = accesses
  }

  static clone(aDivisor, newIdentifiers = []) {
    const result = new Divisor([])
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
    newIdentifiers.forEach(eachDivisor => this._identifiers.add(eachDivisor))
  }

  extendAccesses(newAccesses) {
    newAccesses.forEach(eachAccess => this.accesses.add(eachAccess))
  }

  identifiers() {
    return Array.from(this._identifiers)
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
