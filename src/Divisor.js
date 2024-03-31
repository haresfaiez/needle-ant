export class Divisor {
  constructor(rawDivisor) {
    this._identifiers = new Set()

    const isReflexion = rawDivisor.odds
    if (isReflexion) {
      rawDivisor.odds().forEach(e => this._identifiers.add(e))
    } else {
      rawDivisor.forEach(e => this._identifiers.add(e))
    }

    this.importedModules = rawDivisor.importedModuleExports
    this.otherModules = rawDivisor.otherModules
  }

  shouldFocusOnCurrentModule() {
    return true
  }

  merge(anEntropy) {
    const otherDivisor = anEntropy.delegate.divisor
    otherDivisor.identifiers().forEach(eachDivisor => this._identifiers.add(eachDivisor))
  }

  addDefinitions(anEntropy) {
    anEntropy.definitions().forEach(eachId => this._identifiers.add(eachId))
  }

  identifiers() {
    return Array.from(this._identifiers)
  }

  identifiersCount() {
    return this.identifiers().length
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
