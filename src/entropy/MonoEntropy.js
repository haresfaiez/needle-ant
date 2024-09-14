import { Spectrum } from '../reflection/Spectrum.js'
import { Surface } from '../reflection/Surface.js'
import { FoundCodePath, NotFoundCodePath } from '../code/CodePath.js'

export class MonoEntropy {
  constructor(astNode, surface = new Surface()) {
    this.astNode = astNode
    this.dividend = Spectrum.fromAcornNodes([astNode])
    this.surface = surface
  }

  createFoundCodePath(path) {
    return new FoundCodePath(
      path,
      this.evaluate(),
      this.surface.identifiers()
    )
  }

  navigate(path) {
    return new NotFoundCodePath(path)
  }

  evaluate() {
    throw new Error('`MonoEntropy#evaluate` not implemented yet in `MonoEntropy`!')
  }
}