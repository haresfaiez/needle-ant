export class Divisor {
  constructor(rawDivisor) {
    this._divisor = rawDivisor?.dividend ? rawDivisor.divisor._divisor : rawDivisor
    const source = this._divisor?.odds ? this._divisor.odds() : this._divisor


    this._identifiers = new Set()
    if (Array.isArray(this._divisor)) {
      this._divisor.forEach(e => this._identifiers.add(e))
    }
    (source || []).forEach(e => this._identifiers.add(e))


    this.importedModules = this._divisor?.importedModuleExports
    this.otherModules = this._divisor?.otherModules
  }

  shouldFocusOnCurrentModule() {
    return Array.isArray(this._divisor)
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
    return this.importedModules
  }

  // TODO: Rename this
  adjacentModules() {
    return this.otherModules
  }

  shouldCheckAdjacentModules() {
    return !!this.otherModules
  }
}