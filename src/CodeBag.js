import { CodeSlice } from './CodeSlice.js'

// TODO: Move together with CodeSlice to a separate sub-folder
export class CodeBag {
  constructor(elements = new Map()) {
    this.elements = elements
  }

  raws() {
    return [...this.elements.keys()]
  }

  plus(anotherCodeBag) {
    const result = new CodeBag()
    result.elements = new Map(this.elements);
    [...anotherCodeBag.elements.values()].forEach(eachCodeSlices => result.putAll(eachCodeSlices))
    return result
  }

  putAll(codeSlices = []) {
    // TODO: throw error here if codeSlices is empty, or if raw does not exists
    const id = codeSlices[0]?.raw
    const codeSlicesPerId = this.elements.get(id)
    this.elements.set(id, [...(codeSlicesPerId || []), ...codeSlices])
  }

  put(codeSlice) {
    const codeSlicesPerId = this.elements.get(codeSlice.raw)
    this.elements.set(codeSlice.raw, [...(codeSlicesPerId || []), codeSlice])
  }

  collect(sources, collector) {
    for (const eachSource of sources) {
      collector(eachSource, this)
    }
  }

  // TODO: Reomve this
  evaluate() {
    return [...this.elements.keys()]
  }

  // Factories
  static withNullCoordinates(identifiers) {
    const elements =
      identifiers.map(eachIdentifier => [eachIdentifier, [new CodeSlice(eachIdentifier, 0, 0)]])
    return new CodeBag(new Map(elements))
  }

  static fromNodes(nodes) {
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
