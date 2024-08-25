import { CodeSlice } from './CodeSlice.js'

export class CodeBag {
  constructor(elements = new Map()) {
    this.elements = elements
  }

  raws() {
    return [...this.elements.keys()]
  }

  plus(anotherCodeBag) {
    const result = new CodeBag()
    result.elements = new Map(this.elements)
    result.merge(anotherCodeBag)
    return result
  }

  merge(anotherCodeBag) {
    this.elements = new Map(this.elements);
    [...anotherCodeBag.elements.values()].forEach(eachCodeSlices => this.putAll(eachCodeSlices))
  }

  put(codeSlice) {
    this.putAll([codeSlice])
  }

  putAll(codeSlices = []) {
    codeSlices.forEach(eachCodeSlice => {
      const codeSlicesPerId = this.elements.get(eachCodeSlice.raw)
      this.elements.set(eachCodeSlice.raw, [...(codeSlicesPerId || []), eachCodeSlice])
    })
  }

  collect(sources, collector) {
    for (const eachSource of sources) {
      collector(eachSource, this)
    }
  }

  // Factories
  static withNullCoordinates(identifiers) {
    const elements =
      identifiers.map(eachIdentifier => [eachIdentifier, [new CodeSlice(eachIdentifier, 0, 0)]])
    return new CodeBag(new Map(elements))
  }

  static fromAcronNodes(nodes) {
    const elements = nodes
      .map(eachNode => [eachNode.name, [new CodeSlice(eachNode.name, eachNode.start, eachNode.end)]])
    return new CodeBag(new Map(elements))
  }

  static fromNamedNode(node, name) {
    return new CodeBag(new Map([[name, [new CodeSlice(name, node.start, node.end)]]]))
  }

  static empty() {
    return new CodeBag()
  }
}
