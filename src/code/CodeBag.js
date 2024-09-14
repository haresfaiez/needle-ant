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

  clone() {
    return new CodeBag(new Map(this.elements))
  }

  merge(anotherCodeBag) {
    this.elements = new Map(this.elements);
    [...anotherCodeBag.elements.values()].forEach(eachCodeSlices => this.putAll(eachCodeSlices))
  }

  put(codeSlice) {
    this.putAll([codeSlice])
  }

  otherCodeSlices(codeSlice) {
    const existing = this.elements.get(codeSlice.raw) || []
    return existing.filter(
      each => each.start !== codeSlice.start && each.end !== codeSlice.end
    )
  }

  putAll(codeSlicesToAdd = []) {
    codeSlicesToAdd.forEach(eachCodeSliceToAdd => {
      const newCodeSlices = [
        ...this.otherCodeSlices(eachCodeSliceToAdd),
        eachCodeSliceToAdd
      ]
      this.elements.set(eachCodeSliceToAdd.raw, newCodeSlices)
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

  static fromAcronNode(node) {
    return node ? this.fromAcronNodes([node]) : this.empty()
  }

  static fromNamedNode(node, name) {
    return new CodeBag(new Map([[name, [new CodeSlice(name, node.start, node.end)]]]))
  }

  static empty() {
    return new CodeBag()
  }
}
