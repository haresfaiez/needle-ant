export class Divisor {
  constructor(source, importedModules, otherModules) {
    this.source = source
    this.importedModules = importedModules
    this.otherModules = otherModules
  }

  // TODO: Rename this
  adjacentModules() {
    return this.otherModules
  }

  importedModulesNames() {
    return this.importedModules
  }

  merge(aDivisor) {}

  addDefinitions(aReflexion) {}

  identifiersCount() {
    return this.source.length
  }
}