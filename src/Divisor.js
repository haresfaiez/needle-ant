import { Reflexion } from './Reflexion.js'

export class Divisor {
  constructor(rawDivisor, foldingMap) {
    this._identifiers = new Set()

    const isReflexion = rawDivisor.odds
    if (isReflexion) {
      rawDivisor.odds().forEach(e => this._identifiers.add(e))
    } else {
      rawDivisor.forEach(e => this._identifiers.add(e))
    }

    this.importedModules = rawDivisor.importedModuleExports
    this.otherModules = rawDivisor.otherModules

    this.accesses = new Set()
    this.foldingMap = foldingMap || new Map()
  }

  unfold(callee) {
    // TODO: remove '|| ...'
    return new Divisor(this.foldingMap.get(callee) || [callee])
  }

  shouldFocusOnCurrentModule() {
    return true
  }

  extend(newIdentifiers) {
    newIdentifiers.forEach(eachDivisor => this._identifiers.add(eachDivisor))
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
    const map = new Map()
    ast
      .identifiers()
      .forEach(eachIdentifier => {
        map.set(eachIdentifier, ast.properties(eachIdentifier))
      })
    return new Divisor(ast.identifiers(), map)
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
