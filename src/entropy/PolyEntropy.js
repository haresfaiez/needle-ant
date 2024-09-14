import { Spectrum } from '../reflection/Spectrum.js'
import { Surface } from '../reflection/Surface.js'
import { FoundCodePath, NotFoundCodePath } from '../code/CodePath.js'
import { NullEvaluation } from '../evaluation/NullEvaluation.js'

export class PolyEntropy {
  constructor(astNodes, surface = new Surface()) {
    this.astNodes = astNodes.filter(astNode => astNode.type !== 'EmptyStatement')
    this.dividend = Spectrum.fromAcornNodes(astNodes)
    this.surface = surface
  }

  createFoundCodePath(path, entropies) {
    return entropies.reduce(
      (resultCodePath, eachFoundCodePath) => resultCodePath.plus(eachFoundCodePath),
      new FoundCodePath(path, new NullEvaluation(), this.surface.identifiers())
    )
  }

  navigate(path) {
    return new NotFoundCodePath(path)
  }

  evaluate() {
    throw new Error('`PolyEntropy#evaluate` not implemented yet in `PolyEntropy`!')
  } 
}