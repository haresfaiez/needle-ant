export class Divisor {
  constructor(rawDivisor) {

    const _divisor = rawDivisor?.dividend ? rawDivisor.divisor._divisor : rawDivisor

    this._divisor = _divisor
    const source = this._divisor?.odds ? this._divisor.odds() : this._divisor
    const importedModules = this._divisor?.importedModuleExports
    const otherModules = this._divisor?.otherModules

    this.source = source
    this.importedModules = importedModules
    this.otherModules = otherModules

    this._identifiers = new Set()
    if (Array.isArray(_divisor)) {
      _divisor.forEach(e => this._identifiers.add(e))
    }
  }

  shouldFocusOnCurrentModule() {
    return Array.isArray(this._divisor)
  }

  shouldCheckAdjacentModules() {
    return !!this.otherModules
  }

  // TODO: Rename this
  adjacentModules() {
    return this.otherModules
  }

  importedModulesNames() {
    return this.importedModules
  }

  merge(anEntropy) {
    const __identifiers = Array.isArray(anEntropy.delegate.divisor._divisor) ? anEntropy.delegate.divisor._divisor : anEntropy.delegate.divisor._divisor.identifiers()
    __identifiers.forEach(eachDivisor => this._identifiers.add(eachDivisor))
  }

  addDefinitions(anEntropy) {
    anEntropy.definitions().forEach(eachId => this._identifiers.add(eachId))
  }

  identifiers() {
    return Array.from(this._identifiers)
  }

  identifiersCount() {
    return this.source.length
  }
}