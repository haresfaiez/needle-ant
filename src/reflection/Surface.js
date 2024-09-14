import { CodeBag } from '../code/CodeBag.js'
import { Spectrum } from './Spectrum.js'

// TODO: Rename this
export class Surface {
  constructor(rawSurface = new CodeBag(), accesses = new CodeBag(), clonedSurfaceInstance) {
    this.cloned = clonedSurfaceInstance

    this._identifiers = rawSurface.clone()

    this.importedModules = rawSurface.importedModuleExports
    this.otherModules = rawSurface.otherModules

    this.accesses = accesses
  }

  static clone(aSurface, newIdentifiers = new CodeBag()) {
    const result = new Surface()
    result.accesses = aSurface.accesses
    result.extend(aSurface.identifiers())
    result.extend(newIdentifiers)
    result.cloned = aSurface
    return result
  }

  static fromAccesses(aSurface) {
    return new Surface(aSurface.accesses)
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
    const ast = Spectrum.parse(sourceCode, transformer)
    return new Surface(ast.identifiers())
  }
}

export class MultiModulesSurface extends Surface {
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
